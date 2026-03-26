// REFACTORED: made ranking more scannable with a comparison chart and per-criterion mini contribution bars
import { AlertTriangle, Trophy } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'
import { StatusBadge } from '../../../shared/components/ui/status-badge'
import { criteriaOrder } from '../../../shared/lib/ahp'
import { formatPercent } from '../../../shared/lib/format'
import { severityConfig } from '../../../shared/lib/severity'
import type { AHPEvaluationResult } from '../../../shared/types/ahp'
import type { CriterionKey } from '../../../shared/types/domain'

type AhpRankingResultsProps = {
  evaluation: AHPEvaluationResult
  selectedCaseId: string | null
  onSelectCase: (caseId: string) => void
}

const criterionDisplayLabels: Record<CriterionKey, string> = {
  danger_level: 'Mức độ nguy hiểm',
  num_people: 'Số người mắc kẹt',
  vulnerable_groups: 'Nhóm dễ tổn thương',
  waiting_time: 'Thời gian chờ cứu hộ',
  accessibility: 'Khả năng tiếp cận',
}

export function AhpRankingResults({
  evaluation,
  selectedCaseId,
  onSelectCase,
}: AhpRankingResultsProps) {
  const chartData = evaluation.synthesisRows.map((row) => ({
    id: row.caseId,
    name: truncateName(row.caseItem.locationDescription ?? row.caseId),
    score: row.finalScore,
    rank: row.rank,
  }))

  return (
    <Panel className="p-5 md:p-6">
      <SectionHeading
        eyebrow="Xếp hạng"
        title="Bảng xếp hạng phương án"
        action={
          !evaluation.isFullyConsistent ? (
            <StatusBadge tone="warning">
              <AlertTriangle className="size-3.5" />
              CR cần xem lại
            </StatusBadge>
          ) : null
        }
      />

      {!evaluation.isFullyConsistent ? (
        <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Có ma trận chưa đạt ngưỡng CR &lt; 0.1. Kết quả vẫn hiển thị để tham khảo, nhưng nên chỉnh lại trước khi ra quyết định.
        </div>
      ) : null}

      <div className="mt-5 rounded-[1.75rem] border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">So sánh điểm AHP cuối cùng</p>
        <div className="mt-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 24, bottom: 0 }}>
              <XAxis type="number" domain={[0, 1]} tickFormatter={(value: number) => formatPercent(value, 0)} />
              <YAxis type="category" dataKey="name" width={150} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => formatPercent(Number(value ?? 0), 2)} />
              <Bar dataKey="score" radius={[0, 10, 10, 0]}>
                {chartData.map((item) => (
                  <Cell key={item.id} fill={item.rank === 1 ? '#16a34a' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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
                      Hạng #{row.rank}
                    </span>
                    {topOne ? (
                      <StatusBadge tone="success">
                        <Trophy className="size-3.5" />
                        Ưu tiên số 1
                      </StatusBadge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-base font-bold text-slate-900">
                    {row.caseItem.locationDescription ?? row.caseId}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{row.caseItem.district}</p>
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

              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
                {criteriaOrder.map((criterionKey) => (
                  <div key={criterionKey} className="rounded-[1.15rem] bg-[#f8f5ef] px-3 py-3">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <span>{criterionDisplayLabels[criterionKey]}</span>
                      <span>{formatPercent(row.contributionByCriterion[criterionKey] ?? 0, 1)}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-sky-500"
                        style={{ width: formatPercent(row.contributionByCriterion[criterionKey] ?? 0, 1) }}
                      />
                    </div>
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

function truncateName(value: string) {
  if (value.length <= 28) return value
  return `${value.slice(0, 25)}...`
}

