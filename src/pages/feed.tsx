import { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import { useRepositories, useFormattedDateLabel } from '@/hooks/useRepositories'
import { usePreferences } from '@/stores/preferences'
import { useBookmarks } from '@/stores/bookmarks'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { FilterBar } from '@/components/filter-bar'
import { RepositoryCard } from '@/components/repository-card'
import { RepositoryModal } from '@/components/repository-modal'
import { GroupHeader, LoadingCard, ErrorMessage, EmptyState } from '@/components/ui-states'
import { cn } from '@/lib/utils'
import type { Repository, RepositoryGroup } from '@/types/github'

export function Feed() {
  const { viewType, setViewType, theme, setTheme, dimSeenRepos } = usePreferences()
  const { isNew, markAsSeen, updateLastVisit } = useBookmarks()
  const { toggleBookmark } = useBookmarks()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useRepositories()

  const [focusedIndex, setFocusedIndex] = useState(0)
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)

  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Flatten all repositories for keyboard navigation
  const allRepos = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((group) => group.repositories)
  }, [data?.pages])

  const focusedRepo = allRepos[focusedIndex] || null

  // Mark repos as seen when they load
  useEffect(() => {
    if (allRepos.length > 0) {
      const ids = allRepos.map((r) => r.id)
      markAsSeen(ids)
    }
  }, [allRepos, markAsSeen])

  // Update last visit on first load
  useEffect(() => {
    if (data?.pages.length === 1) {
      updateLastVisit()
    }
  }, [data?.pages.length, updateLastVisit])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // Scroll focused item into view
  useEffect(() => {
    const element = document.querySelector(`[data-repo-index="${focusedIndex}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [focusedIndex])

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  // Keyboard shortcuts
  useKeyboardShortcuts(
    {
      onNavigateUp: () => {
        setFocusedIndex((i) => Math.max(0, i - 1))
      },
      onNavigateDown: () => {
        setFocusedIndex((i) => Math.min(allRepos.length - 1, i + 1))
      },
      onOpen: () => {
        if (focusedRepo) {
          setSelectedRepo(focusedRepo)
        }
      },
      onBookmark: () => {
        if (focusedRepo) {
          toggleBookmark(focusedRepo)
        }
      },
      onToggleGrid: () => {
        setViewType(viewType === 'grid' ? 'list' : 'grid')
      },
      onToggleTheme: () => {
        const themes = ['system', 'light', 'dark'] as const
        const currentIndex = themes.indexOf(theme)
        const nextIndex = (currentIndex + 1) % themes.length
        setTheme(themes[nextIndex])
      },
      onEscape: () => {
        setSelectedRepo(null)
      },
    },
    !selectedRepo // Disable when modal is open
  )

  // Track repo index across groups
  let repoIndex = 0

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Filter bar */}
          <FilterBar />

          {/* Keyboard hint */}
          <div className="hidden text-xs text-muted sm:block">
            <span className="opacity-60">Tip: Use </span>
            <kbd className="rounded bg-muted/20 px-1 font-mono">j</kbd>
            <span className="opacity-60">/</span>
            <kbd className="rounded bg-muted/20 px-1 font-mono">k</kbd>
            <span className="opacity-60"> to navigate, </span>
            <kbd className="rounded bg-muted/20 px-1 font-mono">o</kbd>
            <span className="opacity-60"> to preview, </span>
            <kbd className="rounded bg-muted/20 px-1 font-mono">s</kbd>
            <span className="opacity-60"> to bookmark</span>
          </div>

          {/* Error state */}
          {isError && (
            <ErrorMessage
              message={error instanceof Error ? error.message : 'Failed to load repositories'}
              onRetry={handleRetry}
            />
          )}

          {/* Initial loading */}
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          )}

          {/* Repository groups */}
          {data?.pages.map((group, groupIndex) => {
            const startIndex = repoIndex
            repoIndex += group.repositories.length

            return (
              <RepositoryGroupSection
                key={`${group.start}-${group.end}`}
                group={group}
                viewType={viewType}
                isFirst={groupIndex === 0}
                startIndex={startIndex}
                focusedIndex={focusedIndex}
                isNew={isNew}
                dimSeenRepos={dimSeenRepos}
                onSelectRepo={setSelectedRepo}
              />
            )
          })}

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="h-4" />

          {/* Loading more */}
          {isFetchingNextPage && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <RepositoryModal
        repository={selectedRepo}
        onClose={() => setSelectedRepo(null)}
      />
    </>
  )
}

interface RepositoryGroupSectionProps {
  group: RepositoryGroup
  viewType: 'list' | 'grid'
  isFirst: boolean
  startIndex: number
  focusedIndex: number
  isNew: (repoId: number) => boolean
  dimSeenRepos: boolean
  onSelectRepo: (repo: Repository) => void
}

function RepositoryGroupSection({
  group,
  viewType,
  isFirst,
  startIndex,
  focusedIndex,
  isNew,
  dimSeenRepos,
  onSelectRepo,
}: RepositoryGroupSectionProps) {
  const label = useFormattedDateLabel(group)

  if (group.repositories.length === 0) {
    return isFirst ? <EmptyState /> : null
  }

  return (
    <section>
      <GroupHeader label={label} />

      <div
        className={cn(
          'mt-2',
          viewType === 'grid'
            ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-3'
        )}
      >
        {group.repositories.map((repo, i) => {
          const index = startIndex + i
          const repoIsNew = isNew(repo.id)
          return (
            <div key={repo.id} data-repo-index={index}>
              <RepositoryCard
                repository={repo}
                variant={viewType}
                isNew={repoIsNew}
                isSeen={dimSeenRepos && !repoIsNew}
                isFocused={index === focusedIndex}
                onSelect={() => onSelectRepo(repo)}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
