// REFACTORED: clarified matrix editing UX with Saaty legend, verbal select labels, and advanced normalization toggle
import { formatSaatyLabel, saatyScale } from '../../../shared/lib/ahp'
import { formatPercent } from '../../../shared/lib/format'
import type { MatrixAnalysis } from '../../../shared/types/ahp'
import { SaatyLegendStrip } from '../../../shared/components/ui/saaty-legend-strip'

type AhpPairwiseMatrixEditorProps = {
  labels: string[]
  matrix: number[][]
  analysis: MatrixAnalysis
  onChange?: (rowIndex: number, columnIndex: number, nextValue: number) => void
  title: string
  description: string
}

type MatrixOption = {
  value: number
  label: string
}

const scaleDescriptions: Record<string, string> = {
  '9': '9 — Tuyệt đối hơn',
  '8': '8 — Trung gian',
  '7': '7 — Rất quan trọng hơn',
  '6': '6 — Trung gian',
  '5': '5 — Quan trọng hơn',
  '4': '4 — Trung gian',
  '3': '3 — Hơi quan trọng hơn',
  '2': '2 — Trung gian',
  '1': '1 — Ngang nhau',
  '1/2': '1/2 — Kém quan trọng hơn nhẹ',
  '1/3': '1/3 — Kém quan trọng hơn vừa phải',
  '1/4': '1/4 — Kém quan trọng hơn trung gian',
  '1/5': '1/5 — Kém quan trọng hơn rõ rệt',
  '1/6': '1/6 — Kém quan trọng hơn mạnh',
  '1/7': '1/7 — Kém quan trọng hơn rất mạnh',
  '1/8': '1/8 — Kém quan trọng hơn trung gian',
  '1/9': '1/9 — Kém quan trọng hơn tuyệt đối',
}

const describedSaatyScale: MatrixOption[] = saatyScale.map((option) => ({
  value: option.value,
  label: scaleDescriptions[option.label] ?? `${option.label} — Giá trị tuỳ chỉnh`,
}))

export function AhpPairwiseMatrixEditor({
  labels,
  matrix,
  analysis,
  onChange,
  title,
  description,
}: AhpPairwiseMatrixEditorProps) {
  const leftLabel = labels[0] ?? 'tiêu chí i'
  const rightLabel = labels[1] ?? 'tiêu chí j'

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-lg font-bold text-slate-900">{title}</h4>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>

      <SaatyLegendStrip />

      <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-4">
          <MatrixTable title="Ma trận so sánh A" labels={labels} matrix={matrix} onChange={onChange} />
          <p className="rounded-[1.25rem] bg-slate-100 px-4 py-3 text-sm italic leading-6 text-slate-600">
            Ô [hàng i, cột j]: mức độ ưu tiên của {leftLabel} so với {rightLabel}. Giá trị &gt; 1 nghĩa là hàng i quan trọng hơn cột j. Giá trị = 1 nghĩa là ngang nhau. Giá trị &lt; 1 nghĩa là kém quan trọng hơn.
          </p>
        </div>

        <div className="rounded-[1.75rem] bg-[#f3efe8] p-4">
          <p className="text-sm font-semibold text-slate-900">Vector trọng số W</p>
          <div className="mt-4 space-y-3">
            {labels.map((label, index) => (
              <div key={label} className="rounded-[1.25rem] bg-white px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-700">{label}</span>
                  <strong className="text-sm text-slate-900">
                    {formatPercent(analysis.weights[index] ?? 0, 2)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <details className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900">
          📊 Xem ma trận chuẩn hóa (nâng cao)
        </summary>
        <div className="mt-4">
          <MatrixTable title="Ma trận chuẩn hóa A'" labels={labels} matrix={analysis.normalizedMatrix} />
        </div>
      </details>
    </div>
  )
}

function MatrixTable({
  title,
  labels,
  matrix,
  onChange,
}: {
  title: string
  labels: string[]
  matrix: number[][]
  onChange?: (rowIndex: number, columnIndex: number, nextValue: number) => void
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-center text-sm">
          <thead>
            <tr>
              <th className="p-2" />
              {labels.map((label) => (
                <th
                  key={label}
                  className="p-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((rowLabel, rowIndex) => (
              <tr key={rowLabel}>
                <th className="p-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {rowLabel}
                </th>
                {labels.map((columnLabel, columnIndex) => {
                  const value = matrix[rowIndex]?.[columnIndex] ?? 1
                  const isEditable = Boolean(onChange) && rowIndex < columnIndex

                  if (!onChange) {
                    return (
                      <td key={columnLabel} className="p-2">
                        <ReadOnlyCell value={value} />
                      </td>
                    )
                  }

                  if (rowIndex === columnIndex) {
                    return (
                      <td key={columnLabel} className="p-2">
                        <div className="rounded-[1.1rem] border border-emerald-200 bg-emerald-50 px-3 py-3 font-semibold text-emerald-700">
                          1
                        </div>
                      </td>
                    )
                  }

                  if (!isEditable) {
                    return (
                      <td key={columnLabel} className="p-2">
                        <ReadOnlyCell value={value} />
                      </td>
                    )
                  }

                  const options = getSelectOptions(value)
                  const selectedValue = options.find((option) => Math.abs(option.value - value) < 0.0001)?.value ?? value

                  return (
                    <td key={columnLabel} className="p-2">
                      <select
                        value={String(selectedValue)}
                        onChange={(event) => onChange(rowIndex, columnIndex, Number(event.target.value))}
                        className="w-full rounded-[1.1rem] border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-[0_8px_18px_rgba(37,99,235,0.05)]"
                      >
                        {options.map((option) => (
                          <option key={option.label} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReadOnlyCell({ value }: { value: number }) {
  return (
    <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700">
      {formatSaatyLabel(value)}
    </div>
  )
}

function getSelectOptions(currentValue: number) {
  const currentExists = describedSaatyScale.some(
    (option) => Math.abs(option.value - currentValue) < 0.0001,
  )

  if (currentExists) {
    return describedSaatyScale
  }

  return [
    { value: currentValue, label: `${formatSaatyLabel(currentValue)} — Giá trị hiện tại` },
    ...describedSaatyScale,
  ]
}
