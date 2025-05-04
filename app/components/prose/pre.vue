<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { useDebounceFn } from '@vueuse/core'
import type { MermaidConfig, RenderResult } from 'mermaid'
import mermaid from 'mermaid'
import OriginalPre from '#ui-pro/components/prose/Pre.vue'

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
const renderedDiagram = ref<{ svg: string, diagramType: string } | null>(null)
const lastSuccessfulDiagram = ref<{ svg: string, diagramType: string } | null>(null)
const activeTab = ref('source')

const diagramCache = reactive(new Map<string, { svg: string, diagramType: string }>())

const getMermaidConfig = (darkMode: boolean): MermaidConfig => ({
  theme: darkMode ? 'dark' : 'default',
  startOnLoad: false,
  darkMode,
  fontFamily: 'inherit',
  fontSize: 14,
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    padding: 8
  },
  sequence: {
    mirrorActors: false,
    bottomMarginAdj: 10,
    useMaxWidth: true,
    boxMargin: 10
  },
  pie: { useMaxWidth: true },
  gitGraph: { useMaxWidth: true },
  markdownAutoWrap: true,
  er: { useMaxWidth: true },
  gantt: { useMaxWidth: true },
  suppressErrorRendering: true,
  securityLevel: 'loose'
})

const initializeOrUpdateMermaid = async (darkMode: boolean) => {
  if (!import.meta.client) return

  const newTheme = darkMode ? 'dark' : 'light'
  if (mermaidInitialized.value && newTheme === currentMermaidTheme.value) {
    return
  }

  console.log(`Initializing/Updating Mermaid with theme: ${newTheme}`)
  try {
    await mermaid.initialize(getMermaidConfig(darkMode))
    mermaidInitialized.value = true
    if (newTheme !== currentMermaidTheme.value) {
      console.log('Mermaid theme changed, clearing cache.')
      diagramCache.clear()
    }
    currentMermaidTheme.value = newTheme
  } catch (err) {
    console.error('Failed to initialize/update Mermaid:', err)
    error.value = err instanceof Error ? err : new Error('Failed to initialize Mermaid')
    mermaidInitialized.value = false
  }
}

const renderMermaidDiagram = async (diagramCode: string): Promise<{ svg: string, diagramType: string } | null> => {
  if (!import.meta.client || !diagramCode.trim()) return null

  const isDark = colorMode.value === 'dark'
  await initializeOrUpdateMermaid(isDark)

  if (!mermaidInitialized.value) {
    throw new Error('Mermaid failed to initialize.')
  }

  const cacheKey = `${diagramCode.trim()}-${currentMermaidTheme.value}`
  if (diagramCache.has(cacheKey)) {
    console.log('Using cached Mermaid diagram for key:', cacheKey)
    return diagramCache.get(cacheKey)!
  }

  console.log('Rendering new Mermaid diagram for key:', cacheKey)
  const diagramId = `mermaid-${instance?.uid || Math.random().toString(36).substring(2, 9)}`

  try {
    const result: RenderResult = await mermaid.render(diagramId, diagramCode.trim())
    const diagramData = { svg: result.svg, diagramType: 'Mermaid Diagram' }
    diagramCache.set(cacheKey, diagramData)
    return diagramData
  } catch (err) {
    console.error('Failed to render Mermaid diagram:', err)
    throw err
  }
}

const debouncedRender = useDebounceFn(async () => {
  if (!isMermaid.value || !code.value?.trim()) {
    return
  }

  loading.value = true
  error.value = null

  try {
    const result = await renderMermaidDiagram(code.value)
    if (result) {
      renderedDiagram.value = result
      lastSuccessfulDiagram.value = result
      if (items.value.some(item => item.value === 'mermaid')) {
        activeTab.value = 'mermaid'
      } else {
        activeTab.value = 'source'
      }
    } else {
      console.warn('Mermaid rendering returned null (likely client-side issue or empty code).')
    }
  } catch (err) {
    console.error('Error during debounced render:', err)
    error.value = err instanceof Error ? err : new Error('Failed to render diagram')
    renderedDiagram.value = null
    activeTab.value = 'error'
  } finally {
    loading.value = false
  }
}, 500)

watch(colorMode, async () => {
  if (!isMermaid.value) return

  console.log('Color mode changed, triggering potential Mermaid update.')
  await debouncedRender()
})

watch(code, (newCode, oldCode) => {
  if (import.meta.client && isMermaid.value && newCode !== oldCode) {
    console.log('Code changed, triggering Mermaid render.')
    debouncedRender()
  }
}, { deep: true })

onMounted(() => {
  if (import.meta.client && isMermaid.value) {
    console.log('Component mounted with Mermaid code, triggering initial render.')
    debouncedRender()
  }
})

const items = computed(() => {
  if (!isMermaid.value) return []

  const tabs: TabsItem[] = []

  tabs.push({
    label: 'Source Code',
    slot: 'source' as const,
    value: 'source'
  })

  if (lastSuccessfulDiagram.value || loading.value) {
    tabs.unshift({
      label: lastSuccessfulDiagram.value?.diagramType || 'Diagram',
      slot: 'mermaid' as const,
      value: 'mermaid'
    })
  }

  if (error.value && !lastSuccessfulDiagram.value) {
    tabs.push({
      label: 'Error',
      slot: 'error' as const,
      value: 'error'
    })
  }

  return tabs
})

watch(items, (newItems) => {
  if (newItems.length > 0 && !newItems.some(tab => tab.value === activeTab.value)) {
    const firstValue = newItems[0]?.value
    if (firstValue !== undefined) {
      activeTab.value = String(firstValue)
    }
  }
}, { immediate: true })
</script>

<template>
  <UTabs
    v-if="isMermaid"
    v-model="activeTab"
    :items="items"
    class="w-full"
    color="neutral"
    activation-mode="automatic"
    size="sm"
  >
    <template #mermaid>
      <UCard class="mb-2 relative min-h-[100px]">
        <div
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center"
        >
          <UIcon
            name="i-svg-spinners-180-ring-with-bg"
            class="text-3xl text-primary"
          />
        </div>
        <div
          v-if="lastSuccessfulDiagram"
          class="overflow-auto"
          v-html="lastSuccessfulDiagram.svg"
        />
      </UCard>
    </template>

    <template #source>
      <OriginalPre
        :code="code"
        :language="language"
        v-bind="$attrs"
      >
        <slot />
      </OriginalPre>
    </template>

    <template #error>
      <UAlert
        v-if="error"
        title="Preview failed"
        :description="error?.message"
        color="error"
        class="mb-2"
        variant="outline"
      />
    </template>
  </UTabs>
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
