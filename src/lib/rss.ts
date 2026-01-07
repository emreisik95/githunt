import type { Repository } from '@/types/github'
import type { DateJump } from '@/stores/preferences'

interface RSSOptions {
  languages: string[]
  dateJump: DateJump
  baseUrl?: string
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function generateRSSFeed(repositories: Repository[], options: RSSOptions): string {
  const { languages, dateJump, baseUrl = 'https://githunt.dev' } = options

  const title = languages.length > 0
    ? `GitHunt - ${languages.join(', ')}`
    : 'GitHunt - All Languages'

  const description = `Trending GitHub repositories${languages.length > 0 ? ` for ${languages.join(', ')}` : ''} (${dateJump}ly)`

  const items = repositories.map((repo) => `
    <item>
      <title>${escapeXml(repo.full_name)}</title>
      <link>${repo.html_url}</link>
      <description><![CDATA[${repo.description || 'No description'}

⭐ ${repo.stargazers_count.toLocaleString()} stars | 🍴 ${repo.forks_count.toLocaleString()} forks${repo.language ? ` | 💻 ${repo.language}` : ''}]]></description>
      <guid isPermaLink="true">${repo.html_url}</guid>
      <pubDate>${new Date(repo.created_at).toUTCString()}</pubDate>
      <author>${escapeXml(repo.owner.login)}</author>
    </item>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`
}

export function downloadRSSFeed(content: string, filename = 'githunt-feed.xml'): void {
  const blob = new Blob([content], { type: 'application/rss+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function copyRSSFeed(content: string): Promise<void> {
  return navigator.clipboard.writeText(content)
}
