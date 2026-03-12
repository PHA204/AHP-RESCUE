import type { CriterionKey, RescueCase } from './domain'

export type MatrixAnalysis = {
  matrix: number[][]
  normalizedMatrix: number[][]
  weights: number[]
  weightedSumVector: number[]
  consistencyVector: number[]
  columnSums: number[]
  lambdaMax: number
  consistencyIndex: number
  randomIndex: number
  consistencyRatio: number
  isConsistent: boolean
}

export type CriteriaMatrixAnalysis = MatrixAnalysis & {
  weightsByCriterion: Record<CriterionKey, number>
}

export type AlternativeMatrixMap = Record<CriterionKey, number[][]>

export type AlternativeAnalysisMap = Record<CriterionKey, MatrixAnalysis>

export type SynthesisRow = {
  caseId: string
  caseItem: RescueCase
  alternativeWeights: Record<CriterionKey, number>
  contributionByCriterion: Record<CriterionKey, number>
  finalScore: number
  rank: number
}

export type AHPEvaluationResult = {
  criteria: CriteriaMatrixAnalysis
  alternatives: AlternativeAnalysisMap
  synthesisMatrix: number[][]
  synthesisRows: SynthesisRow[]
  isFullyConsistent: boolean
}
