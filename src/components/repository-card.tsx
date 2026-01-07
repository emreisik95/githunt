import { Star, GitFork, CircleDashed, BookmarkSimple } from '@phosphor-icons/react'
import type { Repository } from '@/types/github'
import { useBookmarks } from '@/stores/bookmarks'
import { cn } from '@/lib/utils'

// Language colors from github-linguist
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  'C#': '#178600',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Ruby: '#701516',
  PHP: '#4F5D95',
  C: '#555555',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Lua: '#000080',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return num.toString()
}

interface RepositoryCardProps {
  repository: Repository
  variant?: 'list' | 'grid'
  isNew?: boolean
  isSeen?: boolean
  isFocused?: boolean
  onSelect?: () => void
}

export function RepositoryCard({ repository, variant = 'list', isNew, isSeen, isFocused, onSelect }: RepositoryCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const bookmarked = isBookmarked(repository.id)
  const languageColor = repository.language ? LANGUAGE_COLORS[repository.language] || '#8b949e' : null

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleBookmark(repository)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault()
      onSelect()
    }
  }

  if (variant === 'grid') {
    return (
      <div
        onClick={handleCardClick}
        className={cn(
          'group relative flex flex-col gap-3 rounded-lg border border-border bg-surface p-4',
          'transition-all hover:border-accent/30',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isFocused && 'ring-2 ring-accent',
          onSelect && 'cursor-pointer',
          isSeen && 'opacity-50 hover:opacity-100'
        )}
      >
        {/* New indicator */}
        {isNew && (
          <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent" />
        )}

        {/* Bookmark button */}
        <button
          onClick={handleBookmarkClick}
          className={cn(
            'absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md',
            'opacity-0 transition-all group-hover:opacity-100',
            'hover:bg-muted/20',
            bookmarked && 'opacity-100 text-accent'
          )}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <BookmarkSimple size={16} weight={bookmarked ? 'fill' : 'regular'} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3">
          <img
            src={repository.owner.avatar_url}
            alt={repository.owner.login}
            className="h-8 w-8 rounded-full"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {repository.name}
            </h3>
            <p className="truncate text-xs text-muted">
              {repository.owner.login}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="line-clamp-2 flex-1 text-xs text-muted">
          {repository.description || 'No description'}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 text-xs text-muted">
          {repository.language && (
            <span className="flex items-center gap-1">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: languageColor || undefined }}
              />
              {repository.language}
            </span>
          )}
          <span className="flex items-center gap-1 font-mono">
            <Star size={12} weight="fill" className="text-accent" />
            {formatNumber(repository.stargazers_count)}
          </span>
        </div>

        {/* External link */}
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-0"
          onClick={(e) => onSelect && e.preventDefault()}
        >
          <span className="sr-only">Open {repository.name} on GitHub</span>
        </a>
      </div>
    )
  }

  // List variant
  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative flex items-center gap-4 rounded-lg border border-border bg-surface p-4',
        'transition-all hover:border-accent/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isFocused && 'ring-2 ring-accent',
        onSelect && 'cursor-pointer',
        isSeen && 'opacity-50 hover:opacity-100'
      )}
    >
      {/* New indicator */}
      {isNew && (
        <div className="absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent" />
      )}

      {/* Avatar - hidden on small screens */}
      <img
        src={repository.owner.avatar_url}
        alt={repository.owner.login}
        className="hidden h-10 w-10 flex-shrink-0 rounded-full md:block"
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {repository.owner.login}/{repository.name}
          </h3>
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-muted sm:line-clamp-2">
          {repository.description || 'No description'}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
          {repository.language && (
            <span className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: languageColor || undefined }}
              />
              {repository.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <GitFork size={12} />
            {formatNumber(repository.forks_count)}
          </span>
          <span className="flex items-center gap-1">
            <CircleDashed size={12} />
            {formatNumber(repository.open_issues_count)}
          </span>
        </div>
      </div>

      {/* Bookmark button */}
      <button
        onClick={handleBookmarkClick}
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md',
          'opacity-0 transition-all group-hover:opacity-100',
          'hover:bg-muted/20',
          bookmarked && 'opacity-100 text-accent'
        )}
        aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <BookmarkSimple size={18} weight={bookmarked ? 'fill' : 'regular'} />
      </button>

      {/* Star count */}
      <div className="flex flex-shrink-0 items-center gap-1 font-mono text-sm">
        <Star size={14} weight="fill" className="text-accent" />
        <span>{formatNumber(repository.stargazers_count)}</span>
      </div>

      {/* External link */}
      <a
        href={repository.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-0"
        onClick={(e) => onSelect && e.preventDefault()}
      >
        <span className="sr-only">Open {repository.name} on GitHub</span>
      </a>
    </div>
  )
}
