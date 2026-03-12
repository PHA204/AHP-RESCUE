import { AlertTriangle, Trophy } from 'lucide-react'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'
import { StatusBadge } from '../../../shared/components/ui/status-badge'
import { criteriaLabels, criteriaOrder } from '../../../shared/lib/ahp'
import { formatPercent } from '../../../shared/lib/format'
import { severityConfig } from '../../../shared/lib/severity'
import type { AHPEvaluationResult } from '../../../shared/types/ahp'

type AhpRankingResultsProps = {
  evaluation: AHPEvaluationResult
  selectedCaseId: string | null
  onSelectCase: (caseId: string) => void
}

export function AhpRankingResults({
  evaluation,
  selectedCaseId,
  onSelectCase,
}: AhpRankingResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <SectionHeading
        eyebrow="Ranking Results"
        title="Bang xep hang phuong an"
        description="Hien thi rank, final score, breakdown theo criterion, danger level va trang thai cuu ho."
        action={
          !evaluation.isFullyConsistent ? (
            <StatusBadge tone="warning">
              <AlertTriangle className="size-3.5" />
              Consistency warning
            </StatusBadge>
          ) : null
        }
      />

      {!evaluation.isFullyConsistent ? (
        <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Mot hoac nhieu ma tran chua dat nguong CR &lt; 0.1. Ranking van duoc hien thi de tham khao,
          nhung khong nen xem la ket qua chinh thuc cho demo hoc thuat.
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {evaluation.synthesisRows.map((row) => {
          const isSelected = selectedCaseId === row.caseId
          const topOne = row.rank === 1

          return (
            <button
              key={row.caseId}
              type="button"
              onClick={() => onSelectCase(row.caseId)}
              className={`w-full rounded-[1.6rem] border-[3px] px-4 py-4 text-left transition ${
                isSelected
                  ? 'border-slate-800 bg-[#d9eef7] shadow-[6px_7px_0_rgba(43,54,80,0.92)]'
                  : 'bg-white hover:-translate-y-[1px] hover:shadow-[6px_7px_0_rgba(43,54,80,0.92)]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Rank #{row.rank}
                    </span>
                    {topOne ? (
                      <StatusBadge tone="success">
                        <Trophy className="size-3.5" />
                        Top 1
                      </StatusBadge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-base font-bold text-slate-900">
                    {row.caseItem.locationDescription ?? row.caseId}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {row.caseItem.rescueStatus} • {row.caseItem.district}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge className={severityConfig[row.caseItem.severity].tone}>
                    {severityConfig[row.caseItem.severity].label}
                  </StatusBadge>
                  <div className="rounded-full bg-[#f3efe8] px-3 py-2 text-xs font-semibold text-slate-700">
                    {formatPercent(row.finalScore, 2)}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-5">
                {criteriaOrder.map((criterionKey) => (
                  <div key={criterionKey} className="rounded-[1.15rem] bg-[#f8f5ef] px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {criteriaLabels[criterionKey]}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatPercent(row.contributionByCriterion[criterionKey] ?? 0, 2)}
                    </p>
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </Panel>
  )
}
