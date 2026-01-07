import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom'
import { usePreferences } from '@/stores/preferences'
import { ToastProvider } from '@/components/toast'
import { TopNav } from '@/components/top-nav'
import { Feed } from '@/pages/feed'
import { Bookmarks } from '@/pages/bookmarks'
import { Settings } from '@/pages/settings'
import { RSS } from '@/pages/rss'

// Use MemoryRouter for Chrome extension (no URL bar)
const Router = import.meta.env.MODE === 'chrome' ? MemoryRouter : BrowserRouter

function App() {
  const {
    theme,
    fontSize,
    fontFamily,
    lineHeight,
    density,
    reducedMotion,
    highContrast,
  } = usePreferences()

  // Apply theme and accessibility classes to document
  useEffect(() => {
    const root = document.documentElement

    // Theme
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemDark)

      const listener = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches)
      }

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement

    // Font size
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large')
    root.classList.add(`font-size-${fontSize}`)

    // Font family
    root.classList.remove('font-geist', 'font-inter', 'font-system', 'font-mono-family')
    root.classList.add(`font-${fontFamily === 'mono' ? 'mono-family' : fontFamily}`)

    // Line height
    root.classList.remove('line-height-compact', 'line-height-normal', 'line-height-relaxed')
    root.classList.add(`line-height-${lineHeight}`)

    // Density
    root.classList.remove('density-compact', 'density-comfortable', 'density-spacious')
    root.classList.add(`density-${density}`)

    // Reduced motion
    root.classList.toggle('reduce-motion', reducedMotion)

    // High contrast
    root.classList.toggle('high-contrast', highContrast)
  }, [fontSize, fontFamily, lineHeight, density, reducedMotion, highContrast])

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <TopNav />
          <main className="safe-bottom">
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/rss" element={<RSS />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  )
}

export default App
