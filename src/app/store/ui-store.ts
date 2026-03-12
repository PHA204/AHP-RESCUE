import { create } from 'zustand'

type ThemeMode = 'dark' | 'light'

type UiState = {
  theme: ThemeMode
  selectedCaseId: string | null
  selectedSourcePostId: string | null
  activePresetId: string
  isContextDrawerOpen: boolean
  setTheme: (theme: ThemeMode) => void
  setSelectedCaseId: (caseId: string | null) => void
  setSelectedSourcePostId: (postId: string | null) => void
  setActivePresetId: (presetId: string) => void
  setContextDrawerOpen: (isOpen: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  selectedCaseId: null,
  selectedSourcePostId: null,
  activePresetId: 'balanced',
  isContextDrawerOpen: true,
  setTheme: (theme) => set({ theme }),
  setSelectedCaseId: (selectedCaseId) =>
    set({
      selectedCaseId,
      isContextDrawerOpen: selectedCaseId !== null,
    }),
  setSelectedSourcePostId: (selectedSourcePostId) => set({ selectedSourcePostId }),
  setActivePresetId: (activePresetId) => set({ activePresetId }),
  setContextDrawerOpen: (isContextDrawerOpen) => set({ isContextDrawerOpen }),
}))
