import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatPercent } from '../../../shared/lib/format'
import type { MatrixAnalysis } from '../../../shared/types/ahp'
import { StatusBadge } from '../../../shared/components/ui/status-badge'

type AhpConsistencyPanelProps = {
  labels: string[]
  analysis: MatrixAnalysis
  title: string
  compact?: boolean
}

export function AhpConsistencyPanel({
  labels,
  analysis,
  title,
  compact = false,
}: AhpConsistencyPanelProps) {
  return (
    <div className="clay-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Consistency Check
          </p>
          <h4 className="mt-2 text-lg font-bold text-slate-900">{title}</h4>
          <p className="mt-1 text-sm text-slate-600">
            Hệ thống hiển thị đầy đủ WSV, CV, lambda max, CI, CR và RI để chứng minh việc kiểm tra
            nhất quán là có thật, không phải mô phỏng.
          </p>
        </div>
        <StatusBadge tone={analysis.isConsistent ? 'success' : 'warning'}>
          {analysis.isConsistent ? (
            <CheckCircle2 className="size-3.5" />
          ) : (
            <AlertTriangle className="size-3.5" />
          )}
          {analysis.isConsistent ? 'Valid' : 'Invalid'}
        </StatusBadge>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        <MetricCard label="lambda max" value={analysis.lambdaMax.toFixed(3)} />
        <MetricCard label="CI" value={analysis.consistencyIndex.toFixed(3)} />
        <MetricCard label="RI" value={analysis.randomIndex.toFixed(2)} />
        <MetricCard label="CR" value={analysis.consistencyRatio.toFixed(3)} />
        <MetricCard label="Status" value={analysis.isConsistent ? 'Hop le' : 'Can chinh lai'} />
      </div>

      <div className="mt-5 rounded-[1.5rem] bg-[#f3efe8] p-4">
        <p className="text-sm font-semibold text-slate-900">
          {analysis.isConsistent
            ? 'Ma tran nhat quan, co the su dung cho tong hop diem.'
            : 'Ma tran chua nhat quan, can dieu chinh lai truoc khi xem ranking chinh thuc.'}
        </p>
      </div>

      {!compact ? (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Item
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  W
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  WSV
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  CV
                </th>
              </tr>
            </thead>
            <tbody>
              {labels.map((label, index) => (
                <tr key={label} className="border-t border-slate-200">
                  <td className="px-3 py-3 text-slate-700">{label}</td>
                  <td className="px-3 py-3 text-right font-medium text-slate-900">
                    {formatPercent(analysis.weights[index] ?? 0, 2)}
                  </td>
                  <td className="px-3 py-3 text-right text-slate-700">
                    {(analysis.weightedSumVector[index] ?? 0).toFixed(3)}
                  </td>
                  <td className="px-3 py-3 text-right text-slate-700">
                    {(analysis.consistencyVector[index] ?? 0).toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
    </div>
  )
}
