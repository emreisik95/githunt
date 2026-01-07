import { useEffect, useState, useRef } from 'react'
import { X, Star, GitFork, CircleDashed, ArrowSquareOut, BookmarkSimple, Calendar, Copy, Terminal, Code, DotsThreeVertical, NotePencil, ChartLineUp } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import type { Repository } from '@/types/github'
import { useBookmarks } from '@/stores/bookmarks'
import { usePreferences } from '@/stores/preferences'
import { useToast } from '@/components/toast'
import { StarHistoryChart } from '@/components/star-history-chart'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface RepositoryModalProps {
  repository: Repository | null
  onClose: () => void
}

async function fetchReadme(owner: string, repo: string, token?: string | null): Promise<string> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3.raw',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    { headers }
  )

  if (!response.ok) {
    if (response.status === 404) {
      return '*No README found*'
    }
    throw new Error('Failed to fetch README')
  }

  const text = await response.text()
  // Limit to first 5000 chars for preview
  return text.length > 5000 ? text.slice(0, 5000) + '\n\n---\n\n*README truncated...*' : text
}

export function RepositoryModal({ repository, onClose }: RepositoryModalProps) {
  const { token } = usePreferences()
  const { isBookmarked, toggleBookmark, getNote, setNote } = useBookmarks()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'readme' | 'info' | 'stars'>('readme')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteText, setNoteText] = useState('')

  const bookmarked = repository ? isBookmarked(repository.id) : false
  const contentRef = useRef<HTMLDivElement>(null)

  // Load existing note when repository changes
  useEffect(() => {
    if (repository) {
      const existingNote = getNote(repository.id)
      setNoteText(existingNote || '')
      setShowNoteInput(!!existingNote)
    }
  }, [repository, getNote])

  // Vim-style keyboard navigation
  useEffect(() => {
    if (!repository) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const content = contentRef.current
      if (!content) return

      switch (e.key.toLowerCase()) {
        case 'j':
          // Scroll down
          e.preventDefault()
          content.scrollBy({ top: 100, behavior: 'smooth' })
          break
        case 'k':
          // Scroll up
          e.preventDefault()
          content.scrollBy({ top: -100, behavior: 'smooth' })
          break
        case 'd':
          // Half page down (Ctrl+D style)
          e.preventDefault()
          content.scrollBy({ top: content.clientHeight / 2, behavior: 'smooth' })
          break
        case 'u':
          // Half page up (Ctrl+U style)
          e.preventDefault()
          content.scrollBy({ top: -content.clientHeight / 2, behavior: 'smooth' })
          break
        case 'g':
          // Go to top (gg)
          e.preventDefault()
          content.scrollTo({ top: 0, behavior: 'smooth' })
          break
        case 'G':
          // Go to bottom (Shift+G)
          e.preventDefault()
          content.scrollTo({ top: content.scrollHeight, behavior: 'smooth' })
          break
        case 'h':
          // Switch to README tab
          e.preventDefault()
          setActiveTab('readme')
          break
        case 'l':
          // Switch to Info tab
          e.preventDefault()
          setActiveTab('info')
          break
        case 'o':
          // Open in GitHub
          e.preventDefault()
          window.open(repository.html_url, '_blank')
          break
        case 's':
          // Toggle bookmark
          e.preventDefault()
          toggleBookmark(repository)
          break
        case 'c':
          // Copy clone URL
          e.preventDefault()
          navigator.clipboard.writeText(`https://github.com/${repository.full_name}.git`)
          toast.success('Clone URL copied!')
          break
        case 'q':
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [repository, onClose, toggleBookmark, toast])

  const { data: readme, isLoading: readmeLoading } = useQuery({
    queryKey: ['readme', repository?.owner.login, repository?.name],
    queryFn: () => fetchReadme(repository!.owner.login, repository!.name, token),
    enabled: !!repository,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Prevent body scroll when open
  useEffect(() => {
    if (repository) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [repository])

  if (!repository) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
              className="h-8 w-8 rounded-full"
            />
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {repository.owner.login}/{repository.name}
              </h2>
              {repository.language && (
                <span className="text-xs text-muted">{repository.language}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md',
                  'text-muted transition-colors hover:bg-muted/20 hover:text-foreground',
                  showQuickActions && 'bg-muted/20 text-foreground'
                )}
                aria-label="Quick actions"
              >
                <DotsThreeVertical size={18} />
              </button>
              {showQuickActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowQuickActions(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-border bg-surface py-1 shadow-lg max-h-80 overflow-y-auto">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://github.com/${repository.full_name}.git`)
                        toast.success('Clone URL copied!')
                        setShowQuickActions(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-muted/10 hover:text-foreground"
                    >
                      <Copy size={16} />
                      Copy Clone URL
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`git@github.com:${repository.full_name}.git`)
                        toast.success('SSH URL copied!')
                        setShowQuickActions(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-muted/10 hover:text-foreground"
                    >
                      <Terminal size={16} />
                      Copy SSH URL
                    </button>
                    <div className="my-1 border-t border-border" />
                    <div className="px-3 py-1 text-xs text-muted/60 font-medium">Open in Editor</div>
                    <button
                      onClick={() => {
                        window.open(`vscode://vscode.git/clone?url=${encodeURIComponent(`https://github.com/${repository.full_name}.git`)}`)
                        setShowQuickActions(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-muted/10 hover:text-foreground"
                    >
                      <Code size={16} />
                      VSCode
                    </button>
                    <button
                      onClick={() => {
                        window.open(`cursor://vscode.git/clone?url=${encodeURIComponent(`https://github.com/${repository.full_name}.git`)}`)
                        setShowQuickActions(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-muted/10 hover:text-foreground"
                    >
                      <Code size={16} />
                      Cursor
                    </button>
                    <button
                      onClick={() => {
                        window.open(`windsurf://vscode.git/clone?url=${encodeURIComponent(`https://github.com/${repository.full_name}.git`)}`)
                        setShowQuickActions(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-muted/10 hover:text-foreground"
                    >
                      <Code size={16} />
                      Windsurf
                    </button>
                    <button
                      onClick={() => {
                        window.open(`antigravity://clone?url=${encodeURIComponent(`https://github.com/${repository.full_name}.git`)}`)
                        setShowQuickActions(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-muted/10 hover:text-foreground"
                    >
                      <Code size={16} />
                      Antigravity
                    </button>
                    <button
                      onClick={() => {
                        window.open(`kiro://clone?url=${encodeURIComponent(`https://github.com/${repository.full_name}.git`)}`)
                        setShowQuickActions(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-muted/10 hover:text-foreground"
                    >
                      <Code size={16} />
                      Kiro
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => toggleBookmark(repository)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md',
                'transition-colors hover:bg-muted/20',
                bookmarked && 'text-accent'
              )}
              aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <BookmarkSimple size={18} weight={bookmarked ? 'fill' : 'regular'} />
            </button>
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-muted/20 hover:text-foreground"
              aria-label="Open on GitHub"
            >
              <ArrowSquareOut size={18} />
            </a>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-muted/20 hover:text-foreground"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 border-b border-border px-4 py-2 text-xs text-muted">
          <span className="flex items-center gap-1 font-mono">
            <Star size={14} weight="fill" className="text-accent" />
            {repository.stargazers_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitFork size={14} />
            {repository.forks_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <CircleDashed size={14} />
            {repository.open_issues_count.toLocaleString()} issues
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            Created {format(new Date(repository.created_at), 'MMM yyyy')}
          </span>
        </div>

        {/* Description */}
        {repository.description && (
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm text-muted">{repository.description}</p>
          </div>
        )}

        {/* Notes Section */}
        {bookmarked && (
          <div className="border-b border-border px-4 py-3">
            {showNoteInput ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                    <NotePencil size={14} />
                    Personal Note
                  </span>
                  <span className="text-xs text-muted/60">{noteText.length}/500</span>
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 500)
                    setNoteText(value)
                    setNote(repository.id, value)
                  }}
                  placeholder="Add a note about this repo..."
                  className={cn(
                    'h-20 w-full resize-none rounded-md border border-border bg-background px-3 py-2',
                    'text-sm placeholder:text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-ring'
                  )}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowNoteInput(true)}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
              >
                <NotePencil size={14} />
                Add a note
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('readme')}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'readme'
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted hover:text-foreground'
            )}
          >
            README
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'info'
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted hover:text-foreground'
            )}
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab('stars')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'stars'
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted hover:text-foreground'
            )}
          >
            <ChartLineUp size={16} />
            Star History
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-4">
          {activeTab === 'readme' && (
            <div className="prose prose-sm prose-invert max-w-none">
              {readmeLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted/20" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted/20" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-muted/20" />
                </div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // Custom component styling
                    h1: ({ children }) => (
                      <h1 className="mb-4 border-b border-border pb-2 text-xl font-bold text-foreground">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-3 mt-6 border-b border-border pb-2 text-lg font-semibold text-foreground">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-2 mt-4 text-base font-semibold text-foreground">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-3 text-sm leading-relaxed text-muted">
                        {children}
                      </p>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline underline-offset-2 hover:text-accent/80"
                      >
                        {children}
                      </a>
                    ),
                    code: ({ className, children }) => {
                      const isInline = !className
                      if (isInline) {
                        return (
                          <code className="rounded bg-muted/20 px-1.5 py-0.5 font-mono text-xs text-foreground">
                            {children}
                          </code>
                        )
                      }
                      return (
                        <code className="block overflow-x-auto rounded-lg bg-surface p-4 font-mono text-xs text-muted">
                          {children}
                        </code>
                      )
                    },
                    pre: ({ children }) => (
                      <pre className="mb-4 overflow-x-auto rounded-lg border border-border bg-surface p-4">
                        {children}
                      </pre>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-3 list-inside list-disc space-y-1 text-sm text-muted">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-3 list-inside list-decimal space-y-1 text-sm text-muted">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm text-muted">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="mb-3 border-l-2 border-accent pl-4 italic text-muted">
                        {children}
                      </blockquote>
                    ),
                    hr: () => <hr className="my-6 border-border" />,
                    img: ({ src, alt }) => (
                      <img
                        src={src}
                        alt={alt || ''}
                        className="my-4 max-w-full rounded-lg"
                        loading="lazy"
                      />
                    ),
                    table: ({ children }) => (
                      <div className="mb-4 overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-border bg-surface px-3 py-2 text-left font-medium text-foreground">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-border px-3 py-2 text-muted">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {readme || ''}
                </ReactMarkdown>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              <InfoRow label="Full Name" value={repository.full_name} />
              <InfoRow label="Owner" value={repository.owner.login} />
              <InfoRow label="Language" value={repository.language || 'Not specified'} />
              <InfoRow
                label="Created"
                value={format(new Date(repository.created_at), 'MMMM d, yyyy')}
              />
              <InfoRow
                label="Last Updated"
                value={format(new Date(repository.updated_at), 'MMMM d, yyyy')}
              />
              <InfoRow
                label="GitHub URL"
                value={
                  <a
                    href={repository.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {repository.html_url}
                  </a>
                }
              />
            </div>
          )}

          {activeTab === 'stars' && (
            <div className="py-4">
              <StarHistoryChart owner={repository.owner.login} repo={repository.name} />
            </div>
          )}
        </div>
      {/* Keyboard hints */}
        <div className="hidden border-t border-border px-4 py-2 text-xs text-muted sm:block">
          <span className="opacity-60">Vim: </span>
          <kbd className="rounded bg-muted/20 px-1 font-mono">j</kbd>
          <span className="opacity-60">/</span>
          <kbd className="rounded bg-muted/20 px-1 font-mono">k</kbd>
          <span className="opacity-60"> scroll, </span>
          <kbd className="rounded bg-muted/20 px-1 font-mono">d</kbd>
          <span className="opacity-60">/</span>
          <kbd className="rounded bg-muted/20 px-1 font-mono">u</kbd>
          <span className="opacity-60"> half-page, </span>
          <kbd className="rounded bg-muted/20 px-1 font-mono">g</kbd>
          <span className="opacity-60">/</span>
          <kbd className="rounded bg-muted/20 px-1 font-mono">G</kbd>
          <span className="opacity-60"> top/bottom, </span>
          <kbd className="rounded bg-muted/20 px-1 font-mono">h</kbd>
          <span className="opacity-60">/</span>
          <kbd className="rounded bg-muted/20 px-1 font-mono">l</kbd>
          <span className="opacity-60"> tabs, </span>
          <kbd className="rounded bg-muted/20 px-1 font-mono">q</kbd>
          <span className="opacity-60"> close</span>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-28 flex-shrink-0 text-xs font-medium text-muted">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}
