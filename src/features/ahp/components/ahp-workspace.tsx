import { startTransition, useEffect, useMemo, useState, type ComponentType } from 'react'
import {
  CheckCircle2,
  Filter,
  GitBranch,
  Layers3,
  RefreshCcw,
  RotateCcw,
  Scale,
  Sigma,
  Sparkles,
} from 'lucide-react'
import { useUiStore } from '../../../app/store/ui-store'
import { EmptyState } from '../../../shared/components/ui/empty-state'
import { LoadingCard } from '../../../shared/components/ui/loading-card'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'
import { StatusBadge } from '../../../shared/components/ui/status-badge'
import {
  createAlternativeMatrices,
  createIdentityMatrix,
  criteriaLabels,
  criteriaOrder,
  evaluateAHP,
  setMatrixValue,
} from '../../../shared/lib/ahp'
import { useCasesQuery, usePresetsQuery } from '../../../shared/lib/query-hooks'
import { severityConfig } from '../../../shared/lib/severity'
import type { AlternativeMatrixMap } from '../../../shared/types/ahp'
import type { CriterionKey, SeverityLevel } from '../../../shared/types/domain'
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

const defaultScreening: ScreeningState = {
  severity: ['CRITICAL', 'HIGH', 'MEDIUM'],
  vulnerableOnly: false,
  waitingHoursMin: 0,
  district: 'ALL',
  geocodedOnly: true,
  maxCandidates: 5,
}

const viewItems: Array<{
  id: WorkspaceView
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: 'overview', label: 'Tổng quan', icon: GitBranch },
  { id: 'screening', label: 'Lọc trước', icon: Filter },
  { id: 'criteria', label: 'Tiêu chí', icon: Scale },
  { id: 'alternatives', label: 'Phương án', icon: Layers3 },
  { id: 'results', label: 'Kết quả', icon: Sigma },
]

export function AhpWorkspace() {
  const activePresetId = useUiStore((state) => state.activePresetId)
  const setActivePresetId = useUiStore((state) => state.setActivePresetId)
  const selectedCaseId = useUiStore((state) => state.selectedCaseId)
  const setSelectedCaseId = useUiStore((state) => state.setSelectedCaseId)
  const presetsQuery = usePresetsQuery()
  const casesQuery = useCasesQuery(activePresetId)

  const presets = presetsQuery.data ?? []
  const currentPreset = presets.find((item) => item.id === activePresetId) ?? presets[0]

  const [activeView, setActiveView] = useState<WorkspaceView>('overview')
  const [activeOverviewBlock, setActiveOverviewBlock] = useState<OverviewBlock>('theory')
  const [activeCriteriaBlock, setActiveCriteriaBlock] = useState<CriteriaBlock>('matrix')
  const [activeAlternativeBlock, setActiveAlternativeBlock] =
    useState<AlternativeBlock>('matrix')
  const [activeResultsBlock, setActiveResultsBlock] = useState<ResultsBlock>('synthesis')
  const [screening, setScreening] = useState<ScreeningState>(defaultScreening)
  const [manualExclusions, setManualExclusions] = useState<string[]>([])
  const [criteriaMatrix, setCriteriaMatrix] = useState<number[][]>(
    currentPreset?.matrix ?? createIdentityMatrix(criteriaOrder.length),
  )
  const [alternativeMatrixState, setAlternativeMatrixState] = useState<{
    screeningKey: string
    matrices: AlternativeMatrixMap
  } | null>(null)
  const [activeAlternativeCriterion, setActiveAlternativeCriterion] =
    useState<CriterionKey>('danger_level')

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
      .filter((caseItem) =>
        screening.geocodedOnly ? caseItem.geocodeStatus === 'success' : true,
      )
      .filter((caseItem) => (caseItem.waitingHours ?? 0) >= screening.waitingHoursMin)
      .filter((caseItem) =>
        screening.district === 'ALL' ? true : caseItem.district === screening.district,
      )
      .filter((caseItem) => !manualExclusions.includes(caseItem.id))
      .sort((left, right) => (left.currentRank ?? 99) - (right.currentRank ?? 99))
      .slice(0, screening.maxCandidates)
  }, [casesQuery.data, manualExclusions, screening])

  const screeningKey = useMemo(
    () => screenedCases.map((caseItem) => caseItem.id).join('|'),
    [screenedCases],
  )

  const alternativeMatrices =
    alternativeMatrixState?.screeningKey === screeningKey
      ? alternativeMatrixState.matrices
      : createAlternativeMatrices(screenedCases)

  const evaluation = useMemo(
    () => evaluateAHP(screenedCases, criteriaMatrix, alternativeMatrices),
    [alternativeMatrices, criteriaMatrix, screenedCases],
  )

  const selectedResult =
    evaluation.synthesisRows.find((row) => row.caseId === selectedCaseId) ??
    evaluation.synthesisRows[0]
  const districts = Array.from(new Set((casesQuery.data ?? []).map((item) => item.district))).sort()

  if (casesQuery.isLoading || presetsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <LoadingCard className="h-28" />
        <LoadingCard className="h-[28rem]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Panel className="p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              AHP
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Không gian làm việc AHP
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setActivePresetId(preset.id)}
                className={`rounded-full border-[2px] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                  activePresetId === preset.id
                    ? 'border-slate-800 bg-[#d9eef7] text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-[1fr,auto]">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Mẫu AHP" value={currentPreset?.label ?? 'Không có'} tone="sky" />
            <SummaryCard label="Phương án" value={String(screenedCases.length)} tone="green" />
            <SummaryCard
              label="Độ nhất quán"
              value={evaluation.isFullyConsistent ? 'Hợp lệ' : 'Cần xem lại'}
              tone={evaluation.isFullyConsistent ? 'green' : 'orange'}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (!currentPreset) return
                setCriteriaMatrix(currentPreset.matrix)
              }}
              className="clay-button-secondary px-4 py-3 text-sm"
            >
              <RefreshCcw className="size-4" />
              Áp dụng mẫu
            </button>
            <button
              type="button"
              onClick={() => {
                if (!currentPreset) return
                setScreening(defaultScreening)
                setManualExclusions([])
                setCriteriaMatrix(currentPreset.matrix)
                setAlternativeMatrixState(null)
                setActiveAlternativeCriterion('danger_level')
                setActiveOverviewBlock('theory')
                setActiveCriteriaBlock('matrix')
                setActiveAlternativeBlock('matrix')
                setActiveResultsBlock('synthesis')
              }}
              className="clay-button-secondary px-4 py-3 text-sm"
            >
              <RotateCcw className="size-4" />
              Đặt lại
            </button>
            <button
              type="button"
              onClick={() => {
                setCriteriaMatrix((current) => current.map((row) => [...row]))
                setAlternativeMatrixState({
                  screeningKey,
                  matrices: Object.fromEntries(
                    criteriaOrder.map((criterionKey) => [
                      criterionKey,
                      alternativeMatrices[criterionKey].map((row) => [...row]),
                    ]),
                  ) as AlternativeMatrixMap,
                })
              }}
              className="clay-button-primary px-4 py-3 text-sm"
            >
              <Sparkles className="size-4" />
              Tính lại
            </button>
          </div>
        </div>
      </Panel>

      <Panel className="sticky top-[5.8rem] z-20 p-3">
        <div className="flex flex-wrap gap-2">
          {viewItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveView(item.id)
                  if (item.id === 'overview') setActiveOverviewBlock('theory')
                  if (item.id === 'criteria') setActiveCriteriaBlock('matrix')
                  if (item.id === 'alternatives') setActiveAlternativeBlock('matrix')
                  if (item.id === 'results') setActiveResultsBlock('synthesis')
                }}
                className={`inline-flex items-center gap-2 rounded-full border-[2px] px-4 py-2 text-sm font-semibold transition ${
                  activeView === item.id
                    ? 'border-slate-800 bg-[#d9eef7] text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      </Panel>

      {activeView === 'overview' ? (
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

          {activeOverviewBlock === 'theory' ? (
            <AhpProcessOverview screenedCases={screenedCases} />
          ) : null}
          {activeOverviewBlock === 'hierarchy' ? (
            <AhpHierarchyVisual screenedCases={screenedCases} />
          ) : null}
          {activeOverviewBlock === 'formula' ? <AhpFormulaPanel /> : null}
        </div>
      ) : null}

      {activeView === 'screening' ? (
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
                    setScreening((current) => ({ ...current, district: event.target.value }))
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
                    setScreening((current) => ({
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
                    setScreening((current) => ({
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
                        setScreening((current) => ({
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
                    setScreening((current) => ({
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
                    setScreening((current) => ({
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
              <p className="text-sm font-semibold text-slate-900">
                Phương án đưa vào AHP
              </p>
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
                          setManualExclusions((current) =>
                            event.target.checked
                              ? current.filter((item) => item !== caseItem.id)
                              : [...current, caseItem.id],
                          )
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

      {screenedCases.length >= 2 && activeView === 'criteria' ? (
        <div className="space-y-4">
          <Panel className="p-4 md:p-5">
            <AhpBlockStepper
              title="Tiêu chí"
              subtitle=""
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
              <SectionHeading
                eyebrow="Bước 2"
                title="Ma trận so sánh cặp tiêu chí"
              />

              <div className="mt-5">
                <AhpPairwiseMatrixEditor
                  labels={criteriaOrder.map((criterionKey) => criteriaLabels[criterionKey])}
                  matrix={criteriaMatrix}
                  analysis={evaluation.criteria}
                  title="Ma trận tiêu chí"
                  description=""
                  onChange={(rowIndex, columnIndex, nextValue) =>
                    setCriteriaMatrix((current) =>
                      setMatrixValue(current, rowIndex, columnIndex, nextValue),
                    )
                  }
                />
              </div>
            </Panel>
          ) : null}

          {activeCriteriaBlock === 'consistency' ? (
            <AhpConsistencyPanel
              labels={criteriaOrder.map((criterionKey) => criteriaLabels[criterionKey])}
              analysis={evaluation.criteria}
              title="Độ nhất quán của ma trận tiêu chí"
            />
          ) : null}
        </div>
      ) : null}

      {screenedCases.length >= 2 && activeView === 'alternatives' ? (
        <div className="space-y-4">
          <Panel className="p-4 md:p-5">
            <AhpBlockStepper
              title="Phương án"
              subtitle=""
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
            onChangeMatrix={(criterionKey, nextMatrix) =>
              setAlternativeMatrixState({
                screeningKey,
                matrices: {
                  ...alternativeMatrices,
                  [criterionKey]: nextMatrix,
                },
              })
            }
          />
        </div>
      ) : null}

      {screenedCases.length >= 2 && activeView === 'results' ? (
        <div className="space-y-4">
          <Panel className="p-4 md:p-5">
            <AhpBlockStepper
              title="Kết quả"
              subtitle=""
              steps={[
                { id: 'synthesis', label: 'Tổng hợp' },
                { id: 'ranking', label: 'Xếp hạng' },
                { id: 'decision', label: 'Đề xuất' },
              ]}
              activeStepId={activeResultsBlock}
              onChange={(stepId) => setActiveResultsBlock(stepId as ResultsBlock)}
            />
          </Panel>

          {activeResultsBlock === 'synthesis' ? (
            <AhpSynthesisSection evaluation={evaluation} />
          ) : null}

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
                  {evaluation.isFullyConsistent
                    ? 'Sẵn sàng đề xuất'
                    : 'Cần xem lại CR'}
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
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'sky' | 'green' | 'orange'
}) {
  const classes =
    tone === 'sky'
      ? 'bg-[#e9f6ff]'
      : tone === 'green'
        ? 'bg-[#eefbe7]'
        : 'bg-[#fff0d9]'

  return (
    <div className={`rounded-[1.35rem] px-4 py-4 ${classes}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
