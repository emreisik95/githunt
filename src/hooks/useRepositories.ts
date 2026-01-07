import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchRepositories, getDateRange, formatDateRangeLabel } from '@/lib/api'
import { usePreferences } from '@/stores/preferences'
import type { RepositoryGroup } from '@/types/github'

export function useRepositories() {
  const { language, dateJump, token } = usePreferences()

  return useInfiniteQuery({
    queryKey: ['repositories', language, dateJump],
    queryFn: async ({ pageParam = 0 }): Promise<RepositoryGroup> => {
      const dateRange = getDateRange(dateJump, pageParam)
      const response = await fetchRepositories({
        language,
        dateRange,
        token,
      })

      return {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
        repositories: response.items,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (_lastPage, allPages) => allPages.length,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useFormattedDateLabel(group: RepositoryGroup) {
  const { dateJump } = usePreferences()
  return formatDateRangeLabel(
    { start: new Date(group.start), end: new Date(group.end) },
    dateJump
  )
}
