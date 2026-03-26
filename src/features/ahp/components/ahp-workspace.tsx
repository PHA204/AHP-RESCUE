// REFACTORED: redesigned the AHP workspace into a guided step flow with onboarding, safer reset UX, and clearer preset discovery
import { startTransition, useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Filter,
  GitBranch,
  Info,
  Layers3,
  LoaderCircle,
  RotateCcw,
  Scale,
  Sigma,
  TriangleAlert,
  X,
} from 'lucide-react'
import { useUiStore } from '../../../app/store/ui-store'
import { EmptyState } from '../../../shared/components/ui/empty-state'
import { LoadingCard } from '../../../shared/components/ui/loading-card'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'
import { StatusBadge } from '../../../shared/components/ui/status-badge'
import {
  calculateAHP,
  createAlternativeMatrices,
  createIdentityMatrix,
  evaluateAHP,
  setMatrixValue,
} from '../../../shared/lib/ahp'
import { useCasesQuery, usePresetsQuery } from '../../../shared/lib/query-hooks'
import { severityConfig } from '../../../shared/lib/severity'
import type { AlternativeMatrixMap } from '../../../shared/types/ahp'
import type { AHPPreset, CriterionKey, SeverityLevel } from '../../../shared/types/domain'
import { AhpAlternativeMatricesSection } from './ahp-alternative-matrices-section'
import { AhpBlockStepper } from './ahp-block-stepper'
import { AhpConsistencyPanel } from './ahp-consistency-panel'
import { AhpFormulaPanel } from './ahp-formula-panel'
import { AhpHierarchyVisual } from './ahp-hierarchy-visual'
import { AhpPairwiseMatrixEditor } from './ahp-pairwise-matrix-editor'
import { AhpProcessOverview } from './ahp-process-overview'
import { AhpRankingResults } from './ahp-ranking-results'
import { AhpSynthesisSection } from './ahp-synthesis-section'

type ScreeningState = {
  severity: Array<Extract<SeverityLevel, 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>>
  vulnerableOnly: boolean
  waitingHoursMin: number
  district: string
  geocodedOnly: boolean
  maxCandidates: number
}

type WorkspaceView = 'overview' | 'screening' | 'criteria' | 'alternatives' | 'results'
type OverviewBlock = 'theory' | 'hierarchy' | 'formula'
type CriteriaBlock = 'matrix' | 'consistency'
type AlternativeBlock = 'matrix' | 'consistency'
type ResultsBlock = 'synthesis' | 'ranking' | 'decision'

type WizardItem = {
  id: WorkspaceView
  label: string
  icon: ComponentType<{ className?: string }>
}

const defaultScreening: ScreeningState = {
  severity: ['CRITICAL', 'HIGH', 'MEDIUM'],
  vulnerableOnly: false,
  waitingHoursMin: 0,
  district: 'ALL',
  geocodedOnly: true,
  maxCandidates: 5,
}

const wizardItems: WizardItem[] = [
  { id: 'overview', label: 'Tổng quan', icon: GitBranch },
  { id: 'screening', label: 'Lọc trước', icon: Filter },
  { id: 'criteria', label: 'Tiêu chí', icon: Scale },
  { id: 'alternatives', label: 'Phương án', icon: Layers3 },
  { id: 'results', label: 'Kết quả', icon: Sigma },
]

const criterionDisplayLabels: Record<CriterionKey, string> = {
  danger_level: 'Mức độ nguy hiểm',
  num_people: 'Số người mắc kẹt',
  vulnerable_groups: 'Nhóm dễ tổn thương',
  waiting_time: 'Thời gian chờ cứu hộ',
  accessibility: 'Khả năng tiếp cận',
}

const onboardingStorageKey = 'ahp-onboarding-dismissed'

export function AhpWorkspace() {
  const activePresetId = useUiStore((state) => state.activePresetId)
  const setActivePresetId = useUiStore((state) => state.setActivePresetId)
  const selectedCaseId = useUiStore((state) => state.selectedCaseId)
  const setSelectedCaseId = useUiStore((state) => state.setSelectedCaseId)
  const presetsQuery = usePresetsQuery()
  const casesQuery = useCasesQuery(activePresetId)

  const presets = useMemo(() => presetsQuery.data ?? [], [presetsQuery.data])
  const currentPreset = presets.find((item) => item.id === activePresetId) ?? presets[0]

  const [activeView, setActiveView] = useState<WorkspaceView>('overview')
  const [activeOverviewBlock, setActiveOverviewBlock] = useState<OverviewBlock>('theory')
  const [activeCriteriaBlock, setActiveCriteriaBlock] = useState<CriteriaBlock>('matrix')
  const [activeAlternativeBlock, setActiveAlternativeBlock] = useState<AlternativeBlock>('matrix')
  const [activeResultsBlock, setActiveResultsBlock] = useState<ResultsBlock>('synthesis')
  const [screening, setScreening] = useState<ScreeningState>(defaultScreening)
  const [manualExclusions, setManualExclusions] = useState<string[]>([])
  const [criteriaMatrix, setCriteriaMatrix] = useState<number[][]>(
    currentPreset?.matrix ?? createIdentityMatrix(Object.keys(criterionDisplayLabels).length),
  )
  const [alternativeMatrixState, setAlternativeMatrixState] = useState<{
    screeningKey: string
    matrices: AlternativeMatrixMap
  } | null>(null)
  const [activeAlternativeCriterion, setActiveAlternativeCriterion] =
    useState<CriterionKey>('danger_level')
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(onboardingStorageKey) !== 'true'
    } catch {
      return true
    }
  })
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const recalculationTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!currentPreset) return
    startTransition(() => {
      setCriteriaMatrix(currentPreset.matrix)
    })
  }, [currentPreset])

  const screenedCases = useMemo(() => {
    const source = casesQuery.data ?? []
    return source
      .filter((caseItem) => caseItem.severity !== 'NOT_RESCUE')
      .filter((caseItem) =>
        screening.severity.includes(caseItem.severity as ScreeningState['severity'][number]),
      )
      .filter((caseItem) =>
        screening.vulnerableOnly ? caseItem.vulnerableGroups.length > 0 : true,
      )
      .filter((caseItem) => (screening.geocodedOnly ? caseItem.geocodeStatus === 'success' : true))
      .filter((caseItem) => (caseItem.waitingHours ?? 0) >= screening.waitingHoursMin)
      .filter((caseItem) => (screening.district === 'ALL' ? true : caseItem.district === screening.district))
      .filter((caseItem) => !manualExclusions.includes(caseItem.id))
      .sort((left, right) => (left.currentRank ?? 99) - (right.currentRank ?? 99))
      .slice(0, screening.maxCandidates)
  }, [casesQuery.data, manualExclusions, screening])

  const screeningKey = useMemo(
    () => screenedCases.map((caseItem) => caseItem.id).join('|'),
    [screenedCases],
  )

  const alternativeMatrices = useMemo(
    () =>
      alternativeMatrixState?.screeningKey === screeningKey
        ? alternativeMatrixState.matrices
        : createAlternativeMatrices(screenedCases),
    [alternativeMatrixState, screenedCases, screeningKey],
  )

  const evaluation = useMemo(
    () => evaluateAHP(screenedCases, criteriaMatrix, alternativeMatrices),
    [alternativeMatrices, criteriaMatrix, screenedCases],
  )

  const presetBreakdowns = useMemo(
    () =>
      Object.fromEntries(
        presets.map((preset) => {
          const weightsByCriterion = calculateAHP(preset.matrix).weightsByCriterion
          const breakdown = Object.entries(criterionDisplayLabels)
            .map(([criterionKey, label]) => `${label}: ${Math.round((weightsByCriterion[criterionKey as CriterionKey] ?? 0) * 100)}%`)
            .join(' | ')
          return [preset.id, breakdown]
        }),
      ) as Record<string, string>,
    [presets],
  )

  const selectedResult =
    evaluation.synthesisRows.find((row) => row.caseId === selectedCaseId) ??
    evaluation.synthesisRows[0]
  const districts = Array.from(new Set((casesQuery.data ?? []).map((item) => item.district))).sort()

  const hasEnoughCandidates = screenedCases.length >= 2
  const alternativesConsistent = Object.values(evaluation.alternatives).every(
    (analysis) => analysis.isConsistent,
  )
  const canOpenResults = hasEnoughCandidates && evaluation.criteria.isConsistent && alternativesConsistent
  const resolvedActiveView: WorkspaceView =
    !hasEnoughCandidates && ['criteria', 'alternatives', 'results'].includes(activeView)
      ? 'screening'
      : !canOpenResults && activeView === 'results'
        ? 'criteria'
        : activeView

  const triggerRecalculationPulse = () => {
    setIsRecalculating(true)
    if (recalculationTimeoutRef.current) {
      window.clearTimeout(recalculationTimeoutRef.current)
    }
    recalculationTimeoutRef.current = window.setTimeout(() => setIsRecalculating(false), 300)
  }

  useEffect(
    () => () => {
      if (recalculationTimeoutRef.current) {
        window.clearTimeout(recalculationTimeoutRef.current)
      }
    },
    [],
  )

  if (casesQuery.isLoading || presetsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <LoadingCard className="h-28" />
        <LoadingCard className="h-[28rem]" />
      </div>
    )
  }

  const handlePresetSelect = (presetId: string) => {
    triggerRecalculationPulse()
    setActivePresetId(presetId)
  }

  const updateScreening = (updater: (current: ScreeningState) => ScreeningState) => {
    triggerRecalculationPulse()
    setScreening(updater)
  }

  const handleCriteriaMatrixChange = (
    rowIndex: number,
    columnIndex: number,
    nextValue: number,
  ) => {
    triggerRecalculationPulse()
    setCriteriaMatrix((current) => setMatrixValue(current, rowIndex, columnIndex, nextValue))
  }

  const handleAlternativeMatrixChange = (criterionKey: CriterionKey, nextMatrix: number[][]) => {
    triggerRecalculationPulse()
    setAlternativeMatrixState({
      screeningKey,
      matrices: {
        ...alternativeMatrices,
        [criterionKey]: nextMatrix,
      },
    })
  }

  const handleCaseInclusionChange = (caseId: string, checked: boolean) => {
    triggerRecalculationPulse()
    setManualExclusions((current) =>
      checked ? current.filter((item) => item !== caseId) : [...current, caseId],
    )
  }

  const handleDismissOnboarding = () => {
    setShowOnboarding(false)
    setActiveView('overview')
    try {
      window.localStorage.setItem(onboardingStorageKey, 'true')
    } catch {
      // ignore storage errors in restricted contexts
    }
  }

  const handleReset = () => {
    if (!currentPreset) return
    triggerRecalculationPulse()
    setScreening(defaultScreening)
    setManualExclusions([])
    setCriteriaMatrix(currentPreset.matrix)
    setAlternativeMatrixState(null)
    setActiveAlternativeCriterion('danger_level')
    setActiveOverviewBlock('theory')
    setActiveCriteriaBlock('matrix')
    setActiveAlternativeBlock('matrix')
    setActiveResultsBlock('synthesis')
    setActiveView('overview')
    setIsResetDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      {showOnboarding ? <OnboardingBanner onDismiss={handleDismissOnboarding} /> : null}

      <Panel className="p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">AHP</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Không gian làm việc AHP
            </h2>
          </div>

          <PresetSelectorRow
            presets={presets}
            activePresetId={activePresetId}
            onSelectPreset={handlePresetSelect}
            breakdownByPreset={presetBreakdowns}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-[#f8f5ef] px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600">
              Đang dùng:{' '}
              <strong className="font-semibold text-slate-900">{currentPreset?.label ?? 'Không có'}</strong>
            </span>
            <StatusBadge tone="info">{screenedCases.length} phương án</StatusBadge>
            <StatusBadge tone={isRecalculating ? 'info' : evaluation.isFullyConsistent ? 'success' : 'warning'}>
              {isRecalculating ? <LoaderCircle className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              {isRecalculating
                ? 'Đang tính toán...'
                : evaluation.isFullyConsistent
                  ? 'CR hợp lệ'
                  : 'CR cần xem lại'}
            </StatusBadge>
          </div>

          <button
            type="button"
            onClick={() => setIsResetDialogOpen(true)}
            className="clay-button-secondary px-4 py-3 text-sm"
          >
            <RotateCcw className="size-4" />
            Đặt lại
          </button>
        </div>
      </Panel>

      <Panel className="p-4 md:p-5">
        <WorkspaceStepWizard
          items={wizardItems}
          activeView={resolvedActiveView}
          onChange={setActiveView}
          hasEnoughCandidates={hasEnoughCandidates}
          canOpenResults={canOpenResults}
          criteriaConsistent={evaluation.criteria.isConsistent}
          alternativesConsistent={alternativesConsistent}
        />
      </Panel>

      {resolvedActiveView === 'overview' ? (
        <div className="space-y-4">
          <Panel className="p-4 md:p-5">
            <AhpBlockStepper
              title="Tổng quan"
              subtitle=""
              steps={[
                { id: 'theory', label: 'Lý thuyết' },
                { id: 'hierarchy', label: 'Cấu trúc' },
                { id: 'formula', label: 'Công thức' },
              ]}
              activeStepId={activeOverviewBlock}
              onChange={(stepId) => setActiveOverviewBlock(stepId as OverviewBlock)}
            />
          </Panel>

          {activeOverviewBlock === 'theory' ? <AhpProcessOverview screenedCases={screenedCases} /> : null}
          {activeOverviewBlock === 'hierarchy' ? <AhpHierarchyVisual screenedCases={screenedCases} /> : null}
          {activeOverviewBlock === 'formula' ? <AhpFormulaPanel /> : null}
        </div>
      ) : null}

      {resolvedActiveView === 'screening' ? (
        <Panel className="p-5 md:p-6">
          <SectionHeading
            eyebrow="Lọc trước"
            title="Lọc trước khi tính AHP"
            action={
              <StatusBadge tone="info">
                <Filter className="size-3.5" />
                {screenedCases.length} phương án
              </StatusBadge>
            }
          />

          <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={screening.district}
                  onChange={(event) =>
                    updateScreening((current) => ({ ...current, district: event.target.value }))
                  }
                  className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                >
                  <option value="ALL">Tất cả khu vực</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>

                <select
                  value={screening.maxCandidates}
                  onChange={(event) =>
                    updateScreening((current) => ({
                      ...current,
                      maxCandidates: Number(event.target.value),
                    }))
                  }
                  className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                >
                  {[4, 5, 6].map((count) => (
                    <option key={count} value={count}>
                      Top {count} phương án
                    </option>
                  ))}
                </select>
              </div>

              <label className="block rounded-[1.5rem] bg-[#e9f6ff] px-4 py-4 text-sm text-slate-700">
                Chờ ít nhất <strong>{screening.waitingHoursMin} giờ</strong>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={screening.waitingHoursMin}
                  onChange={(event) =>
                    updateScreening((current) => ({
                      ...current,
                      waitingHoursMin: Number(event.target.value),
                    }))
                  }
                  className="mt-3 w-full accent-sky-600"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((severity) => {
                  const active = screening.severity.includes(severity)
                  return (
                    <button
                      key={severity}
                      type="button"
                      onClick={() =>
                        updateScreening((current) => ({
                          ...current,
                          severity: active
                            ? current.severity.filter((item) => item !== severity)
                            : [...current.severity, severity],
                        }))
                      }
                      className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                        active
                          ? severityConfig[severity].tone
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {severityConfig[severity].label}
                    </button>
                  )
                })}
              </div>

              <label className="flex items-center gap-3 rounded-[1.35rem] bg-white px-4 py-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={screening.vulnerableOnly}
                  onChange={(event) =>
                    updateScreening((current) => ({
                      ...current,
                      vulnerableOnly: event.target.checked,
                    }))
                  }
                  className="size-4 rounded border-slate-300 accent-sky-600"
                />
                Chỉ giữ lại ca có nhóm dễ tổn thương
              </label>

              <label className="flex items-center gap-3 rounded-[1.35rem] bg-white px-4 py-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={screening.geocodedOnly}
                  onChange={(event) =>
                    updateScreening((current) => ({
                      ...current,
                      geocodedOnly: event.target.checked,
                    }))
                  }
                  className="size-4 rounded border-slate-300 accent-sky-600"
                />
                Chỉ dùng ca đã định vị
              </label>
            </div>

            <div className="rounded-[1.75rem] bg-[#f3efe8] p-4">
              <p className="text-sm font-semibold text-slate-900">Phương án đưa vào AHP</p>
              <div className="mt-4 space-y-2">
                {screenedCases.length > 0 ? (
                  screenedCases.map((caseItem, index) => (
                    <label
                      key={caseItem.id}
                      className="flex items-start gap-3 rounded-[1.35rem] bg-white px-3 py-3 text-sm text-slate-600"
                    >
                      <input
                        type="checkbox"
                        checked={!manualExclusions.includes(caseItem.id)}
                        onChange={(event) =>
                          handleCaseInclusionChange(caseItem.id, event.target.checked)
                        }
                        className="mt-1 size-4 rounded border-slate-300 accent-sky-600"
                      />
                      <span>
                        <strong className="text-slate-900">
                          A{index + 1} | {caseItem.locationDescription ?? caseItem.id}
                        </strong>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {caseItem.rawComment}
                        </span>
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Chưa có phương án sau khi lọc.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Panel>
      ) : null}

      {screenedCases.length < 2 ? (
        <EmptyState
          title="Cần ít nhất 2 phương án để lập ma trận AHP"
          description="Điều chỉnh bộ lọc để tiếp tục."
        />
      ) : null}

      {screenedCases.length >= 2 && resolvedActiveView === 'criteria' ? (
        <div className="space-y-4">
          <Panel className="p-4 md:p-5">
            <AhpBlockStepper
              title="Tiêu chí"
              subtitle={activeCriteriaBlock === 'matrix' ? 'Ma trận so sánh' : 'Độ nhất quán'}
              steps={[
                { id: 'matrix', label: 'Ma trận' },
                { id: 'consistency', label: 'Độ nhất quán' },
              ]}
              activeStepId={activeCriteriaBlock}
              onChange={(stepId) => setActiveCriteriaBlock(stepId as CriteriaBlock)}
            />
          </Panel>

          {activeCriteriaBlock === 'matrix' ? (
            <Panel className="p-5 md:p-6">
              <SectionHeading eyebrow="Bước 2" title="Ma trận so sánh cặp tiêu chí" />

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Mẫu AHP</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Chọn nhanh một mẫu để nạp cấu hình tiêu chí ngay trước khi chỉnh tay.
                  </p>
                </div>

                <PresetSelectorRow
                  presets={presets}
                  activePresetId={activePresetId}
                  onSelectPreset={handlePresetSelect}
                  breakdownByPreset={presetBreakdowns}
                />

                <AhpPairwiseMatrixEditor
                  labels={Object.values(criterionDisplayLabels)}
                  matrix={criteriaMatrix}
                  analysis={evaluation.criteria}
                  title="Ma trận tiêu chí"
                  description="So sánh từng tiêu chí với nhau theo thang Saaty để rút ra trọng số W."
                  onChange={handleCriteriaMatrixChange}
                />
              </div>
            </Panel>
          ) : null}

          {activeCriteriaBlock === 'consistency' ? (
            <AhpConsistencyPanel
              labels={Object.values(criterionDisplayLabels)}
              analysis={evaluation.criteria}
              title="Độ nhất quán của ma trận tiêu chí"
            />
          ) : null}
        </div>
      ) : null}

      {screenedCases.length >= 2 && resolvedActiveView === 'alternatives' ? (
        <div className="space-y-4">
          <Panel className="p-4 md:p-5">
            <AhpBlockStepper
              title="Phương án"
              subtitle={
                activeAlternativeBlock === 'matrix'
                  ? `Ma trận theo tiêu chí: ${criterionDisplayLabels[activeAlternativeCriterion]}`
                  : `Độ nhất quán: ${criterionDisplayLabels[activeAlternativeCriterion]}`
              }
              steps={[
                { id: 'matrix', label: 'Ma trận' },
                { id: 'consistency', label: 'Độ nhất quán' },
              ]}
              activeStepId={activeAlternativeBlock}
              onChange={(stepId) => setActiveAlternativeBlock(stepId as AlternativeBlock)}
            />
          </Panel>

          <AhpAlternativeMatricesSection
            cases={screenedCases}
            activeCriterion={activeAlternativeCriterion}
            onSelectCriterion={setActiveAlternativeCriterion}
            activeBlock={activeAlternativeBlock}
            matrices={alternativeMatrices}
            analyses={evaluation.alternatives}
            onChangeMatrix={handleAlternativeMatrixChange}
          />
        </div>
      ) : null}

      {screenedCases.length >= 2 && resolvedActiveView === 'results' ? (
        <div className="space-y-4">
          <Panel className="p-4 md:p-5">
            <AhpBlockStepper
              title="Kết quả"
              subtitle={
                activeResultsBlock === 'synthesis'
                  ? 'Tổng hợp điểm cuối'
                  : activeResultsBlock === 'ranking'
                    ? 'Xếp hạng phương án'
                    : 'Đề xuất điều phối'
              }
              steps={[
                { id: 'synthesis', label: 'Tổng hợp' },
                { id: 'ranking', label: 'Xếp hạng' },
                { id: 'decision', label: 'Đề xuất' },
              ]}
              activeStepId={activeResultsBlock}
              onChange={(stepId) => setActiveResultsBlock(stepId as ResultsBlock)}
            />
          </Panel>

          {activeResultsBlock === 'synthesis' ? <AhpSynthesisSection evaluation={evaluation} /> : null}

          {activeResultsBlock === 'ranking' ? (
            <AhpRankingResults
              evaluation={evaluation}
              selectedCaseId={selectedResult?.caseId ?? null}
              onSelectCase={setSelectedCaseId}
            />
          ) : null}

          {activeResultsBlock === 'decision' ? (
            <Panel className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge tone={evaluation.isFullyConsistent ? 'success' : 'warning'}>
                  <CheckCircle2 className="size-3.5" />
                  {evaluation.isFullyConsistent ? 'Sẵn sàng đề xuất' : 'Cần xem lại CR'}
                </StatusBadge>
              </div>

              {selectedResult ? (
                <div className="mt-4 rounded-[1.5rem] bg-[#eefbe7] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Phương án đề xuất
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {selectedResult.caseItem.locationDescription ?? selectedResult.caseId}
                  </p>
                </div>
              ) : null}
            </Panel>
          ) : null}
        </div>
      ) : null}

      {isResetDialogOpen ? (
        <ResetConfirmDialog onCancel={() => setIsResetDialogOpen(false)} onConfirm={handleReset} />
      ) : null}
    </div>
  )
}

function WorkspaceStepWizard({
  items,
  activeView,
  onChange,
  hasEnoughCandidates,
  canOpenResults,
  criteriaConsistent,
  alternativesConsistent,
}: {
  items: WizardItem[]
  activeView: WorkspaceView
  onChange: (view: WorkspaceView) => void
  hasEnoughCandidates: boolean
  canOpenResults: boolean
  criteriaConsistent: boolean
  alternativesConsistent: boolean
}) {
  const activeIndex = items.findIndex((item) => item.id === activeView)

  return (
    <div className="grid gap-3 md:grid-cols-5">
      {items.map((item, index) => {
        const Icon = item.icon
        const isActive = item.id === activeView
        const isCompleted = index < activeIndex
        const disabledReason = getDisabledReason({
          view: item.id,
          hasEnoughCandidates,
          canOpenResults,
          criteriaConsistent,
          alternativesConsistent,
        })
        const isDisabled = Boolean(disabledReason)
        const connectorComplete = index <= activeIndex

        return (
          <div key={item.id} className="relative">
            {index > 0 ? (
              <div
                className={`absolute left-[-50%] top-5 h-1 w-full rounded-full ${
                  connectorComplete ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            ) : null}

            <div className="group relative flex flex-col items-center gap-3">
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => onChange(item.id)}
                className={`relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isActive
                      ? 'border-sky-600 bg-sky-600 text-white'
                      : isDisabled
                        ? 'border-slate-200 bg-slate-100 text-slate-400'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
                aria-describedby={isDisabled ? `${item.id}-tooltip` : undefined}
              >
                {isCompleted ? <Check className="size-4" /> : index + 1}
              </button>

              <div className="flex flex-col items-center gap-1 text-center">
                <span className={`text-sm font-semibold ${isDisabled ? 'text-slate-400' : 'text-slate-900'}`}>
                  {item.label}
                </span>
                <Icon className={`size-4 ${isDisabled ? 'text-slate-300' : 'text-slate-500'}`} />
              </div>

              {isDisabled ? (
                <div
                  id={`${item.id}-tooltip`}
                  className="pointer-events-none absolute top-full z-20 mt-2 hidden w-52 rounded-xl bg-slate-900 px-3 py-2 text-xs leading-5 text-white shadow-lg group-hover:block"
                >
                  {disabledReason}
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PresetSelectorRow({
  presets,
  activePresetId,
  onSelectPreset,
  breakdownByPreset,
}: {
  presets: AHPPreset[]
  activePresetId: string
  onSelectPreset: (presetId: string) => void
  breakdownByPreset: Record<string, string>
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => {
        const isActive = activePresetId === preset.id
        return (
          <div key={preset.id} className="group relative">
            <button
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`rounded-full border-[2px] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                isActive
                  ? 'border-slate-800 bg-[#d9eef7] text-slate-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {preset.label}
            </button>

            <div className="pointer-events-none absolute left-1/2 top-[calc(100%+0.5rem)] z-20 hidden w-72 -translate-x-1/2 rounded-[1.25rem] border border-slate-200 bg-white p-3 text-left shadow-xl group-hover:block">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{preset.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{breakdownByPreset[preset.id]}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function OnboardingBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Panel className="border border-sky-200 bg-sky-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-sky-800">
            <Info className="size-4" />
            Hướng dẫn sử dụng AHP Điều phối Cứu nạn
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Thực hiện lần lượt 5 bước: (1) Xem tổng quan lý thuyết → (2) Lọc các ca cứu nạn → (3) So sánh các tiêu chí → (4) Đánh giá phương án theo từng tiêu chí → (5) Xem kết quả và xếp hạng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <span className="sr-only">Đóng hướng dẫn</span>
            <X className="size-4" />
          </button>
          <button type="button" onClick={onDismiss} className="clay-button-primary px-4 py-3 text-sm">
            Bắt đầu
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </Panel>
  )
}

function ResetConfirmDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4">
      <div className="w-full max-w-md rounded-[1.75rem] border-[3px] border-slate-800 bg-white p-5 shadow-[8px_10px_0_rgba(43,54,80,0.92)]">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <TriangleAlert className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Xác nhận đặt lại</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Thao tác này sẽ xóa toàn bộ ma trận và lựa chọn hiện tại. Bạn có chắc không?
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full border border-rose-300 bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>
  )
}

function getDisabledReason({
  view,
  hasEnoughCandidates,
  canOpenResults,
  criteriaConsistent,
  alternativesConsistent,
}: {
  view: WorkspaceView
  hasEnoughCandidates: boolean
  canOpenResults: boolean
  criteriaConsistent: boolean
  alternativesConsistent: boolean
}) {
  if ((view === 'criteria' || view === 'alternatives') && !hasEnoughCandidates) {
    return 'Hoàn thành bước Lọc trước trước.'
  }

  if (view === 'results' && !canOpenResults) {
    if (!hasEnoughCandidates) return 'Hoàn thành bước Lọc trước trước.'
    if (!criteriaConsistent) return 'Làm cho ma trận tiêu chí đạt CR ≤ 0.1 trước.'
    if (!alternativesConsistent) return 'Làm cho các ma trận phương án đạt CR ≤ 0.1 trước.'
  }

  return null
}

