// REFACTORED: made consistency feedback more visual with tooltips, threshold bar, and clearer metric explanations
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { StatusBadge } from '../../../shared/components/ui/status-badge'
import { formatPercent } from '../../../shared/lib/format'
import type { MatrixAnalysis } from '../../../shared/types/ahp'

type AhpConsistencyPanelProps = {
  labels: string[]
  analysis: MatrixAnalysis
  title: string
  compact?: boolean
}

type MetricHelp = {
  label: string
  value: string
  help: string
}

export function AhpConsistencyPanel({
  labels,
  analysis,
  title,
  compact = false,
}: AhpConsistencyPanelProps) {
  const progressValue = Math.max(0, Math.min(analysis.consistencyRatio, 1))
  const progressPercent = `${progressValue * 100}%`
  const thresholdPercent = '10%'
  const crTone = analysis.isConsistent ? 'success' : 'danger'
  const crMessage = analysis.isConsistent
    ? '✅ Nhất quán (CR < 0.1)'
    : '❌ Cần sửa lại (CR ≥ 0.1)'

  const metricItems: MetricHelp[] = [
    {
      label: 'λmax',
      value: analysis.lambdaMax.toFixed(3),
      help: 'Giá trị riêng lớn nhất của ma trận. Khi ma trận nhất quán hoàn toàn, λmax = n (số tiêu chí).',
    },
    {
      label: 'CI',
      value: analysis.consistencyIndex.toFixed(3),
      help: 'Chỉ số nhất quán: CI = (λmax - n) / (n - 1). Giá trị càng nhỏ càng tốt.',
    },
    {
      label: 'RI',
      value: analysis.randomIndex.toFixed(2),
      help: 'Chỉ số ngẫu nhiên — hằng số phụ thuộc vào kích thước ma trận n.',
    },
  ]

  return (
    <div className="clay-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Độ nhất quán
          </p>
          <h4 className="mt-2 text-lg font-bold text-slate-900">{title}</h4>
        </div>
        <StatusBadge tone={analysis.isConsistent ? 'success' : 'warning'}>
          {analysis.isConsistent ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
          {analysis.isConsistent ? 'Hợp lệ' : 'Chưa hợp lệ'}
        </StatusBadge>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.3fr,0.7fr]">
        <div className={`rounded-[1.5rem] border p-4 ${crTone === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
            <span>CR = {analysis.consistencyRatio.toFixed(3)}</span>
            <span className={crTone === 'success' ? 'text-emerald-700' : 'text-rose-700'}>{crMessage}</span>
            <InfoTooltip text="Tỉ số nhất quán: CR = CI / RI. Chấp nhận được khi CR < 0.1 (10%)." />
          </div>

          <div className="mt-4">
            <div className="relative h-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-400 via-[10%] to-rose-400">
              <div className="absolute inset-y-[-4px] left-[10%] w-px bg-slate-700/60" />
              <div
                className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow"
                style={{ left: `calc(${progressPercent} - 0.5rem)` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>0.0</span>
              <span>Mốc chấp nhận {thresholdPercent}</span>
              <span>1.0</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {metricItems.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} help={item.help} />
          ))}
        </div>
      </div>

      {!compact ? (
        <div className="mt-5 overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Mục
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <HeaderWithTooltip
                    label="W"
                    help="Trọng số chuẩn hóa (Priority Weight) — tổng = 1.0"
                  />
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <HeaderWithTooltip
                    label="WSV"
                    help="Weighted Sum Vector — tích của ma trận A với vector W"
                  />
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <HeaderWithTooltip
                    label="CV"
                    help="Consistency Vector — CV_i = WSV_i / W_i, lý tưởng khi gần bằng λmax"
                  />
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

function MetricCard({ label, value, help }: MetricHelp) {
  return (
    <div className="rounded-[1.25rem] bg-white px-4 py-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        <span>{label}</span>
        <InfoTooltip text={help} />
      </div>
      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
    </div>
  )
}

function HeaderWithTooltip({ label, help }: { label: string; help: string }) {
  return (
    <span className="inline-flex items-center justify-end gap-1">
      <span>{label}</span>
      <InfoTooltip text={help} />
    </span>
  )
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        className="inline-flex size-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
        aria-label={text}
      >
        <Info className="size-3.5" />
      </button>
      <span className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-20 hidden w-60 -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2 text-left text-[11px] normal-case leading-5 text-white shadow-lg group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  )
}
