import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Repository } from '@/types/github'

interface BookmarksState {
  bookmarks: Repository[]
  bookmarkedIds: Set<number>
  notes: Map<number, string>  // repo id -> note
  lastVisit: string | null
  seenRepoIds: Set<number>
  addBookmark: (repo: Repository) => void
  removeBookmark: (repoId: number) => void
  toggleBookmark: (repo: Repository) => void
  isBookmarked: (repoId: number) => boolean
  setNote: (repoId: number, note: string) => void
  getNote: (repoId: number) => string | undefined
  markAsSeen: (repoIds: number[]) => void
  isNew: (repoId: number) => boolean
  updateLastVisit: () => void
}

export const useBookmarks = create<BookmarksState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      bookmarkedIds: new Set(),
      notes: new Map(),
      lastVisit: null,
      seenRepoIds: new Set(),

      addBookmark: (repo) =>
        set((state) => ({
          bookmarks: [repo, ...state.bookmarks],
          bookmarkedIds: new Set([...state.bookmarkedIds, repo.id]),
        })),

      removeBookmark: (repoId) =>
        set((state) => {
          const newNotes = new Map(state.notes)
          newNotes.delete(repoId)
          return {
            bookmarks: state.bookmarks.filter((r) => r.id !== repoId),
            bookmarkedIds: new Set([...state.bookmarkedIds].filter((id) => id !== repoId)),
            notes: newNotes,
          }
        }),

      toggleBookmark: (repo) => {
        const { isBookmarked, addBookmark, removeBookmark } = get()
        if (isBookmarked(repo.id)) {
          removeBookmark(repo.id)
        } else {
          addBookmark(repo)
        }
      },

      isBookmarked: (repoId) => get().bookmarkedIds.has(repoId),

      setNote: (repoId, note) =>
        set((state) => {
          const newNotes = new Map(state.notes)
          if (note.trim()) {
            newNotes.set(repoId, note)
          } else {
            newNotes.delete(repoId)
          }
          return { notes: newNotes }
        }),

      getNote: (repoId) => get().notes.get(repoId),

      markAsSeen: (repoIds) =>
        set((state) => ({
          seenRepoIds: new Set([...state.seenRepoIds, ...repoIds]),
        })),

      isNew: (repoId) => !get().seenRepoIds.has(repoId),

      updateLastVisit: () =>
        set({ lastVisit: new Date().toISOString() }),
    }),
    {
      name: 'githunt-bookmarks',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        bookmarkedIds: Array.from(state.bookmarkedIds),
        notes: Array.from(state.notes.entries()),
        lastVisit: state.lastVisit,
        seenRepoIds: Array.from(state.seenRepoIds).slice(-1000), // Keep last 1000
      }),
      merge: (persisted, current) => {
        const data = persisted as {
          bookmarks?: Repository[]
          bookmarkedIds?: number[]
          notes?: [number, string][]
          lastVisit?: string | null
          seenRepoIds?: number[]
        }
        return {
          ...current,
          bookmarks: data.bookmarks || [],
          bookmarkedIds: new Set(data.bookmarkedIds || []),
          notes: new Map(data.notes || []),
          lastVisit: data.lastVisit || null,
          seenRepoIds: new Set(data.seenRepoIds || []),
        }
      },
    }
  )
)
