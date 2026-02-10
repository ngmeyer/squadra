interface ThemeColors {
  primary: string
  secondary: string
}

export function applyStoreTheme(colors: ThemeColors) {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Apply CSS variables
  root.style.setProperty('--store-primary', colors.primary)
  root.style.setProperty('--store-secondary', colors.secondary)
}

export function getStoreCSSVariables(colors: ThemeColors): string {
  return `
    :root {
      --store-primary: ${colors.primary};
      --store-secondary: ${colors.secondary};
    }
  `.trim()
}

export function parseThemeColors(jsonColors: any): ThemeColors {
  if (typeof jsonColors === 'string') {
    try {
      jsonColors = JSON.parse(jsonColors)
    } catch {
      // If parsing fails, use defaults
      return {
        primary: '#0f172a',
        secondary: '#64748b'
      }
    }
  }

  return {
    primary: jsonColors?.primary || '#0f172a',
    secondary: jsonColors?.secondary || '#64748b'
  }
}
