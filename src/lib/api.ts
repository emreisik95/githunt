import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns'
import type { GitHubSearchResponse, DateRange } from '@/types/github'
import type { DateJump } from '@/stores/preferences'

const API_URL = 'https://api.github.com/search/repositories'

interface FetchParams {
  language?: string
  dateRange: DateRange
  token?: string | null
}

function formatDateRange(dateRange: DateRange): string {
  const start = format(dateRange.start, "yyyy-MM-dd'T'HH:mm:ss'Z'")
  const end = format(dateRange.end, "yyyy-MM-dd'T'HH:mm:ss'Z'")
  return `created:${start}..${end}`
}

export async function fetchRepositories(params: FetchParams): Promise<GitHubSearchResponse> {
  const { language, dateRange, token } = params

  const dateQuery = formatDateRange(dateRange)
  const languageQuery = language ? `language:${language} ` : ''
  const query = `${languageQuery}${dateQuery}`

  const url = new URL(API_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('sort', 'stars')
  url.searchParams.set('order', 'desc')
  url.searchParams.set('per_page', '25')

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url.toString(), { headers })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `GitHub API error: ${response.status}`)
  }

  return response.json()
}

export function getDateRange(dateJump: DateJump, offset: number = 0): DateRange {
  const now = new Date()
  let end: Date
  let start: Date

  switch (dateJump) {
    case 'day':
      end = endOfDay(subDays(now, offset))
      start = startOfDay(subDays(now, offset))
      break
    case 'week':
      end = endOfDay(subWeeks(now, offset))
      start = startOfDay(subWeeks(now, offset + 1))
      break
    case 'month':
      end = endOfDay(subMonths(now, offset))
      start = startOfDay(subMonths(now, offset + 1))
      break
  }

  return { start, end }
}

export function formatDateRangeLabel(dateRange: DateRange, dateJump: DateJump): string {
  const { start, end } = dateRange

  if (dateJump === 'day') {
    return format(start, 'MMMM d, yyyy')
  }

  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
}
