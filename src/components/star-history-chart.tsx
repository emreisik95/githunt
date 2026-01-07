import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { usePreferences } from '@/stores/preferences'
import { format } from 'date-fns'

interface StarHistoryData {
  date: string
  stars: number
}

interface StarHistoryChartProps {
  owner: string
  repo: string
}

async function fetchStarHistory(owner: string, repo: string, token?: string | null): Promise<StarHistoryData[]> {
  // Use GitHub API to fetch stargazers with timestamps
  // Note: This is a simplified approach - for large repos, we sample the data
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3.star+json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const allData: StarHistoryData[] = []
  const maxPages = 10 // Limit to prevent rate limiting

  // First, get total star count
  const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers })
  if (!repoResponse.ok) {
    throw new Error('Failed to fetch repository info')
  }
  const repoData = await repoResponse.json()
  const totalStars = repoData.stargazers_count

  // For repos with many stars, sample at different points
  const perPage = 100
  const totalPages = Math.ceil(totalStars / perPage)

  // Calculate which pages to fetch to get a good distribution
  const pagesToFetch: number[] = []
  if (totalPages <= maxPages) {
    // Fetch all pages
    for (let i = 1; i <= totalPages; i++) {
      pagesToFetch.push(i)
    }
  } else {
    // Sample pages evenly across the history
    const step = totalPages / maxPages
    for (let i = 0; i < maxPages; i++) {
      pagesToFetch.push(Math.floor(1 + i * step))
    }
    // Always include the last page
    if (!pagesToFetch.includes(totalPages)) {
      pagesToFetch.push(totalPages)
    }
  }

  for (const pageNum of pagesToFetch) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/stargazers?per_page=${perPage}&page=${pageNum}`,
        { headers }
      )

      if (!response.ok) {
        if (response.status === 403) {
          // Rate limited, return what we have
          break
        }
        continue
      }

      const data = await response.json()

      // Process stargazers and estimate cumulative stars
      for (const stargazer of data) {
        const starredAt = stargazer.starred_at
        if (starredAt) {
          // Estimate the star count at this point
          // Using page number * perPage as approximation
          const estimatedStars = (pageNum - 1) * perPage + data.indexOf(stargazer) + 1
          allData.push({
            date: format(new Date(starredAt), 'yyyy-MM-dd'),
            stars: estimatedStars,
          })
        }
      }
    } catch {
      // Continue with next page on error
      continue
    }
  }

  // Sort by date and deduplicate
  const sortedData = allData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Reduce data points for smoother chart (keep ~50 points max)
  if (sortedData.length > 50) {
    const step = Math.ceil(sortedData.length / 50)
    const reducedData: StarHistoryData[] = []
    for (let i = 0; i < sortedData.length; i += step) {
      reducedData.push(sortedData[i])
    }
    // Always include the last point
    if (reducedData[reducedData.length - 1] !== sortedData[sortedData.length - 1]) {
      reducedData.push(sortedData[sortedData.length - 1])
    }
    return reducedData
  }

  return sortedData
}

export function StarHistoryChart({ owner, repo }: StarHistoryChartProps) {
  const { token } = usePreferences()

  const { data, isLoading, error } = useQuery({
    queryKey: ['starHistory', owner, repo],
    queryFn: () => fetchStarHistory(owner, repo, token),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="space-y-2 text-center">
          <div className="h-4 w-32 mx-auto animate-pulse rounded bg-muted/20" />
          <div className="text-xs text-muted">Loading star history...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted">Failed to load star history</p>
          <p className="text-xs text-muted/60 mt-1">
            {token ? 'GitHub API rate limit may apply' : 'Add a GitHub token in Settings for better results'}
          </p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted">No star history data available</p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            tickFormatter={(value) => format(new Date(value), 'MMM yy')}
            stroke="var(--color-border)"
          />
          <YAxis
            tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            stroke="var(--color-border)"
            width={45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelFormatter={(value) => format(new Date(value as string), 'MMM d, yyyy')}
            formatter={(value) => value !== undefined ? [value.toLocaleString() + ' stars', 'Stars'] : ['', 'Stars']}
          />
          <Line
            type="monotone"
            dataKey="stars"
            stroke="#91CBA6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#91CBA6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
