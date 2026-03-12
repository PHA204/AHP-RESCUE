import { useMemo, useState } from 'react'
import { Compass, Layers3, LocateFixed, MapPinned } from 'lucide-react'
import { useUiStore } from '../../../app/store/ui-store'
import { CaseMap } from '../../../shared/components/map/case-map'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'
import { StatusBadge } from '../../../shared/components/ui/status-badge'
import { formatHours } from '../../../shared/lib/format'
import { useCasesQuery } from '../../../shared/lib/query-hooks'
import { severityConfig } from '../../../shared/lib/severity'

type SideTab = 'shortlist' | 'legend' | 'focus'

export function MapWorkspace() {
  const activePresetId = useUiStore((state) => state.activePresetId)
  const selectedCaseId = useUiStore((state) => state.selectedCaseId)
  const setSelectedCaseId = useUiStore((state) => state.setSelectedCaseId)
  const casesQuery = useCasesQuery(activePresetId)
  const [showWaitingOnly, setShowWaitingOnly] = useState(true)
  const [activeTab, setActiveTab] = useState<SideTab>('shortlist')

  const mapCases = useMemo(() => {
    const source = casesQuery.data ?? []
    return source.filter((caseItem) => {
      if (caseItem.geocodeStatus !== 'success') return false
      if (showWaitingOnly && caseItem.rescueStatus !== 'waiting') return false
      return caseItem.severity !== 'NOT_RESCUE'
    })
  }, [casesQuery.data, showWaitingOnly])

  const selectedCase = mapCases.find((item) => item.id === selectedCaseId) ?? mapCases[0]

  return (
    <div className="space-y-4">
      <Panel className="p-4 md:p-5">
        <SectionHeading
          eyebrow="Map Workspace"
          title="Dieu phoi theo khong gian"
          description="Workspace 2 cot toi uu cho dieu phoi: ban do o giua, thong tin tac chien va shortlist o side panel."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowWaitingOnly((current) => !current)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  showWaitingOnly
                    ? 'border-slate-800 bg-[#d9eef7] text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {showWaitingOnly ? 'Chi dang cho' : 'Hien tat ca'}
              </button>
              <StatusBadge tone="info">{mapCases.length} diem tren ban do</StatusBadge>
            </div>
          }
        />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <Panel className="p-4 md:p-5">
          <CaseMap
            cases={mapCases}
            selectedCaseId={selectedCaseId}
            onSelectCase={setSelectedCaseId}
            className="h-[72vh]"
          />
        </Panel>

        <Panel className="p-4 md:p-5">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'shortlist', label: 'Shortlist', icon: Layers3 },
              { id: 'legend', label: 'Legend', icon: Compass },
              { id: 'focus', label: 'Focus', icon: LocateFixed },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as SideTab)}
                  className={`inline-flex items-center gap-2 rounded-full border-[2px] px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'border-slate-800 bg-[#d9eef7] text-slate-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="mt-4 max-h-[72vh] overflow-auto pr-1">
            {activeTab === 'shortlist' ? (
              <div className="space-y-3">
                {mapCases.slice(0, 10).map((caseItem) => (
                  <button
                    key={caseItem.id}
                    type="button"
                    onClick={() => setSelectedCaseId(caseItem.id)}
                    className={`w-full rounded-[1.4rem] border-[2px] px-4 py-4 text-left transition ${
                      caseItem.id === selectedCaseId
                        ? 'border-slate-800 bg-[#d9eef7] shadow-[5px_6px_0_rgba(43,54,80,0.92)]'
                        : 'bg-white hover:-translate-y-[1px] hover:shadow-[5px_6px_0_rgba(43,54,80,0.92)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {caseItem.locationDescription}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {caseItem.district} • {formatHours(caseItem.waitingHours)}
                        </p>
                      </div>
                      <StatusBadge className={severityConfig[caseItem.severity].tone}>
                        {severityConfig[caseItem.severity].label}
                      </StatusBadge>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {activeTab === 'legend' ? (
              <div className="grid gap-3">
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((severity) => (
                  <div
                    key={severity}
                    className="rounded-[1.4rem] bg-[#f3efe8] px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`size-3 rounded-full ${severityConfig[severity].dot}`} />
                        <span className="text-sm font-medium text-slate-700">
                          {severityConfig[severity].label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-500">
                        {mapCases.filter((item) => item.severity === severity).length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {activeTab === 'focus' ? (
              selectedCase ? (
                <div className="space-y-4">
                  <div className="rounded-[1.5rem] bg-[#eefbe7] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">
                          {selectedCase.locationDescription}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                          <Compass className="size-3.5 text-sky-600" />
                          {selectedCase.district}
                        </div>
                      </div>
                      <StatusBadge className={severityConfig[selectedCase.severity].tone}>
                        {severityConfig[selectedCase.severity].label}
                      </StatusBadge>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-white px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <MapPinned className="size-4 text-sky-600" />
                      Dia chi chuan hoa
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {selectedCase.normalizedAddress ?? 'Chua chuan hoa dia chi'}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] bg-white px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <LocateFixed className="size-4 text-sky-600" />
                      Raw comment
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{selectedCase.rawComment}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Chon mot diem tren ban do de xem focus detail.
                </div>
              )
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  )
}
