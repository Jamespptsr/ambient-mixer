import { useState, useEffect, useCallback } from 'react'

const THEME_KEY = 'softmurmur-theme'

const THEMES = [
  { id: 'sakura', label: 'Sakura', color: '#f472b6', bg: '#1a0a12' },
  { id: 'deep-blue', label: 'Ocean', color: '#60a5fa', bg: '#080c18' },
  { id: 'forest', label: 'Forest', color: '#4ade80', bg: '#0a1a0e' },
  { id: 'amber', label: 'Amber', color: '#fbbf24', bg: '#1a140a' },
  { id: 'lavender', label: 'Lavender', color: '#a78bfa', bg: '#120a1a' },
  { id: 'slate', label: 'Slate', color: '#94a3b8', bg: '#101214' },
]

export { THEMES }

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'sakura'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
    const entry = THEMES.find(t => t.id === theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', entry?.bg || THEMES[0].bg)
  }, [theme])

  const setThemeById = useCallback((id) => {
    setTheme(id)
  }, [])

  // Keep toggleTheme for backwards compat (cycles through all)
  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const idx = THEMES.findIndex(th => th.id === t)
      return THEMES[(idx + 1) % THEMES.length].id
    })
  }, [])

  return { theme, setTheme: setThemeById, toggleTheme }
}
