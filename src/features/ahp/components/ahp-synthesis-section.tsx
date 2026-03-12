import { Award, Lock, ShieldAlert } from 'lucide-react'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'
import { StatusBadge } from '../../../shared/components/ui/status-badge'
import { criteriaLabels, criteriaOrder } from '../../../shared/lib/ahp'
import { formatPercent } from '../../../shared/lib/format'
import type { AHPEvaluationResult } from '../../../shared/types/ahp'

type AhpSynthesisSectionProps = {
  evaluation: AHPEvaluationResult
}

const contributionColors = ['#f43f5e', '#f97316', '#f59e0b', '#0ea5e9', '#10b981']

export function AhpSynthesisSection({ evaluation }: AhpSynthesisSectionProps) {
  const topRow = evaluation.synthesisRows[0]

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
      <Panel className="p-5 md:p-6">
        <SectionHeading
          eyebrow="Synthesis"
          title="Tong hop S × W = Final Score"
          description="Ma tran S duoc ghep tu cac vector trong so alternatives theo tung criterion. Sau do nhan voi vector trong so criteria W de ra diem cuoi."
          action={
            <StatusBadge tone={evaluation.isFullyConsistent ? 'success' : 'warning'}>
              {evaluation.isFullyConsistent ? <Award className="size-3.5" /> : <Lock className="size-3.5" />}
              {evaluation.isFullyConsistent ? 'Ready to rank' : 'Blocked by consistency'}
            </StatusBadge>
          }
        />

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Alternative
                </th>
                {criteriaOrder.map((criterionKey) => (
                  <th
                    key={criterionKey}
                    className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
                  >
                    {criteriaLabels[criterionKey]}
                  </th>
                ))}
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Final
                </th>
              </tr>
            </thead>
            <tbody>
              {evaluation.synthesisRows.map((row, index) => (
                <tr key={row.caseId} className="border-t border-slate-200">
                  <td className="px-3 py-3">
                    <div>
                      <p className="font-medium text-slate-900">A{index + 1}</p>
                      <p className="text-xs text-slate-500">
                        {row.caseItem.locationDescription ?? row.caseId}
                      </p>
                    </div>
                  </td>
                  {criteriaOrder.map((criterionKey) => (
                    <td key={criterionKey} className="px-3 py-3 text-right text-slate-700">
                      {formatPercent(row.alternativeWeights[criterionKey] ?? 0, 2)}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right font-bold text-slate-900">
                    {formatPercent(row.finalScore, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-[1.5rem] bg-[#f3efe8] p-4">
          <p className="text-sm font-semibold text-slate-900">Vector W (criteria weights)</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {criteriaOrder.map((criterionKey) => (
              <span
                key={criterionKey}
                className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700"
              >
                {criteriaLabels[criterionKey]} ={' '}
                {formatPercent(evaluation.criteria.weightsByCriterion[criterionKey] ?? 0, 2)}
              </span>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="p-5 md:p-6">
        <SectionHeading
          eyebrow="Recommended Priority"
          title={topRow ? topRow.caseItem.locationDescription ?? topRow.caseId : 'Chua co xep hang'}
          description={
            evaluation.isFullyConsistent
              ? 'Alternative dung hang 1 sau khi tong hop tat ca matrix bat buoc.'
              : 'Consistency chua dat nguong, ket qua duoi day chi nen xem nhu preview.'
          }
        />

        {topRow ? (
          <div className="mt-5 space-y-4">
            <div
              className={`rounded-[1.75rem] border-[3px] p-5 ${
                evaluation.isFullyConsistent
                  ? 'border-slate-800 bg-[#eefbe7]'
                  : 'border-amber-300 bg-amber-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Rank #1
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {formatPercent(topRow.finalScore, 2)}
                  </p>
                </div>
                <StatusBadge tone={evaluation.isFullyConsistent ? 'success' : 'warning'}>
                  {evaluation.isFullyConsistent ? (
                    <Award className="size-3.5" />
                  ) : (
                    <ShieldAlert className="size-3.5" />
                  )}
                  {evaluation.isFullyConsistent ? 'Recommended' : 'Preview only'}
                </StatusBadge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{topRow.caseItem.rawComment}</p>
            </div>

            <div className="space-y-3">
              {criteriaOrder.map((criterionKey, index) => (
                <div key={criterionKey}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">{criteriaLabels[criterionKey]}</span>
                    <span className="font-semibold text-slate-900">
                      {formatPercent(topRow.contributionByCriterion[criterionKey] ?? 0, 2)}
                    </span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          (topRow.contributionByCriterion[criterionKey] / topRow.finalScore) * 100 || 0,
                          100,
                        )}%`,
                        backgroundColor: contributionColors[index],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
            Chua co du lieu tong hop de hien thi.
          </div>
        )}
      </Panel>
    </div>
  )
}
