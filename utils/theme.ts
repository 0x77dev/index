// OKLCH to RGB conversion utilities
// Based on https://gist.github.com/dkaraush/65d19d61396f5f3cd8ba7d1b4b3c9432

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
  // Parse: oklch(L% C H) or oklch(L C H)
  const match = oklchString.match(/oklch\(\s*([0-9.]+)%?\s+([0-9.]+)\s+([0-9.]+)\s*\)/)
  if (!match) return null

  const l = parseFloat(match[1]) / 100 // Convert percentage to 0-1
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

/**
 * Convert any CSS color format to hex
 * Supports: oklch, rgb, hex
 */
export const cssColorToHex = (color: string): string => {
  const trimmed = color.trim()

  // Already hex
  if (trimmed.startsWith('#')) {
    return trimmed
  }

  // RGB/RGBA format
  if (trimmed.startsWith('rgb')) {
    return rgbStringToHex(trimmed)
  }

  // OKLCH format
  if (trimmed.startsWith('oklch(')) {
    const parsed = parseOklch(trimmed)
    if (parsed) {
      const rgb = oklch2rgb(parsed)
      return rgbToHex(rgb)
    }
  }

  // Fallback: use browser conversion via temporary element
  if (typeof document !== 'undefined') {
    const temp = document.createElement('div')
    temp.style.color = trimmed
    document.body.appendChild(temp)
    const computedColor = getComputedStyle(temp).color
    document.body.removeChild(temp)

    if (computedColor.startsWith('rgb')) {
      return rgbStringToHex(computedColor)
    }
  }

  // Final fallback
  return '#000000'
}

/**
 * Get a CSS variable value and convert it to hex
 */
export const getCssColorVariable = (variableName: string): string => {
  if (typeof document === 'undefined') return '#000000'

  const root = document.documentElement
  const value = getComputedStyle(root).getPropertyValue(variableName).trim()

  if (!value) return '#000000'

  return cssColorToHex(value)
}
