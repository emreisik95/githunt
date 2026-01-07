import { ArrowLeft, Eye, TextAa, TextAlignLeft, Rows, Moon, Sun, Monitor } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import {
  usePreferences,
  type Theme,
  type FontFamily,
  type FontSize,
  type LineHeight,
  type Density,
} from '@/stores/preferences'
import { cn } from '@/lib/utils'

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

const FONT_SIZE_OPTIONS: { value: FontSize; label: string; preview: string }[] = [
  { value: 'small', label: 'Small', preview: 'Aa' },
  { value: 'medium', label: 'Medium', preview: 'Aa' },
  { value: 'large', label: 'Large', preview: 'Aa' },
]

const FONT_FAMILY_OPTIONS: { value: FontFamily; label: string; className: string }[] = [
  { value: 'geist', label: 'Geist', className: 'font-sans' },
  { value: 'inter', label: 'Inter', className: 'font-sans' },
  { value: 'system', label: 'System', className: 'font-sans' },
  { value: 'mono', label: 'Monospace', className: 'font-mono' },
]

const LINE_HEIGHT_OPTIONS: { value: LineHeight; label: string; description: string }[] = [
  { value: 'compact', label: 'Compact', description: 'Tighter line spacing' },
  { value: 'normal', label: 'Normal', description: 'Default spacing' },
  { value: 'relaxed', label: 'Relaxed', description: 'More breathing room' },
]

const DENSITY_OPTIONS: { value: Density; label: string; description: string }[] = [
  { value: 'compact', label: 'Compact', description: 'More items visible' },
  { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing' },
  { value: 'spacious', label: 'Spacious', description: 'More whitespace' },
]

export function Settings() {
  const {
    token,
    setToken,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    lineHeight,
    setLineHeight,
    density,
    setDensity,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    dimSeenRepos,
    setDimSeenRepos,
  } = usePreferences()

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              'text-muted transition-colors',
              'hover:bg-surface hover:text-foreground'
            )}
            aria-label="Back to feed"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
        </div>

        {/* Appearance Section */}
        <SettingsSection title="Appearance" icon={<Eye size={18} />}>
          {/* Theme */}
          <SettingsRow label="Theme" description="Choose your preferred color scheme">
            <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                      theme === option.value
                        ? 'bg-accent/20 text-accent'
                        : 'text-muted hover:text-foreground'
                    )}
                  >
                    <Icon size={14} />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </SettingsRow>

          {/* High Contrast */}
          <SettingsRow label="High contrast" description="Increase contrast for better visibility">
            <Toggle checked={highContrast} onChange={setHighContrast} />
          </SettingsRow>
        </SettingsSection>

        {/* Typography Section */}
        <SettingsSection title="Typography" icon={<TextAa size={18} />}>
          {/* Font Size */}
          <SettingsRow label="Font size" description="Adjust text size throughout the app">
            <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
              {FONT_SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFontSize(option.value)}
                  className={cn(
                    'rounded px-3 py-1.5 transition-colors',
                    fontSize === option.value
                      ? 'bg-accent/20 text-accent'
                      : 'text-muted hover:text-foreground',
                    option.value === 'small' && 'text-xs',
                    option.value === 'medium' && 'text-sm',
                    option.value === 'large' && 'text-base'
                  )}
                >
                  {option.preview}
                </button>
              ))}
            </div>
          </SettingsRow>

          {/* Font Family */}
          <SettingsRow label="Font family" description="Choose your preferred typeface">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as FontFamily)}
              className={cn(
                'h-9 rounded-md border border-border bg-surface px-3 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
            >
              {FONT_FAMILY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SettingsRow>

          {/* Line Height */}
          <SettingsRow label="Line height" description="Adjust spacing between lines of text">
            <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
              {LINE_HEIGHT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLineHeight(option.value)}
                  className={cn(
                    'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                    lineHeight === option.value
                      ? 'bg-accent/20 text-accent'
                      : 'text-muted hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </SettingsRow>
        </SettingsSection>

        {/* Layout Section */}
        <SettingsSection title="Layout" icon={<Rows size={18} />}>
          {/* Density */}
          <SettingsRow label="Content density" description="Control spacing between items">
            <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
              {DENSITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDensity(option.value)}
                  className={cn(
                    'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                    density === option.value
                      ? 'bg-accent/20 text-accent'
                      : 'text-muted hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </SettingsRow>
        </SettingsSection>

        {/* Accessibility Section */}
        <SettingsSection title="Accessibility" icon={<TextAlignLeft size={18} />}>
          {/* Reduced Motion */}
          <SettingsRow
            label="Reduce motion"
            description="Minimize animations throughout the app"
          >
            <Toggle checked={reducedMotion} onChange={setReducedMotion} />
          </SettingsRow>

          {/* Dim Seen Repos */}
          <SettingsRow
            label="Dim seen repositories"
            description="Fade previously viewed repositories in the feed"
          >
            <Toggle checked={dimSeenRepos} onChange={setDimSeenRepos} />
          </SettingsRow>
        </SettingsSection>

        {/* GitHub Token Section */}
        <SettingsSection title="GitHub API">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Access Token</label>
              <p className="mt-0.5 text-xs text-muted">
                Optional. Increases API rate limit from 60 to 5000 requests/hour.
              </p>
            </div>

            <input
              type="password"
              value={token || ''}
              onChange={(e) => setToken(e.target.value || null)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className={cn(
                'h-9 w-full rounded-md border border-border bg-background px-3',
                'font-mono text-sm placeholder:text-muted',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
            />

            <p className="text-xs text-muted">
              Create a token at{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 hover:text-accent/80"
              >
                github.com/settings/tokens
              </a>
              . No scopes needed for public repos.
            </p>
          </div>
        </SettingsSection>

        {/* Preview */}
        <SettingsSection title="Preview">
          <div
            className={cn(
              'rounded-lg border border-border bg-surface p-4',
              density === 'compact' && 'p-3',
              density === 'spacious' && 'p-6'
            )}
          >
            <h3
              className={cn(
                'font-semibold text-foreground',
                fontSize === 'small' && 'text-sm',
                fontSize === 'medium' && 'text-base',
                fontSize === 'large' && 'text-lg'
              )}
            >
              Sample Repository Title
            </h3>
            <p
              className={cn(
                'mt-2 text-muted',
                fontSize === 'small' && 'text-xs',
                fontSize === 'medium' && 'text-sm',
                fontSize === 'large' && 'text-base',
                lineHeight === 'compact' && 'leading-tight',
                lineHeight === 'normal' && 'leading-normal',
                lineHeight === 'relaxed' && 'leading-relaxed'
              )}
            >
              This is a preview of how text will appear with your current settings.
              Adjust the options above to find the combination that works best for you.
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted">
              <span>★ 1,234</span>
              <span>TypeScript</span>
              <span>Updated today</span>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}

interface SettingsSectionProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}

function SettingsSection({ title, icon, children }: SettingsSectionProps) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted">{icon}</span>}
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

interface SettingsRowProps {
  label: string
  description?: string
  children: React.ReactNode
}

function SettingsRow({ label, description, children }: SettingsRowProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      {children}
    </div>
  )
}

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
        checked ? 'bg-accent' : 'bg-muted/30'
      )}
    >
      <span
        className={cn(
          'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-5'
        )}
      />
    </button>
  )
}
