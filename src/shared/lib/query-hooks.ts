import { useQuery } from '@tanstack/react-query'
import {
  fetchCases,
  fetchDashboard,
  fetchDispatchTeams,
  fetchPipelineStatus,
  fetchPosts,
  fetchPresets,
} from '@/lib/api'

export function useDashboardQuery(activePresetId: string) {
  return useQuery({
    queryKey: ['dashboard', activePresetId],
    queryFn: () => fetchDashboard(activePresetId),
  })
}

export function useCasesQuery(activePresetId: string) {
  return useQuery({
    queryKey: ['cases', activePresetId],
    queryFn: () => fetchCases(activePresetId),
  })
}

export function usePostsQuery() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })
}

export function usePresetsQuery() {
  return useQuery({
    queryKey: ['presets'],
    queryFn: fetchPresets,
  })
}

export function usePipelineStatusQuery() {
  return useQuery({
    queryKey: ['pipeline-status'],
    queryFn: fetchPipelineStatus,
  })
}

export function useDispatchTeamsQuery() {
  return useQuery({
    queryKey: ['dispatch-teams'],
    queryFn: fetchDispatchTeams,
  })
}
