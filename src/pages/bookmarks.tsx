import { BookmarkSimple, Trash, NotePencil } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { useBookmarks } from '@/stores/bookmarks'
import { RepositoryCard } from '@/components/repository-card'
import { cn } from '@/lib/utils'

export function Bookmarks() {
  const { bookmarks, removeBookmark, getNote } = useBookmarks()

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookmarkSimple size={24} weight="fill" className="text-accent" />
            <h1 className="text-lg font-semibold tracking-tight">Saved Repositories</h1>
            <span className="text-sm text-muted">({bookmarks.length})</span>
          </div>
        </div>

        {/* Empty state */}
        {bookmarks.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-surface p-12 text-center">
            <BookmarkSimple size={48} className="text-muted/50" />
            <div>
              <p className="text-sm font-medium text-foreground">No saved repositories yet</p>
              <p className="mt-1 text-xs text-muted">
                Click the bookmark icon on any repository to save it here.
              </p>
            </div>
            <Link
              to="/"
              className={cn(
                'rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground',
                'transition-colors hover:bg-accent/90'
              )}
            >
              Browse Repositories
            </Link>
          </div>
        )}

        {/* Bookmarked repos */}
        {bookmarks.length > 0 && (
          <div className="flex flex-col gap-3">
            {bookmarks.map((repo) => {
              const note = getNote(repo.id)
              return (
                <div key={repo.id} className="group relative">
                  <RepositoryCard repository={repo} variant="list" />
                  {note && (
                    <div className="mt-1 ml-14 flex items-start gap-1.5 text-xs text-muted">
                      <NotePencil size={12} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{note}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeBookmark(repo.id)}
                    className={cn(
                      'absolute right-14 top-4',
                      'flex h-8 w-8 items-center justify-center rounded-md',
                      'text-muted opacity-0 transition-all group-hover:opacity-100',
                      'hover:bg-red-500/10 hover:text-red-400'
                    )}
                    aria-label="Remove bookmark"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
