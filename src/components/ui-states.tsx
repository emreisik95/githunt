import { cn } from '@/lib/utils'

interface GroupHeaderProps {
  label: string
}

export function GroupHeader({ label }: GroupHeaderProps) {
  return (
    <div className="sticky top-12 z-10 -mx-4 bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <h2 className="text-2xs font-medium uppercase tracking-wider text-muted">
        {label}
      </h2>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
      <div className="hidden h-10 w-10 animate-pulse rounded-full bg-muted/20 md:block" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-48 animate-pulse rounded bg-muted/20" />
        <div className="h-3 w-full animate-pulse rounded bg-muted/10" />
        <div className="flex gap-3">
          <div className="h-3 w-16 animate-pulse rounded bg-muted/10" />
          <div className="h-3 w-12 animate-pulse rounded bg-muted/10" />
        </div>
      </div>
      <div className="h-4 w-12 animate-pulse rounded bg-muted/20" />
    </div>
  )
}

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center">
      <p className="text-sm text-red-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            'rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground',
            'transition-colors hover:bg-accent/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface p-8 text-center">
      <p className="text-sm text-muted">No repositories found for this time period.</p>
      <p className="text-xs text-muted">Try adjusting your filters or date range.</p>
    </div>
  )
}
