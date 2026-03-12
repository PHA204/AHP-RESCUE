import { ChevronsRightLeft, X } from 'lucide-react'
import { useCasesQuery } from '../../shared/lib/query-hooks'
import { useUiStore } from '../store/ui-store'
import { CaseDetailContent } from '../../shared/components/cases/case-detail-content'

export function ContextDrawer() {
  const { activePresetId, isContextDrawerOpen, selectedCaseId, setContextDrawerOpen, setSelectedCaseId } =
    useUiStore()
  const casesQuery = useCasesQuery(activePresetId)
  const selectedCase = casesQuery.data?.find((item) => item.id === selectedCaseId) ?? null

  return (
    <aside className="hidden w-[20rem] shrink-0 xl:block">
      <div className="sticky top-[5.8rem] space-y-3">
        <div className="clay-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Selected Case
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">Chi tiết đang xem</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setContextDrawerOpen(!isContextDrawerOpen)}
                className="clay-icon-button"
                aria-label="Toggle case drawer"
              >
                <ChevronsRightLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedCaseId(null)}
                className="clay-icon-button"
                aria-label="Clear selected case"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {selectedCase && isContextDrawerOpen ? (
          <CaseDetailContent caseItem={selectedCase} />
        ) : (
          <div className="clay-card border-dashed p-5 text-sm leading-6 text-slate-600">
            Chọn một ca trên queue hoặc bản đồ để xem raw comment, AI extract và lý do ưu tiên.
          </div>
        )}
      </div>
    </aside>
  )
}
