<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import type { MermaidConfig, RenderResult } from 'mermaid'
import mermaid from 'mermaid'
import OriginalPre from '#ui/components/prose/Pre.vue'

const props = defineProps<{
  code?: string
  language?: string
}>()

const { code, language } = toRefs(props)

const instance = getCurrentInstance()
const colorMode = useColorMode()

const isMermaid = computed(() => language.value === 'mermaid')

const mermaidInitialized = ref(false)
const currentMermaidTheme = ref(colorMode.value)
const loading = ref(false)
const error = ref<Error | null>(null)
const renderedDiagram = ref<string | null>(null)

const diagramCache = reactive(new Map<string, string>())

// OKLCH to RGB conversion
const multiplyMatrices = (A: number[], B: number[]): number[] =>
  [0, 1, 2].map(i => A[i * 3] * B[0] + A[i * 3 + 1] * B[1] + A[i * 3 + 2] * B[2])

const oklch2oklab = ([l, c, h]: [number, number, number]): [number, number, number] => [
  l,
  isNaN(h) ? 0 : c * Math.cos((h * Math.PI) / 180),
  isNaN(h) ? 0 : c * Math.sin((h * Math.PI) / 180)
]

const oklab2xyz = (lab: [number, number, number]): number[] => {
  const LMSg = multiplyMatrices(
    [1, 0.3963377773761749, 0.2158037573099136, 1, -0.1055613458156586, -0.0638541728258133, 1, -0.0894841775298119, -1.2914855480194092],
    lab
  )
  const LMS = LMSg.map(val => val ** 3)
  return multiplyMatrices(
    [1.2268798758459243, -0.5578149944602171, 0.2813910456659647, -0.0405757452148008, 1.1122868032803170, -0.0717110580655164, -0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
    LMS
  )
}

const xyz2rgbLinear = (xyz: number[]): number[] => {
  return multiplyMatrices(
    [3.2409699419045226, -1.537383177570094, -0.4986107602930034, -0.9692436362808796, 1.8759675015077202, 0.04155505740717559, 0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
    xyz
  )
}

const srgbLinear2rgb = (rgb: number[]): number[] =>
  rgb.map(c => (Math.abs(c) > 0.0031308 ? (c < 0 ? -1 : 1) * (1.055 * Math.abs(c) ** (1 / 2.4) - 0.055) : 12.92 * c))

const oklch2rgb = (lch: [number, number, number]): number[] => srgbLinear2rgb(xyz2rgbLinear(oklab2xyz(oklch2oklab(lch))))

const rgbToHex = (rgb: number[]): string => {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n * 255)))
    return clamped.toString(16).padStart(2, '0')
  }
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`
}

const parseOklch = (oklchString: string): [number, number, number] | null => {
  const match = oklchString.match(/oklch\(\s*([0-9.]+)%?\s+([0-9.]+)\s+([0-9.]+)\s*\)/)
  if (!match) return null
  const l = parseFloat(match[1]) / 100
  const c = parseFloat(match[2])
  const h = parseFloat(match[3])
  return [l, c, h]
}

const rgbStringToHex = (rgb: string): string => {
  // Match rgb() or rgba()
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)$/)
  if (!match) return rgb

  const hex = (n: number) => n.toString(16).padStart(2, '0')
  const r = hex(Number(match[1]))
  const g = hex(Number(match[2]))
  const b = hex(Number(match[3]))

  // Handle alpha channel if present
  if (match[4] !== undefined) {
    const alpha = Math.round(parseFloat(match[4]) * 255)
    return `#${r}${g}${b}${hex(alpha)}`
  }

  return `#${r}${g}${b}`
}

const cssColorToHex = (color: string): string => {
  const trimmed = color.trim()
  if (trimmed.startsWith('#')) return trimmed
  if (trimmed.startsWith('rgb')) return rgbStringToHex(trimmed)
  if (trimmed.startsWith('oklch(')) {
    const parsed = parseOklch(trimmed)
    if (parsed) return rgbToHex(oklch2rgb(parsed))
  }
  return '#000000'
}

const getCssColor = (colorVar: string): string => {
  if (!import.meta.client) return '#000000'

  const root = document.documentElement
  const rawValue = getComputedStyle(root).getPropertyValue(colorVar).trim()
  if (!rawValue) return '#000000'

  const result = cssColorToHex(rawValue)
  console.log(`[Mermaid] CSS Color resolved: ${colorVar} -> ${rawValue} -> ${result}`)
  return result
}

const getMermaidConfig = (darkMode: boolean): MermaidConfig => {
  const themeVariables = import.meta.client
    ? {
        darkMode,
        background: getCssColor(darkMode ? '--color-zinc-950' : '--color-zinc-50'),
        primaryColor: getCssColor(darkMode ? '--color-zinc-800' : '--color-zinc-100'),
        primaryTextColor: getCssColor(darkMode ? '--color-zinc-200' : '--color-zinc-900'),
        primaryBorderColor: getCssColor(darkMode ? '--color-zinc-700' : '--color-zinc-400'),
        secondaryColor: getCssColor(darkMode ? '--color-zinc-900' : '--color-zinc-200'),
        secondaryTextColor: getCssColor(darkMode ? '--color-zinc-300' : '--color-zinc-800'),
        secondaryBorderColor: getCssColor(darkMode ? '--color-zinc-700' : '--color-zinc-500'),
        tertiaryColor: getCssColor(darkMode ? '--color-zinc-800' : '--color-zinc-300'),
        tertiaryTextColor: getCssColor(darkMode ? '--color-zinc-100' : '--color-zinc-700'),
        tertiaryBorderColor: getCssColor(darkMode ? '--color-zinc-600' : '--color-zinc-600'),
        lineColor: getCssColor(darkMode ? '--color-zinc-600' : '--color-zinc-600'),
        textColor: getCssColor(darkMode ? '--color-zinc-100' : '--color-zinc-900'),
        mainBkg: getCssColor(darkMode ? '--color-zinc-900' : '--color-zinc-100'),
        nodeBorder: getCssColor(darkMode ? '--color-zinc-600' : '--color-zinc-400'),
        clusterBkg: getCssColor(darkMode ? '--color-zinc-800' : '--color-zinc-200'),
        clusterBorder: getCssColor(darkMode ? '--color-zinc-700' : '--color-zinc-500'),
        defaultLinkColor: getCssColor(darkMode ? '--color-zinc-400' : '--color-zinc-500')
      }
    : { darkMode }

  const fontFamily = import.meta.client
    ? getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'inherit'
    : 'inherit'

  return {
    theme: 'base',
    startOnLoad: false,
    darkMode,
    fontFamily,
    fontSize: 14,
    themeVariables,
    flowchart: { htmlLabels: true, curve: 'basis', padding: 8 },
    sequence: { mirrorActors: false, bottomMarginAdj: 10, useMaxWidth: true, boxMargin: 10 },
    pie: { useMaxWidth: true },
    gitGraph: { useMaxWidth: true },
    markdownAutoWrap: true,
    er: { useMaxWidth: true },
    gantt: { useMaxWidth: true },
    suppressErrorRendering: true,
    securityLevel: 'loose'
  }
}

const initializeOrUpdateMermaid = async (darkMode: boolean) => {
  if (!import.meta.client) return

  const newTheme = darkMode ? 'dark' : 'light'
  if (mermaidInitialized.value && newTheme === currentMermaidTheme.value) return

  console.log(`[Mermaid] Initializing with theme: ${newTheme}`)

  try {
    const config = getMermaidConfig(darkMode)
    console.log('[Mermaid] Config:', config)
    await mermaid.initialize(config)
    mermaidInitialized.value = true
    if (newTheme !== currentMermaidTheme.value) {
      console.log('[Mermaid] Theme changed, clearing cache')
      diagramCache.clear()
    }
    currentMermaidTheme.value = newTheme
    console.log('[Mermaid] Initialization successful')
  } catch (err) {
    console.error('[Mermaid] Initialization failed:', err)
    console.error('[Mermaid] Error details:', {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    })
    error.value = err instanceof Error ? err : new Error('Failed to initialize Mermaid')
    mermaidInitialized.value = false
  }
}

const renderMermaidDiagram = async (diagramCode: string): Promise<string | null> => {
  if (!import.meta.client || !diagramCode.trim()) return null

  const isDark = colorMode.value === 'dark'
  await initializeOrUpdateMermaid(isDark)

  if (!mermaidInitialized.value) {
    const error = new Error('Mermaid failed to initialize.')
    console.error('[Mermaid] Render aborted:', error.message)
    throw error
  }

  const cacheKey = `${diagramCode.trim()}-${currentMermaidTheme.value}`
  if (diagramCache.has(cacheKey)) {
    console.log('[Mermaid] Using cached diagram for key:', cacheKey.substring(0, 50) + '...')
    return diagramCache.get(cacheKey)!
  }

  const diagramId = `mermaid-${instance?.uid || Math.random().toString(36).substring(2, 9)}`

  console.log('[Mermaid] Rendering diagram:', {
    id: diagramId,
    codeLength: diagramCode.length,
    codePreview: diagramCode.substring(0, 100) + (diagramCode.length > 100 ? '...' : '')
  })

  try {
    const result: RenderResult = await mermaid.render(diagramId, diagramCode.trim())
    diagramCache.set(cacheKey, result.svg)
    console.log('[Mermaid] Render successful, SVG length:', result.svg.length)
    return result.svg
  } catch (err) {
    console.error('[Mermaid] Render failed:', err)
    console.error('[Mermaid] Failed diagram code:', diagramCode)
    console.error('[Mermaid] Error details:', {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    })
    throw err
  }
}

const debouncedRender = useDebounceFn(async () => {
  if (!isMermaid.value || !code.value?.trim()) return

  console.log('[Mermaid] Starting debounced render')
  loading.value = true
  error.value = null

  try {
    const result = await renderMermaidDiagram(code.value)
    renderedDiagram.value = result
    console.log('[Mermaid] Debounced render complete')
  } catch (err) {
    console.error('[Mermaid] Debounced render error:', err)
    error.value = err instanceof Error ? err : new Error('Failed to render diagram')
    renderedDiagram.value = null
  } finally {
    loading.value = false
  }
}, 500)

watch(colorMode, (newMode) => {
  if (isMermaid.value) {
    console.log('[Mermaid] Color mode changed to:', newMode)
    debouncedRender()
  }
})

watch(code, (newCode, oldCode) => {
  if (import.meta.client && isMermaid.value && newCode !== oldCode) {
    console.log('[Mermaid] Code changed, triggering render')
    debouncedRender()
  }
})

onMounted(() => {
  if (import.meta.client && isMermaid.value) {
    console.log('[Mermaid] Component mounted, triggering initial render')
    debouncedRender()
  }
})
</script>

<template>
  <div v-if="isMermaid">
    <UCard
      v-if="renderedDiagram || loading"
      class="mb-4 relative min-h-[100px]"
    >
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center"
      >
        <UIcon
          name="i-svg-spinners-180-ring-with-bg"
          class="text-3xl text-primary"
        />
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div
        v-if="renderedDiagram"
        class="overflow-auto"
        v-html="renderedDiagram"
      />
    </UCard>
    <UAlert
      v-if="error"
      title="Diagram rendering failed"
      :description="error.message"
      color="error"
      class="mb-4"
      variant="outline"
    />
  </div>
  <OriginalPre
    v-else
    :code="code"
    :language="language"
    v-bind="$attrs"
  >
    <slot />
  </OriginalPre>
</template>

<style>
.iconify {
  --shiki-dark-bg: var(--ui-text);
  --shiki-light-bg: var(--ui-text);
}
</style>
