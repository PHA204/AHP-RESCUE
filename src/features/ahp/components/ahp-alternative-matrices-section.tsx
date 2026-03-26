// REFACTORED: clarified alternative-matrix labels and copy for the criterion-by-criterion comparison step
import { Layers3 } from 'lucide-react'
import { criteriaOrder, setMatrixValue } from '../../../shared/lib/ahp'
import type { AlternativeMatrixMap, MatrixAnalysis } from '../../../shared/types/ahp'
import type { CriterionKey, RescueCase } from '../../../shared/types/domain'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'
import { AhpConsistencyPanel } from './ahp-consistency-panel'
import { AhpPairwiseMatrixEditor } from './ahp-pairwise-matrix-editor'

type AhpAlternativeMatricesSectionProps = {
  cases: RescueCase[]
  activeCriterion: CriterionKey
  onSelectCriterion: (criterionKey: CriterionKey) => void
  activeBlock: 'matrix' | 'consistency'
  matrices: AlternativeMatrixMap
  onChangeMatrix: (criterionKey: CriterionKey, nextMatrix: number[][]) => void
  analyses: Record<CriterionKey, MatrixAnalysis>
}

const criterionDisplayLabels: Record<CriterionKey, string> = {
  danger_level: 'Mức độ nguy hiểm',
  num_people: 'Số người mắc kẹt',
  vulnerable_groups: 'Nhóm dễ tổn thương',
  waiting_time: 'Thời gian chờ cứu hộ',
  accessibility: 'Khả năng tiếp cận',
}

export function AhpAlternativeMatricesSection({
  cases,
  activeCriterion,
  onSelectCriterion,
  activeBlock,
  matrices,
  onChangeMatrix,
  analyses,
}: AhpAlternativeMatricesSectionProps) {
  const labels = cases.map((caseItem, index) => `A${index + 1}`)
  const activeAnalysis = analyses[activeCriterion]
  const activeMatrix = matrices[activeCriterion]

  return (
    <div className="space-y-4">
      <Panel className="p-5 md:p-6">
        <SectionHeading
          eyebrow="Bước 3"
          title="Đánh giá phương án theo từng tiêu chí"
          action={
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eefbe7] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              <Layers3 className="size-4" />
              {cases.length} phương án
            </div>
          }
        />

        <div className="mt-5 flex flex-wrap gap-2">
          {criteriaOrder.map((criterionKey) => (
            <button
              key={criterionKey}
              type="button"
              onClick={() => onSelectCriterion(criterionKey)}
              className={`rounded-full border-[2px] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                activeCriterion === criterionKey
                  ? 'border-slate-800 bg-[#d9eef7] text-slate-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {criterionDisplayLabels[criterionKey]}
            </button>
          ))}
        </div>

        {activeBlock === 'matrix' ? (
          <div className="mt-5">
            <AhpPairwiseMatrixEditor
              labels={labels}
              matrix={activeMatrix}
              analysis={activeAnalysis}
              title={`Ma trận theo tiêu chí: ${criterionDisplayLabels[activeCriterion]}`}
              description="Đây là bước so sánh từng phương án theo đúng một tiêu chí cụ thể."
              onChange={(rowIndex, columnIndex, nextValue) =>
                onChangeMatrix(
                  activeCriterion,
                  setMatrixValue(activeMatrix, rowIndex, columnIndex, nextValue),
                )
              }
            />
          </div>
        ) : null}
      </Panel>

      {activeBlock === 'consistency' ? (
        <AhpConsistencyPanel
          labels={labels}
          analysis={activeAnalysis}
          title={`Độ nhất quán cho tiêu chí: ${criterionDisplayLabels[activeCriterion]}`}
        />
      ) : null}
    </div>
  )
}
