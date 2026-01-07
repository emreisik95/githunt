export interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  owner: {
    login: string
    avatar_url: string
    html_url: string
  }
  created_at: string
  updated_at: string
}

export interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: Repository[]
}

export interface DateRange {
  start: Date
  end: Date
}

export interface RepositoryGroup {
  start: string
  end: string
  repositories: Repository[]
}
