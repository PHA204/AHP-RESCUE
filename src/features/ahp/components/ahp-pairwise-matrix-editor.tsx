import { formatSaatyLabel, saatyScale } from '../../../shared/lib/ahp'
import { formatPercent } from '../../../shared/lib/format'
import type { MatrixAnalysis } from '../../../shared/types/ahp'

type AhpPairwiseMatrixEditorProps = {
  labels: string[]
  matrix: number[][]
  analysis: MatrixAnalysis
  onChange?: (rowIndex: number, columnIndex: number, nextValue: number) => void
  title: string
  description: string
}

export function AhpPairwiseMatrixEditor({
  labels,
  matrix,
  analysis,
  onChange,
  title,
  description,
}: AhpPairwiseMatrixEditorProps) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-lg font-bold text-slate-900">{title}</h4>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <MatrixTable title="Ma trận A" labels={labels} matrix={matrix} onChange={onChange} />

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

      <MatrixTable title="Ma trận chuẩn hóa A'" labels={labels} matrix={analysis.normalizedMatrix} />

      <div className="rounded-[1.5rem] bg-[#fff0d9] px-4 py-4 text-sm leading-6 text-slate-700">
        <p className="font-semibold text-slate-900">Thang Saaty</p>
        <p className="mt-2">
          1 = ngang nhau, 3 = ưu tiên vừa phải, 5 = ưu tiên mạnh, 7 = rất mạnh, 9 = áp đảo.
          Các giá trị 1/2...1/9 biểu thị chiều ngược lại.
        </p>
      </div>
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

                  const selectOptions = getSelectOptions(value)

                  return (
                    <td key={columnLabel} className="p-2">
                      <select
                        value={String(value)}
                        onChange={(event) =>
                          onChange(rowIndex, columnIndex, Number(event.target.value))
                        }
                        className="w-full rounded-[1.1rem] border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-[0_8px_18px_rgba(37,99,235,0.05)]"
                      >
                        {selectOptions.map((option) => (
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
  const currentExists = saatyScale.some((option) => Math.abs(option.value - currentValue) < 0.0001)

  if (currentExists) {
    return saatyScale
  }

  return [{ value: currentValue, label: formatSaatyLabel(currentValue) }, ...saatyScale]
}
