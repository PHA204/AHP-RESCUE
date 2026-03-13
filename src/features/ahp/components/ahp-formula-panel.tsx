import { Sigma } from 'lucide-react'
import { Panel } from '../../../shared/components/ui/panel'

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
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Cách tính</h3>
        </div>
      </div>

      <details className="mt-5 rounded-[1.6rem] bg-[#f3efe8] p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900">
          Mở công thức
        </summary>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            "A'_ij = A_ij / tổng cột j",
            "W_i = trung bình hàng i của A'",
            'WSV = A x W',
            'CV_i = WSV_i / W_i',
            'lambda_max = trung bình CV',
            'CI = (lambda_max - n) / (n - 1)',
            'CR = CI / RI',
            'Final Score = S x W',
          ].map((formula) => (
            <div key={formula} className="rounded-[1.2rem] bg-white px-4 py-3 text-sm text-slate-700">
              {formula}
            </div>
          ))}
        </div>
      </details>
    </Panel>
  )
}
