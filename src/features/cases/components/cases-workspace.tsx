import { useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import { ExternalLink, Filter, MapPinned, Search, Siren, TimerReset } from 'lucide-react'
import { useUiStore } from '../../../app/store/ui-store'
import { EmptyState } from '../../../shared/components/ui/empty-state'
import { LoadingCard } from '../../../shared/components/ui/loading-card'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'
import { StatusBadge } from '../../../shared/components/ui/status-badge'
import {
  formatConfidence,
  formatDateTime,
  formatHours,
  formatPercent,
} from '../../../shared/lib/format'
import { useCasesQuery } from '../../../shared/lib/query-hooks'
import {
  geocodeStatusLabel,
  rescueStatusLabel,
  severityConfig,
} from '../../../shared/lib/severity'

export function CasesWorkspace() {
  const activePresetId = useUiStore((state) => state.activePresetId)
  const selectedCaseId = useUiStore((state) => state.selectedCaseId)
  const setSelectedCaseId = useUiStore((state) => state.setSelectedCaseId)
  const casesQuery = useCasesQuery(activePresetId)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [severity, setSeverity] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [geocode, setGeocode] = useState('ALL')

  const filteredCases = useMemo(() => {
    const source = casesQuery.data ?? []
    return source.filter((caseItem) => {
      const matchesSearch =
        deferredSearch.length === 0 ||
        [caseItem.id, caseItem.locationDescription, caseItem.rawComment, caseItem.district]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(deferredSearch.toLowerCase())

      if (!matchesSearch) return false
      if (severity !== 'ALL' && caseItem.severity !== severity) return false
      if (status !== 'ALL' && caseItem.rescueStatus !== status) return false
      if (geocode !== 'ALL' && caseItem.geocodeStatus !== geocode) return false
      return true
    })
  }, [casesQuery.data, deferredSearch, geocode, severity, status])

  if (casesQuery.isLoading) {
    return (
      <div className="space-y-4">
        <LoadingCard className="h-24" />
        <LoadingCard className="h-[34rem]" />
      </div>
    )
  }

  const totalCases = casesQuery.data?.length ?? 0
  const waitingCount = filteredCases.filter((caseItem) => caseItem.rescueStatus === 'waiting').length
  const criticalCount = filteredCases.filter((caseItem) => caseItem.severity === 'CRITICAL').length
  const geocodedCount = filteredCases.filter((caseItem) => caseItem.geocodeStatus === 'success').length

  return (
    <div className="space-y-4">
      <Panel className="p-4 md:p-5">
        <SectionHeading
          eyebrow="Cases"
          title="Victim queue / priority list"
          description="Man hinh van hanh uu tien loc nhanh, scan nhanh va giu du lieu quan trong tren mot viewport ngan hon."
        />

        <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr,0.8fr]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="flex items-center gap-3 rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 md:col-span-2 xl:col-span-2">
              <Search className="size-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tim theo ID, dia diem, raw comment..."
                className="w-full bg-transparent placeholder:text-slate-400 outline-none"
              />
            </label>

            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
              className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            >
              <option value="ALL">Tat ca muc do</option>
              <option value="CRITICAL">Nguy cap</option>
              <option value="HIGH">Cao</option>
              <option value="MEDIUM">Trung binh</option>
              <option value="LOW">Thap</option>
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            >
              <option value="ALL">Tat ca trang thai</option>
              <option value="waiting">Cho cuu ho</option>
              <option value="dispatched">Dang dieu phoi</option>
              <option value="rescued">Da tiep can</option>
              <option value="false_alarm">Khong hop le</option>
            </select>

            <select
              value={geocode}
              onChange={(event) => setGeocode(event.target.value)}
              className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            >
              <option value="ALL">Tat ca dinh vi</option>
              <option value="success">Dinh vi tot</option>
              <option value="pending">Dang xu ly</option>
              <option value="failed">Thieu toa do</option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
            <CompactMetric icon={<Filter className="size-4" />} label="Sau loc" value={`${filteredCases.length}/${totalCases}`} />
            <CompactMetric icon={<Siren className="size-4" />} label="Nguy cap" value={String(criticalCount)} />
            <CompactMetric icon={<TimerReset className="size-4" />} label="Dang cho" value={String(waitingCount)} />
            <CompactMetric icon={<MapPinned className="size-4" />} label="Dinh vi" value={String(geocodedCount)} />
          </div>
        </div>
      </Panel>

      {filteredCases.length === 0 ? (
        <EmptyState
          title="Khong co ca nao khop bo loc"
          description="Thu noi dieu kien severity, geocode hoac tu khoa de mo lai candidate set."
        />
      ) : (
        <Panel className="overflow-hidden">
          <div className="max-h-[72vh] overflow-auto">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 z-10 bg-[#f8fbff] text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-4 py-4">Case</th>
                  <th className="px-4 py-4">Muc do</th>
                  <th className="px-4 py-4">Dia diem</th>
                  <th className="px-4 py-4">Nguoi / nhom</th>
                  <th className="px-4 py-4">AHP</th>
                  <th className="px-4 py-4">Cho</th>
                  <th className="px-4 py-4">AI</th>
                  <th className="px-4 py-4">Trang thai</th>
                  <th className="px-4 py-4">Nguon</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((caseItem) => {
                  const severityTone = severityConfig[caseItem.severity]

                  return (
                    <tr
                      key={caseItem.id}
                      className={`cursor-pointer border-t border-slate-100 transition ${
                        selectedCaseId === caseItem.id ? 'bg-sky-50' : 'hover:bg-slate-50/80'
                      }`}
                      onClick={() => setSelectedCaseId(caseItem.id)}
                    >
                      <td className="px-4 py-3 align-top">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{caseItem.id}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(caseItem.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge className={severityTone.tone}>{severityTone.label}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-sm font-medium text-slate-900">
                          {caseItem.locationDescription}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{caseItem.district}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-sm text-slate-900">{caseItem.numPeople ?? 0} nguoi</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {caseItem.vulnerableGroups.length > 0
                            ? caseItem.vulnerableGroups.join(', ')
                            : 'Khong phat hien'}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatPercent(caseItem.currentScore ?? 0)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {caseItem.currentRank ? `Hang #${caseItem.currentRank}` : 'Chua xep hang'}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-slate-700">
                        {formatHours(caseItem.waitingHours)}
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-slate-700">
                        {formatConfidence(caseItem.aiConfidence)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-sm text-slate-900">
                          {rescueStatusLabel[caseItem.rescueStatus]}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {geocodeStatusLabel[caseItem.geocodeStatus]}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <MapPinned className="size-4 text-cyan-600" />
                          {caseItem.sourcePostId}
                        </div>
                        <button
                          type="button"
                          className="mt-2 inline-flex items-center gap-2 text-xs text-cyan-700 hover:text-cyan-800"
                        >
                          <ExternalLink className="size-3.5" />
                          Mo trong map
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  )
}

function CompactMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.2rem] bg-[#f3efe8] px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
