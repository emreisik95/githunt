import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
export type ViewType = 'list' | 'grid'
export type DateJump = 'day' | 'week' | 'month'
export type FontFamily = 'geist' | 'inter' | 'system' | 'mono'
export type FontSize = 'small' | 'medium' | 'large'
export type LineHeight = 'compact' | 'normal' | 'relaxed'
export type Density = 'compact' | 'comfortable' | 'spacious'

interface PreferencesState {
  // Display
  theme: Theme
  language: string  // Keep for backwards compatibility
  languages: string[]  // New multi-language support
  viewType: ViewType
  dateJump: DateJump
  token: string | null

  // Accessibility
  fontSize: FontSize
  fontFamily: FontFamily
  lineHeight: LineHeight
  density: Density
  reducedMotion: boolean
  highContrast: boolean
  dimSeenRepos: boolean

  // Actions
  setTheme: (theme: Theme) => void
  setLanguage: (language: string) => void
  setLanguages: (languages: string[]) => void
  toggleLanguage: (language: string) => void
  clearLanguages: () => void
  setViewType: (viewType: ViewType) => void
  setDateJump: (dateJump: DateJump) => void
  setToken: (token: string | null) => void
  setFontSize: (fontSize: FontSize) => void
  setFontFamily: (fontFamily: FontFamily) => void
  setLineHeight: (lineHeight: LineHeight) => void
  setDensity: (density: Density) => void
  setReducedMotion: (reducedMotion: boolean) => void
  setHighContrast: (highContrast: boolean) => void
  setDimSeenRepos: (dimSeenRepos: boolean) => void
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      // Display defaults
      theme: 'system',
      language: '',
      languages: [],
      viewType: 'list',
      dateJump: 'week',
      token: null,

      // Accessibility defaults
      fontSize: 'medium',
      fontFamily: 'geist',
      lineHeight: 'normal',
      density: 'comfortable',
      reducedMotion: false,
      highContrast: false,
      dimSeenRepos: false,

      // Actions
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setLanguages: (languages) => set({ languages: languages.slice(0, 5) }),  // Max 5 languages
      toggleLanguage: (language) => {
        const current = get().languages
        if (current.includes(language)) {
          set({ languages: current.filter((l) => l !== language) })
        } else if (current.length < 5) {
          set({ languages: [...current, language] })
        }
      },
      clearLanguages: () => set({ languages: [] }),
      setViewType: (viewType) => set({ viewType }),
      setDateJump: (dateJump) => set({ dateJump }),
      setToken: (token) => set({ token }),
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setDensity: (density) => set({ density }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setDimSeenRepos: (dimSeenRepos) => set({ dimSeenRepos }),
    }),
    {
      name: 'githunt-preferences',
    }
  )
)
