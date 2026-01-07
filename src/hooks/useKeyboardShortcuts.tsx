import { useEffect, useCallback } from 'react'

interface KeyboardShortcuts {
  onNavigateUp: () => void
  onNavigateDown: () => void
  onOpen: () => void
  onBookmark: () => void
  onToggleGrid: () => void
  onToggleTheme: () => void
  onEscape: () => void
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcuts,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Ignore if modal/sheet is blocking
      if (!enabled) return

      switch (e.key.toLowerCase()) {
        case 'j':
          e.preventDefault()
          shortcuts.onNavigateDown()
          break
        case 'k':
          e.preventDefault()
          shortcuts.onNavigateUp()
          break
        case 'o':
        case 'enter':
          e.preventDefault()
          shortcuts.onOpen()
          break
        case 's':
          e.preventDefault()
          shortcuts.onBookmark()
          break
        case 'g':
          e.preventDefault()
          shortcuts.onToggleGrid()
          break
        case 't':
          e.preventDefault()
          shortcuts.onToggleTheme()
          break
        case 'escape':
          e.preventDefault()
          shortcuts.onEscape()
          break
        case '?':
          // Show help - could implement a help modal
          break
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export function KeyboardShortcutsHelp() {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
      <ShortcutItem keys={['j']} description="Next repository" />
      <ShortcutItem keys={['k']} description="Previous repository" />
      <ShortcutItem keys={['o', '↵']} description="Open preview" />
      <ShortcutItem keys={['s']} description="Toggle bookmark" />
      <ShortcutItem keys={['g']} description="Toggle grid/list" />
      <ShortcutItem keys={['t']} description="Cycle theme" />
      <ShortcutItem keys={['esc']} description="Close modal" />
    </div>
  )
}

function ShortcutItem({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <span key={i}>
            {i > 0 && <span className="text-muted">/</span>}
            <kbd className="rounded bg-muted/20 px-1.5 py-0.5 font-mono text-foreground">
              {key}
            </kbd>
          </span>
        ))}
      </div>
      <span className="text-muted">{description}</span>
    </div>
  )
}
