export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_RESCUE'
export type RescueStatus = 'waiting' | 'dispatched' | 'rescued' | 'false_alarm'
export type GeocodeStatus = 'pending' | 'success' | 'failed'
export type AccessibilityLevel = 'EASY' | 'MODERATE' | 'HARD'
export type CriterionKey =
  | 'danger_level'
  | 'num_people'
  | 'vulnerable_groups'
  | 'waiting_time'
  | 'accessibility'

export type RescueCase = {
  id: string
  sourcePostId: string
  rawComment: string
  commenterName?: string
  severity: SeverityLevel
  locationDescription?: string
  normalizedAddress?: string
  district: string
  lat?: number
  lng?: number
  numPeople?: number
  vulnerableGroups: string[]
  accessibility?: AccessibilityLevel
  waitingHours?: number
  aiConfidence?: number
  geocodeStatus: GeocodeStatus
  rescueStatus: RescueStatus
  currentScore?: number
  currentRank?: number
  createdAt: string
  updatedAt: string
}

export type MonitoredPost = {
  id: string
  title: string
  sourceName: string
  syncStatus: 'live' | 'lagging' | 'paused'
  commentVolume: number
  lastSyncAt: string
  districtScope: string[]
}

export type PipelineStatus = {
  scraper: 'healthy' | 'degraded' | 'offline'
  aiInference: 'healthy' | 'degraded' | 'offline'
  geocoding: 'healthy' | 'degraded' | 'offline'
  realtime: 'healthy' | 'degraded' | 'offline'
}

export type DashboardStats = {
  totalIncomingCases: number
  waitingCases: number
  criticalCount: number
  geocodedCount: number
  activePosts: number
  shortlistedCount: number
  lastSyncAt: string
  currentPresetLabel: string
  consistencyRatio: number
}

export type IncomingEvent = {
  id: string
  type: 'new_case' | 'rescued' | 'geocode_failed' | 'ai_refresh'
  caseId?: string
  title: string
  detail: string
  createdAt: string
}

export type PairwiseMatrixPayload = {
  criteria: CriterionKey[]
  matrix: number[][]
}

export type AHPPreset = {
  id: string
  label: string
  description: string
  matrix: number[][]
}

export type AHPResult = {
  criteriaWeights: Record<CriterionKey, number>
  consistencyRatio: number
  isConsistent: boolean
  rankedCases: Array<{
    caseId: string
    finalScore: number
    rank: number
    contributionByCriterion: Record<CriterionKey, number>
  }>
}

export type DispatchTeam = {
  id: string
  name: string
  district: string
  status: 'available' | 'en_route' | 'busy'
  capacity: number
}
