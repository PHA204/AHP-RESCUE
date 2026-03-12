import { ahpPresets, dispatchTeams, incomingEvents, monitoredPosts, pipelineStatus, rescueCases } from './data'
import { rankCases } from '../shared/lib/ahp'
import type { DashboardStats, RescueCase } from '../shared/types/domain'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function withScore(caseItem: RescueCase, rankedCases: ReturnType<typeof rankCases>['rankedCases']) {
  const rank = rankedCases.find((item) => item.caseId === caseItem.id)
  return {
    ...caseItem,
    currentScore: rank?.finalScore,
    currentRank: rank?.rank,
  }
}

export async function fetchCases(activePresetId = 'balanced') {
  await delay(360)
  const preset = ahpPresets.find((item) => item.id === activePresetId) ?? ahpPresets[0]
  const rankResult = rankCases(
    rescueCases.filter((item) => item.severity !== 'NOT_RESCUE'),
    preset.matrix,
  )

  return rescueCases.map((item) => withScore(item, rankResult.rankedCases))
}

export async function fetchDashboard(activePresetId = 'balanced') {
  await delay(420)
  const cases = await fetchCases(activePresetId)
  const currentPreset = ahpPresets.find((item) => item.id === activePresetId) ?? ahpPresets[0]
  const ranked = rankCases(
    rescueCases.filter((item) => item.severity !== 'NOT_RESCUE'),
    currentPreset.matrix,
  )
  const latestSync = monitoredPosts.reduce(
    (latest, item) => (item.lastSyncAt > latest ? item.lastSyncAt : latest),
    monitoredPosts[0].lastSyncAt,
  )

  const stats: DashboardStats = {
    totalIncomingCases: cases.length,
    waitingCases: cases.filter((item) => item.rescueStatus === 'waiting').length,
    criticalCount: cases.filter((item) => item.severity === 'CRITICAL').length,
    geocodedCount: cases.filter((item) => item.geocodeStatus === 'success').length,
    activePosts: monitoredPosts.filter((item) => item.syncStatus === 'live').length,
    shortlistedCount: ranked.rankedCases.filter((item) => item.rank <= 8).length,
    lastSyncAt: latestSync,
    currentPresetLabel: currentPreset.label,
    consistencyRatio: ranked.consistencyRatio,
  }

  return {
    stats,
    cases,
    posts: monitoredPosts,
    events: incomingEvents,
    pipelineStatus,
    presets: ahpPresets,
  }
}

export async function fetchPosts() {
  await delay(280)
  return monitoredPosts
}

export async function fetchPresets() {
  await delay(180)
  return ahpPresets
}

export async function fetchPipelineStatus() {
  await delay(240)
  return pipelineStatus
}

export async function fetchDispatchTeams() {
  await delay(220)
  return dispatchTeams
}
