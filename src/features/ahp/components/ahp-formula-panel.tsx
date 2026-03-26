// REFACTORED: upgraded the formula panel with proper math typesetting and clearer academic presentation
import 'katex/dist/katex.min.css'
import { Sigma } from 'lucide-react'
import { BlockMath } from 'react-katex'
import { Panel } from '../../../shared/components/ui/panel'

const formulas = [
  String.raw`A'_{ij} = \frac{A_{ij}}{\sum_i A_{ij}}`,
  String.raw`w_i = \frac{1}{n} \sum_j A'_{ij}`,
  String.raw`(AW)_i = \sum_j A_{ij} \cdot w_j`,
  String.raw`\lambda_{max} = \frac{1}{n} \sum_i \frac{(AW)_i}{w_i}`,
  String.raw`CI = \frac{\lambda_{max} - n}{n - 1}`,
  String.raw`CR = \frac{CI}{RI}`,
  String.raw`\text{Final Score} = S \times W`,
]

export function AhpFormulaPanel() {
  return (
    <Panel className="p-5 md:p-6">
      <div className="flex items-center gap-3">
        <div className="clay-icon-box h-12 w-12 rounded-[1rem] bg-[#d9eef7] text-slate-800">
          <Sigma className="size-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Công thức
          </p>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Cách tính AHP</h3>
        </div>
      </div>

      <details open className="mt-5 rounded-[1.6rem] bg-[#f3efe8] p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900">
          📐 Các công thức AHP
        </summary>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {formulas.map((formula) => (
            <div key={formula} className="rounded-[1.2rem] bg-white px-4 py-4 text-slate-700">
              <BlockMath math={formula} />
            </div>
          ))}
        </div>
      </details>
    </Panel>
  )
}
