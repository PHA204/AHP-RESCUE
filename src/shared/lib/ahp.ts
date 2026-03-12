import type { CriterionKey, RescueCase } from '../types/domain'
import type {
  AHPEvaluationResult,
  AlternativeMatrixMap,
  CriteriaMatrixAnalysis,
  MatrixAnalysis,
} from '../types/ahp'

export const criteriaOrder: CriterionKey[] = [
  'danger_level',
  'num_people',
  'vulnerable_groups',
  'waiting_time',
  'accessibility',
]

export const criteriaLabels: Record<CriterionKey, string> = {
  danger_level: 'Mức độ nguy hiểm',
  num_people: 'Số người mắc kẹt',
  vulnerable_groups: 'Nhóm dễ tổn thương',
  waiting_time: 'Thời gian chờ cứu hộ',
  accessibility: 'Khả năng tiếp cận',
}

export const saatyScale = [
  { value: 9, label: '9' },
  { value: 8, label: '8' },
  { value: 7, label: '7' },
  { value: 6, label: '6' },
  { value: 5, label: '5' },
  { value: 4, label: '4' },
  { value: 3, label: '3' },
  { value: 2, label: '2' },
  { value: 1, label: '1' },
  { value: 1 / 2, label: '1/2' },
  { value: 1 / 3, label: '1/3' },
  { value: 1 / 4, label: '1/4' },
  { value: 1 / 5, label: '1/5' },
  { value: 1 / 6, label: '1/6' },
  { value: 1 / 7, label: '1/7' },
  { value: 1 / 8, label: '1/8' },
  { value: 1 / 9, label: '1/9' },
]

const randomIndexTable = [0, 0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45]

const severityScore = {
  CRITICAL: 1,
  HIGH: 0.76,
  MEDIUM: 0.46,
  LOW: 0.2,
  NOT_RESCUE: 0,
}

const accessibilityScore = {
  HARD: 1,
  MODERATE: 0.62,
  EASY: 0.28,
}

export function createIdentityMatrix(size: number) {
  return Array.from({ length: size }, (_, rowIndex) =>
    Array.from({ length: size }, (_, columnIndex) => (rowIndex === columnIndex ? 1 : 1)),
  )
}

export function setMatrixValue(matrix: number[][], rowIndex: number, columnIndex: number, value: number) {
  return matrix.map((row, sourceRowIndex) =>
    row.map((cell, sourceColumnIndex) => {
      if (sourceRowIndex === sourceColumnIndex) return 1
      if (sourceRowIndex === rowIndex && sourceColumnIndex === columnIndex) return value
      if (sourceRowIndex === columnIndex && sourceColumnIndex === rowIndex) return 1 / value
      return cell
    }),
  )
}

export function analyzePairwiseMatrix(matrix: number[][]): MatrixAnalysis {
  const size = matrix.length
  const safeMatrix = size > 0 ? matrix : [[1]]

  const columnSums = Array.from({ length: safeMatrix.length }, (_, columnIndex) =>
    safeMatrix.reduce((sum, row) => sum + row[columnIndex], 0),
  )

  const normalizedMatrix = safeMatrix.map((row) =>
    row.map((value, columnIndex) => value / (columnSums[columnIndex] || 1)),
  )

  const weights = normalizedMatrix.map(
    (row) => row.reduce((sum, value) => sum + value, 0) / normalizedMatrix.length,
  )

  const weightedSumVector = safeMatrix.map((row) =>
    row.reduce((sum, value, columnIndex) => sum + value * weights[columnIndex], 0),
  )

  const consistencyVector = weightedSumVector.map((value, index) =>
    weights[index] > 0 ? value / weights[index] : 0,
  )

  const lambdaMax =
    consistencyVector.reduce((sum, value) => sum + value, 0) / consistencyVector.length

  const randomIndex = randomIndexTable[safeMatrix.length] ?? randomIndexTable[randomIndexTable.length - 1]
  const consistencyIndex =
    safeMatrix.length <= 2 ? 0 : (lambdaMax - safeMatrix.length) / (safeMatrix.length - 1)
  const consistencyRatio = randomIndex === 0 ? 0 : consistencyIndex / randomIndex

  return {
    matrix: safeMatrix,
    normalizedMatrix,
    weights,
    weightedSumVector,
    consistencyVector,
    columnSums,
    lambdaMax,
    consistencyIndex,
    randomIndex,
    consistencyRatio,
    isConsistent: consistencyRatio < 0.1,
  }
}

export function calculateAHP(matrix: number[][]): CriteriaMatrixAnalysis {
  const analysis = analyzePairwiseMatrix(matrix)
  const weightsByCriterion = criteriaOrder.reduce(
    (accumulator, criterionKey, index) => {
      accumulator[criterionKey] = analysis.weights[index] ?? 0
      return accumulator
    },
    {} as Record<CriterionKey, number>,
  )

  return {
    ...analysis,
    weightsByCriterion,
  }
}

function normalize(value: number, max: number) {
  if (max <= 0) return 0
  return value / max
}

function vulnerableScore(vulnerableGroups: string[]) {
  const base = vulnerableGroups.length * 0.2
  const extra = vulnerableGroups.reduce((sum, group) => {
    const normalizedGroup = group
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
    if (normalizedGroup === 'tre em' || normalizedGroup === 'nguoi gia') return sum + 0.18
    if (
      normalizedGroup === 'phu nu mang thai' ||
      normalizedGroup === 'nguoi khuyet tat'
    ) {
      return sum + 0.16
    }
    return sum + 0.08
  }, 0)

  return Math.min(1, base + extra)
}

function buildCriterionSnapshot(cases: RescueCase[]) {
  return {
    maxPeople: Math.max(...cases.map((item) => item.numPeople ?? 0), 1),
    maxWaiting: Math.max(...cases.map((item) => item.waitingHours ?? 0), 1),
  }
}

export function getCaseCriterionScore(
  caseItem: RescueCase,
  criterionKey: CriterionKey,
  snapshot: ReturnType<typeof buildCriterionSnapshot>,
) {
  switch (criterionKey) {
    case 'danger_level':
      return severityScore[caseItem.severity]
    case 'num_people':
      return normalize(caseItem.numPeople ?? 0, snapshot.maxPeople)
    case 'vulnerable_groups':
      return vulnerableScore(caseItem.vulnerableGroups)
    case 'waiting_time':
      return normalize(caseItem.waitingHours ?? 0, snapshot.maxWaiting)
    case 'accessibility':
      return caseItem.accessibility ? accessibilityScore[caseItem.accessibility] : 0
    default:
      return 0
  }
}

function nearestSaatyValue(value: number) {
  return saatyScale.reduce((closest, option) => {
    const closestDistance = Math.abs(closest.value - value)
    const currentDistance = Math.abs(option.value - value)
    return currentDistance < closestDistance ? option : closest
  }, saatyScale[0]).value
}

function clampSaatyRange(value: number) {
  return Math.min(9, Math.max(1 / 9, value))
}

export function createAlternativeMatrixForCriterion(
  cases: RescueCase[],
  criterionKey: CriterionKey,
  options?: { quantize?: boolean },
) {
  const quantize = options?.quantize ?? false
  const snapshot = buildCriterionSnapshot(cases)
  const rawScores = cases.map((caseItem) =>
    Math.max(getCaseCriterionScore(caseItem, criterionKey, snapshot), 0.01),
  )

  return rawScores.map((rowScore, rowIndex) =>
    rawScores.map((columnScore, columnIndex) => {
      if (rowIndex === columnIndex) return 1
      const ratio = clampSaatyRange(rowScore / columnScore)
      return quantize ? nearestSaatyValue(ratio) : ratio
    }),
  )
}

export function createAlternativeMatrices(
  cases: RescueCase[],
  options?: { quantize?: boolean },
): AlternativeMatrixMap {
  return criteriaOrder.reduce(
    (accumulator, criterionKey) => {
      accumulator[criterionKey] = createAlternativeMatrixForCriterion(cases, criterionKey, options)
      return accumulator
    },
    {} as AlternativeMatrixMap,
  )
}

export function evaluateAHP(
  cases: RescueCase[],
  criteriaMatrix: number[][],
  alternativeMatrices?: AlternativeMatrixMap,
): AHPEvaluationResult {
  const criteria = calculateAHP(criteriaMatrix)
  const resolvedAlternativeMatrices = alternativeMatrices ?? createAlternativeMatrices(cases)

  const alternatives = criteriaOrder.reduce(
    (accumulator, criterionKey) => {
      accumulator[criterionKey] = analyzePairwiseMatrix(
        resolvedAlternativeMatrices[criterionKey] ?? createIdentityMatrix(cases.length),
      )
      return accumulator
    },
    {} as AHPEvaluationResult['alternatives'],
  )

  const synthesisRows = cases
    .map((caseItem, caseIndex) => {
      const alternativeWeights = criteriaOrder.reduce(
        (accumulator, criterionKey) => {
          accumulator[criterionKey] = alternatives[criterionKey].weights[caseIndex] ?? 0
          return accumulator
        },
        {} as Record<CriterionKey, number>,
      )

      const contributionByCriterion = criteriaOrder.reduce(
        (accumulator, criterionKey) => {
          accumulator[criterionKey] =
            alternativeWeights[criterionKey] * criteria.weightsByCriterion[criterionKey]
          return accumulator
        },
        {} as Record<CriterionKey, number>,
      )

      const finalScore = criteriaOrder.reduce(
        (sum, criterionKey) => sum + contributionByCriterion[criterionKey],
        0,
      )

      return {
        caseId: caseItem.id,
        caseItem,
        alternativeWeights,
        contributionByCriterion,
        finalScore,
        rank: 0,
      }
    })
    .sort((left, right) => right.finalScore - left.finalScore)
    .map((row, index) => ({ ...row, rank: index + 1 }))

  const synthesisMatrix = cases.map((_, caseIndex) =>
    criteriaOrder.map((criterionKey) => alternatives[criterionKey].weights[caseIndex] ?? 0),
  )

  const isFullyConsistent =
    criteria.isConsistent &&
    criteriaOrder.every((criterionKey) => alternatives[criterionKey].isConsistent)

  return {
    criteria,
    alternatives,
    synthesisMatrix,
    synthesisRows,
    isFullyConsistent,
  }
}

export function rankCases(cases: RescueCase[], criteriaMatrix: number[][]) {
  const evaluation = evaluateAHP(cases, criteriaMatrix)

  return {
    criteriaWeights: evaluation.criteria.weightsByCriterion,
    consistencyRatio: evaluation.criteria.consistencyRatio,
    isConsistent: evaluation.isFullyConsistent,
    rankedCases: evaluation.synthesisRows.map((row) => ({
      caseId: row.caseId,
      finalScore: row.finalScore,
      rank: row.rank,
      contributionByCriterion: row.contributionByCriterion,
    })),
  }
}

export function formatSaatyLabel(value: number) {
  const match = saatyScale.find((item) => Math.abs(item.value - value) < 0.0001)
  if (match) return match.label

  if (value >= 1) {
    if (Number.isInteger(value)) return String(value)
    return value.toFixed(2)
  }

  const reciprocal = 1 / value
  if (Math.abs(reciprocal - Math.round(reciprocal)) < 0.05) {
    return `1/${Math.round(reciprocal)}`
  }

  return value.toFixed(2)
}
