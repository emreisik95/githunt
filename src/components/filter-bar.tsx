import { CaretDown, ListBullets, SquaresFour, Calendar, Code } from '@phosphor-icons/react'
import { usePreferences, type DateJump, type ViewType } from '@/stores/preferences'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/bottom-sheet'
import languages from '@/data/languages.json'
import { useState, useRef, useEffect } from 'react'

const DATE_JUMP_OPTIONS: { value: DateJump; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
]

// Popular languages shown at top
const POPULAR_LANGUAGES = [
  '', 'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go',
  'Java', 'C++', 'C#', 'Swift', 'Kotlin', 'Ruby', 'PHP'
]

export function FilterBar() {
  const { language, setLanguage, dateJump, setDateJump, viewType, setViewType } = usePreferences()
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [mobileSheetType, setMobileSheetType] = useState<'language' | 'date'>('language')

  const openLanguageSheet = () => {
    setMobileSheetType('language')
    setMobileSheetOpen(true)
  }

  const openDateSheet = () => {
    setMobileSheetType('date')
    setMobileSheetOpen(true)
  }

  const selectedLanguageLabel = language || 'All Languages'
  const selectedDateLabel = DATE_JUMP_OPTIONS.find(o => o.value === dateJump)?.label || 'Weekly'

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Desktop Filters */}
        <div className="hidden sm:contents">
          <LanguageSelect value={language} onChange={setLanguage} />
          <DateJumpSelect value={dateJump} onChange={setDateJump} />
        </div>

        {/* Mobile Filter Buttons */}
        <button
          onClick={openLanguageSheet}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 sm:hidden',
            'text-sm font-medium transition-colors',
            language && 'text-accent'
          )}
        >
          <Code size={16} className="text-muted" />
          <span className="max-w-[100px] truncate">{selectedLanguageLabel}</span>
        </button>

        <button
          onClick={openDateSheet}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 sm:hidden',
            'text-sm font-medium transition-colors'
          )}
        >
          <Calendar size={16} className="text-muted" />
          <span>{selectedDateLabel}</span>
        </button>

        {/* View Toggle - hidden on mobile */}
        <div className="ml-auto hidden sm:block">
          <ViewToggle value={viewType} onChange={setViewType} />
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <BottomSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        title={mobileSheetType === 'language' ? 'Select Language' : 'Select Time Period'}
      >
        {mobileSheetType === 'language' ? (
          <MobileLanguageList
            value={language}
            onChange={(val) => {
              setLanguage(val)
              setMobileSheetOpen(false)
            }}
          />
        ) : (
          <MobileDateList
            value={dateJump}
            onChange={(val) => {
              setDateJump(val)
              setMobileSheetOpen(false)
            }}
          />
        )}
      </BottomSheet>
    </>
  )
}

interface SelectProps<T> {
  value: T
  onChange: (value: T) => void
}

function LanguageSelect({ value, onChange }: SelectProps<string>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selectedLabel = value || 'All Languages'

  const filteredLanguages = search
    ? languages.filter(l => l.title.toLowerCase().includes(search.toLowerCase()))
    : [
        ...languages.filter(l => POPULAR_LANGUAGES.includes(l.value)),
        { title: '───────────', value: '__divider__' },
        ...languages.filter(l => !POPULAR_LANGUAGES.includes(l.value))
      ]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-surface px-3',
          'text-sm font-medium transition-colors',
          'hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          value && 'text-accent'
        )}
      >
        <Code size={16} className="text-muted" />
        <span className="max-w-[120px] truncate sm:max-w-none">{selectedLabel}</span>
        <CaretDown size={14} className={cn('text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 animate-slide-down rounded-lg border border-border bg-surface p-1 shadow-lg">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search languages..."
            className="mb-1 h-8 w-full rounded-md border-0 bg-background px-2 text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <div className="max-h-64 overflow-y-auto">
            {filteredLanguages.map((lang) => (
              lang.value === '__divider__' ? (
                <div key="divider" className="my-1 border-t border-border" />
              ) : (
                <button
                  key={lang.value}
                  onClick={() => {
                    onChange(lang.value)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={cn(
                    'flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm',
                    'transition-colors hover:bg-muted/10',
                    value === lang.value && 'bg-accent/10 text-accent'
                  )}
                >
                  {lang.title}
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DateJumpSelect({ value, onChange }: SelectProps<DateJump>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selectedLabel = DATE_JUMP_OPTIONS.find(o => o.value === value)?.label || 'Weekly'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-surface px-3',
          'text-sm font-medium transition-colors',
          'hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
      >
        <Calendar size={16} className="text-muted" />
        <span>{selectedLabel}</span>
        <CaretDown size={14} className={cn('text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-32 animate-slide-down rounded-lg border border-border bg-surface p-1 shadow-lg">
          {DATE_JUMP_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm',
                'transition-colors hover:bg-muted/10',
                value === option.value && 'bg-accent/10 text-accent'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ViewToggle({ value, onChange }: SelectProps<ViewType>) {
  return (
    <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
      <button
        onClick={() => onChange('list')}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded transition-colors',
          value === 'list' ? 'bg-accent/20 text-accent' : 'text-muted hover:text-foreground'
        )}
        aria-label="List view"
      >
        <ListBullets size={16} />
      </button>
      <button
        onClick={() => onChange('grid')}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded transition-colors',
          value === 'grid' ? 'bg-accent/20 text-accent' : 'text-muted hover:text-foreground'
        )}
        aria-label="Grid view"
      >
        <SquaresFour size={16} />
      </button>
    </div>
  )
}

// Mobile-specific list components
function MobileLanguageList({ value, onChange }: SelectProps<string>) {
  const [search, setSearch] = useState('')

  const filteredLanguages = search
    ? languages.filter(l => l.title.toLowerCase().includes(search.toLowerCase()))
    : [
        ...languages.filter(l => POPULAR_LANGUAGES.includes(l.value)),
        { title: '── All Languages ──', value: '__divider__' },
        ...languages.filter(l => !POPULAR_LANGUAGES.includes(l.value))
      ]

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search languages..."
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="max-h-[50vh] overflow-y-auto">
        {filteredLanguages.map((lang) => (
          lang.value === '__divider__' ? (
            <div key="divider" className="my-2 border-t border-border" />
          ) : (
            <button
              key={lang.value}
              onClick={() => onChange(lang.value)}
              className={cn(
                'flex w-full items-center rounded-md px-3 py-3 text-left text-sm',
                'transition-colors active:bg-muted/20',
                value === lang.value && 'bg-accent/10 text-accent'
              )}
            >
              {lang.title}
            </button>
          )
        ))}
      </div>
    </div>
  )
}

function MobileDateList({ value, onChange }: SelectProps<DateJump>) {
  return (
    <div className="flex flex-col gap-1">
      {DATE_JUMP_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex w-full items-center rounded-md px-3 py-4 text-left text-sm font-medium',
            'transition-colors active:bg-muted/20',
            value === option.value && 'bg-accent/10 text-accent'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
