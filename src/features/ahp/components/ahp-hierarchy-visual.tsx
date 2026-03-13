import { ArrowDown, ArrowRight } from 'lucide-react'
import { criteriaLabels, criteriaOrder } from '../../../shared/lib/ahp'
import type { RescueCase } from '../../../shared/types/domain'

type AhpHierarchyVisualProps = {
  screenedCases: RescueCase[]
}

export function AhpHierarchyVisual({ screenedCases }: AhpHierarchyVisualProps) {
  const previewAlternatives = screenedCases.slice(0, 5)

  return (
    <div className="clay-card p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Bước 1
          </p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            Cấu trúc AHP
          </h3>
        </div>
        <div className="rounded-full bg-[#eefbe7] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          {screenedCases.length} phương án
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5 xl:flex-row xl:items-start">
        <div className="xl:w-[18rem]">
          <div className="rounded-[1.75rem] border-[3px] border-slate-800 bg-[#f7b7ae] px-5 py-5 shadow-[6px_7px_0_rgba(43,54,80,0.92)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">Mục tiêu</p>
            <p className="mt-2 text-lg font-bold leading-7 text-slate-900">
              Xác định nạn nhân cần ưu tiên cứu trước
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center self-center text-slate-400 xl:h-[14rem]">
          <ArrowRight className="hidden size-5 xl:block" />
          <ArrowDown className="size-5 xl:hidden" />
        </div>

        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {criteriaOrder.map((criterionKey) => (
            <div
              key={criterionKey}
              className="rounded-[1.5rem] border-[3px] border-slate-800 bg-[#d9eef7] px-4 py-4 shadow-[5px_6px_0_rgba(43,54,80,0.92)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                Tiêu chí
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">{criteriaLabels[criterionKey]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 text-slate-400">
        <div className="h-px flex-1 bg-slate-300" />
        <ArrowDown className="size-5" />
        <div className="h-px flex-1 bg-slate-300" />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {previewAlternatives.length > 0 ? (
          previewAlternatives.map((caseItem) => (
            <div
              key={caseItem.id}
              className="rounded-[1.5rem] border-[3px] border-slate-800 bg-white px-4 py-4 shadow-[5px_6px_0_rgba(43,54,80,0.92)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Phương án
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {caseItem.locationDescription ?? caseItem.id}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                {caseItem.rawComment}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500 md:col-span-2 xl:col-span-5">
            Chưa có phương án để hiển thị.
          </div>
        )}
      </div>
    </div>
  )
}
