import { Link, useLocation } from 'react-router-dom'
import { GithubLogo, Gear, Moon, Sun, Monitor, BookmarkSimple, RssSimple } from '@phosphor-icons/react'
import { usePreferences, type Theme } from '@/stores/preferences'
import { useBookmarks } from '@/stores/bookmarks'
import { cn } from '@/lib/utils'

const themeIcons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const themeOrder: Theme[] = ['system', 'light', 'dark']

export function TopNav() {
  const { theme, setTheme } = usePreferences()
  const { bookmarks } = useBookmarks()
  const location = useLocation()

  const cycleTheme = () => {
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    setTheme(themeOrder[nextIndex])
  }

  const ThemeIcon = themeIcons[theme]
  const bookmarkCount = bookmarks.length

  return (
    <header className="sticky top-0 z-50 h-12 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className={cn(
            'flex items-center gap-2 transition-colors',
            location.pathname === '/' ? 'text-foreground' : 'text-muted hover:text-foreground'
          )}
        >
          <GithubLogo size={24} weight="fill" />
          <span className="hidden font-semibold tracking-tight sm:inline">
            GitHunt
          </span>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* Bookmarks */}
          <Link
            to="/bookmarks"
            className={cn(
              'relative flex h-8 items-center gap-1.5 rounded-md px-2',
              'text-sm transition-colors',
              location.pathname === '/bookmarks'
                ? 'bg-accent/10 text-accent'
                : 'text-muted hover:bg-surface hover:text-foreground'
            )}
            aria-label="Saved repositories"
          >
            <BookmarkSimple size={18} weight={location.pathname === '/bookmarks' ? 'fill' : 'regular'} />
            {bookmarkCount > 0 && (
              <span className="font-mono text-xs">{bookmarkCount}</span>
            )}
          </Link>

          {/* Theme toggle */}
          <button
            onClick={cycleTheme}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              'text-muted transition-colors',
              'hover:bg-surface hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            aria-label={`Current theme: ${theme}. Click to change.`}
          >
            <ThemeIcon size={18} />
          </button>

          {/* RSS */}
          <Link
            to="/rss"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              'transition-colors',
              location.pathname === '/rss'
                ? 'bg-accent/10 text-accent'
                : 'text-muted hover:bg-surface hover:text-foreground'
            )}
            aria-label="RSS Feed"
          >
            <RssSimple size={18} weight={location.pathname === '/rss' ? 'fill' : 'regular'} />
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              'transition-colors',
              location.pathname === '/settings'
                ? 'bg-accent/10 text-accent'
                : 'text-muted hover:bg-surface hover:text-foreground'
            )}
            aria-label="Settings"
          >
            <Gear size={18} />
          </Link>
        </div>
      </div>
    </header>
  )
}
