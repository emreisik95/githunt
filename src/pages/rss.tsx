import { useState, useMemo } from 'react'
import { ArrowLeft, RssSimple, Copy, DownloadSimple, Check } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { useRepositories } from '@/hooks/useRepositories'
import { usePreferences } from '@/stores/preferences'
import { generateRSSFeed, downloadRSSFeed, copyRSSFeed } from '@/lib/rss'
import { cn } from '@/lib/utils'

export function RSS() {
  const { language, dateJump } = usePreferences()
  const { data, isLoading } = useRepositories()
  const [copied, setCopied] = useState(false)

  // Flatten all repositories from pages
  const allRepos = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((group) => group.repositories).slice(0, 50)
  }, [data?.pages])

  const languages = language ? [language] : []

  const rssFeed = useMemo(() => {
    if (allRepos.length === 0) return ''
    return generateRSSFeed(allRepos, { languages, dateJump })
  }, [allRepos, languages, dateJump])

  const handleCopy = async () => {
    await copyRSSFeed(rssFeed)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    downloadRSSFeed(rssFeed)
  }

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
          <RssSimple size={24} weight="fill" className="text-accent" />
          <h1 className="text-lg font-semibold tracking-tight">RSS Feed</h1>
        </div>

        {/* Info */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-medium text-foreground">Current Feed Configuration</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {language || 'All Languages'}
            </span>
            <span className="rounded-full bg-muted/20 px-3 py-1 text-xs font-medium text-muted">
              {dateJump === 'day' ? 'Daily' : dateJump === 'week' ? 'Weekly' : 'Monthly'}
            </span>
            <span className="rounded-full bg-muted/20 px-3 py-1 text-xs font-medium text-muted">
              {allRepos.length} repos
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">
            The RSS feed is generated from your current filter settings. Change filters on the main feed to update.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            disabled={isLoading || allRepos.length === 0}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-3',
              'text-sm font-medium transition-colors',
              'hover:bg-muted/10',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {copied ? (
              <>
                <Check size={18} className="text-accent" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy RSS XML
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={isLoading || allRepos.length === 0}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3',
              'text-sm font-medium text-accent-foreground transition-colors',
              'hover:bg-accent/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <DownloadSimple size={18} />
            Download .xml
          </button>
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-foreground">Feed Preview</h2>
            <span className="text-xs text-muted">First 5 items</span>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted">Loading...</div>
            ) : allRepos.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted">No repositories to show</div>
            ) : (
              allRepos.slice(0, 5).map((repo) => (
                <div key={repo.id} className="px-4 py-3">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                  >
                    {repo.full_name}
                  </a>
                  <p className="mt-1 text-xs text-muted line-clamp-1">
                    {repo.description || 'No description'}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted/60">
                    <span>⭐ {repo.stargazers_count.toLocaleString()}</span>
                    {repo.language && <span>{repo.language}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* XML Preview */}
        {rssFeed && (
          <div className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium text-foreground">Raw XML</h2>
            </div>
            <pre className="max-h-64 overflow-auto p-4 text-xs text-muted font-mono">
              {rssFeed.slice(0, 2000)}
              {rssFeed.length > 2000 && '\n\n... (truncated)'}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
