import { Layers3 } from 'lucide-react'
import { criteriaLabels, criteriaOrder, setMatrixValue } from '../../../shared/lib/ahp'
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
  matrices: AlternativeMatrixMap
  onChangeMatrix: (criterionKey: CriterionKey, nextMatrix: number[][]) => void
  analyses: Record<CriterionKey, MatrixAnalysis>
}

export function AhpAlternativeMatricesSection({
  cases,
  activeCriterion,
  onSelectCriterion,
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
          eyebrow="Step 3"
          title="Alternative matrices theo tung criterion"
          description="Day la buoc danh gia cac phuong an theo tung tieu chi. Moi criterion co mot ma tran so sanh cap alternatives rieng."
          action={
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eefbe7] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              <Layers3 className="size-4" />
              {cases.length} alternatives dang demo
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
              {criteriaLabels[criterionKey]}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <AhpPairwiseMatrixEditor
            labels={labels}
            matrix={activeMatrix}
            analysis={activeAnalysis}
            title={`Alternative matrix cho criterion: ${criteriaLabels[activeCriterion]}`}
            description="Neu sua o [i, j] thi o [j, i] se tu dong cap nhat nghich dao. Duong cheo chinh luon bang 1."
            onChange={(rowIndex, columnIndex, nextValue) =>
              onChangeMatrix(
                activeCriterion,
                setMatrixValue(activeMatrix, rowIndex, columnIndex, nextValue),
              )
            }
          />
        </div>
      </Panel>

      <AhpConsistencyPanel
        labels={labels}
        analysis={activeAnalysis}
        title={`Consistency cho ${criteriaLabels[activeCriterion]}`}
      />
    </div>
  )
}
