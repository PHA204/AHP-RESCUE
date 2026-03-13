import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  Clock3,
  Layers3,
  LocateFixed,
  MapPinned,
  Search,
  Users,
} from 'lucide-react'
import { useUiStore } from '../../../app/store/ui-store'
import { CaseMap } from '../../../shared/components/map/case-map'
import { EmptyState } from '../../../shared/components/ui/empty-state'
import { LoadingCard } from '../../../shared/components/ui/loading-card'
import { Panel } from '../../../shared/components/ui/panel'
import { StatusBadge } from '../../../shared/components/ui/status-badge'
import { formatConfidence, formatHours } from '../../../shared/lib/format'
import { useCasesQuery } from '../../../shared/lib/query-hooks'
import { rescueStatusLabel, severityConfig } from '../../../shared/lib/severity'

type MapFilter = 'all' | 'waiting' | 'dispatched' | 'critical' | 'vulnerable'

const fitBoundsPadding = {
  topLeft: [30, 112] as [number, number],
  bottomRight: [30, 132] as [number, number],
}

export function MapWorkspace() {
  const activePresetId = useUiStore((state) => state.activePresetId)
  const selectedCaseId = useUiStore((state) => state.selectedCaseId)
  const setSelectedCaseId = useUiStore((state) => state.setSelectedCaseId)
  const casesQuery = useCasesQuery(activePresetId)

  const [districtFilter, setDistrictFilter] = useState('ALL')
  const [searchValue, setSearchValue] = useState('')
  const [activeFilter, setActiveFilter] = useState<MapFilter>('all')
  const [legendOpen, setLegendOpen] = useState(false)

  const availableCases = useMemo(() => {
    const source = casesQuery.data ?? []
    return source.filter(
      (caseItem) => caseItem.geocodeStatus === 'success' && caseItem.severity !== 'NOT_RESCUE',
    )
  }, [casesQuery.data])

  const districts = useMemo(
    () => ['ALL', ...new Set(availableCases.map((caseItem) => caseItem.district))],
    [availableCases],
  )

  const visibleCases = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase()

    return availableCases
      .filter((caseItem) => (districtFilter === 'ALL' ? true : caseItem.district === districtFilter))
      .filter((caseItem) => {
        if (!keyword) return true

        return [
          caseItem.locationDescription,
          caseItem.normalizedAddress,
          caseItem.rawComment,
          caseItem.district,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(keyword))
      })
      .filter((caseItem) => {
        if (activeFilter === 'all') return true
        if (activeFilter === 'waiting') return caseItem.rescueStatus === 'waiting'
        if (activeFilter === 'dispatched') return caseItem.rescueStatus === 'dispatched'
        if (activeFilter === 'critical') return caseItem.severity === 'CRITICAL'
        return caseItem.vulnerableGroups.length > 0
      })
      .sort((left, right) => {
        const leftRank = left.currentRank ?? 99
        const rightRank = right.currentRank ?? 99
        if (leftRank !== rightRank) return leftRank - rightRank
        return (right.waitingHours ?? 0) - (left.waitingHours ?? 0)
      })
  }, [activeFilter, availableCases, districtFilter, searchValue])

  const selectedCase =
    visibleCases.find((caseItem) => caseItem.id === selectedCaseId) ?? visibleCases[0] ?? null

  const filterItems: Array<{
    id: MapFilter
    label: string
    count: number
    icon: typeof Layers3
  }> = [
    {
      id: 'all',
      label: 'Tất cả',
      count: availableCases.length,
      icon: Layers3,
    },
    {
      id: 'waiting',
      label: 'Đang chờ',
      count: availableCases.filter((caseItem) => caseItem.rescueStatus === 'waiting').length,
      icon: Clock3,
    },
    {
      id: 'dispatched',
      label: 'Đang điều phối',
      count: availableCases.filter((caseItem) => caseItem.rescueStatus === 'dispatched').length,
      icon: MapPinned,
    },
    {
      id: 'critical',
      label: 'Nguy cấp',
      count: availableCases.filter((caseItem) => caseItem.severity === 'CRITICAL').length,
      icon: AlertTriangle,
    },
    {
      id: 'vulnerable',
      label: 'Dễ tổn thương',
      count: availableCases.filter((caseItem) => caseItem.vulnerableGroups.length > 0).length,
      icon: Users,
    },
  ]

  if (casesQuery.isLoading) {
    return (
      <div className="space-y-3">
        <LoadingCard className="h-20" />
        <div className="grid gap-4 lg:h-[calc(100vh-11.5rem)] lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[23rem_minmax(0,1fr)]">
          <LoadingCard className="h-[38rem] lg:h-full" />
          <LoadingCard className="h-[38rem] lg:h-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-4 lg:h-[calc(100vh-11.5rem)] lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[23rem_minmax(0,1fr)]">
        <Panel className="flex min-h-[34rem] flex-col overflow-hidden lg:min-h-0 lg:h-full">
          <div className="border-b border-slate-200/70 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Bản đồ
                </p>
                <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900">
                  Danh sách sự kiện và tìm kiếm
                </h2>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge tone="info">{visibleCases.length} ca</StatusBadge>
                <select
                  value={districtFilter}
                  onChange={(event) => setDistrictFilter(event.target.value)}
                  className="min-w-[11rem] rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400"
                  aria-label="Lọc theo khu vực"
                >
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district === 'ALL' ? 'Tất cả khu vực' : district}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Tìm kiếm địa điểm, mô tả, khu vực..."
                className="mt-3 w-full rounded-[1.35rem] border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400"
              />
            </label>
          </div>

          <div className="border-b border-slate-200/70 px-4 py-3">
            <div className="grid grid-cols-[3.25rem_minmax(0,1fr)_4.75rem] gap-3 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>Hạng</span>
              <span>Sự kiện</span>
              <span className="text-right">Mức độ</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-2 py-2">
            {visibleCases.length > 0 ? (
              <div className="space-y-1.5">
                {visibleCases.map((caseItem, index) => (
                  <button
                    key={caseItem.id}
                    type="button"
                    onClick={() => setSelectedCaseId(caseItem.id)}
                    className={`grid w-full grid-cols-[3.25rem_minmax(0,1fr)_4.75rem] items-center gap-3 rounded-[0.95rem] border px-2 py-2.5 text-left transition ${
                      caseItem.id === selectedCase?.id
                        ? 'border-slate-800 bg-[#d9eef7]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="rounded-[0.8rem] bg-[#f3efe8] px-2 py-1.5 text-center">
                      <p className="text-[10px] font-bold text-slate-900">
                        #{caseItem.currentRank ?? index + 1}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {caseItem.locationDescription ?? caseItem.id}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {caseItem.district} | {formatHours(caseItem.waitingHours)} |{' '}
                        {caseItem.numPeople ?? 0} người
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {caseItem.rawComment}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <StatusBadge className={`px-2 py-1 text-[10px] ${severityConfig[caseItem.severity].tone}`}>
                        {severityConfig[caseItem.severity].label}
                      </StatusBadge>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Không có ca phù hợp"
                description="Thử nới rộng khu vực hoặc bộ lọc để hiển thị thêm điểm trên bản đồ."
              />
            )}
          </div>
        </Panel>

        <Panel className="overflow-hidden p-3 lg:h-full">
          <div className="relative lg:h-full">
            <CaseMap
              cases={visibleCases}
              selectedCaseId={selectedCase?.id ?? null}
              onSelectCase={setSelectedCaseId}
              className="h-[68vh] min-h-[34rem] lg:h-full lg:min-h-0"
              fitBoundsPadding={fitBoundsPadding}
            />

            <div className="pointer-events-none absolute inset-0 z-[500]">
              <div className="pointer-events-auto absolute left-4 right-[5.25rem] top-4">
                <div className="overflow-x-auto rounded-[1.45rem] border border-white/70 bg-white/88 px-3 py-3 shadow-[0_12px_28px_rgba(43,54,80,0.12)] backdrop-blur">
                  <div className="flex min-w-max gap-2">
                    {filterItems.map((filterItem) => {
                      const Icon = filterItem.icon

                      return (
                        <button
                          key={filterItem.id}
                          type="button"
                          onClick={() => {
                            setActiveFilter(filterItem.id)
                            setSelectedCaseId(null)
                          }}
                          className={`inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border-[2px] px-3.5 py-2 text-xs font-semibold transition ${
                            activeFilter === filterItem.id
                              ? 'border-slate-800 bg-[#d9eef7] text-slate-900'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="size-4 shrink-0" />
                          {filterItem.label} ({filterItem.count})
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {selectedCase ? (
                <div className="pointer-events-auto absolute bottom-4 left-4 max-w-[15rem]">
                  <div className="rounded-[1rem] border border-white/70 bg-white/88 p-2 shadow-[0_8px_18px_rgba(43,54,80,0.12)] backdrop-blur">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Ca đang xem
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs font-bold text-slate-900">
                          {selectedCase.locationDescription ?? selectedCase.id}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {selectedCase.district}
                        </p>
                      </div>
                      <StatusBadge
                        className={`px-2 py-1 text-[10px] ${severityConfig[selectedCase.severity].tone}`}
                      >
                        {severityConfig[selectedCase.severity].label}
                      </StatusBadge>
                    </div>

                    <div className="mt-2 grid gap-1">
                      <InfoLine
                        icon={<Clock3 className="size-3.5 text-sky-600" />}
                        label={formatHours(selectedCase.waitingHours)}
                      />
                      <InfoLine
                        icon={<LocateFixed className="size-3.5 text-sky-600" />}
                        label={`AI ${formatConfidence(selectedCase.aiConfidence)}`}
                      />
                      <InfoLine
                        icon={<MapPinned className="size-3.5 text-sky-600" />}
                        label={rescueStatusLabel[selectedCase.rescueStatus]}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="pointer-events-auto absolute bottom-4 right-4 flex flex-col items-end gap-3">
                {legendOpen ? (
                  <div className="w-[16rem] rounded-[1.5rem] border border-white/70 bg-white/92 p-3 shadow-[0_16px_34px_rgba(43,54,80,0.16)] backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Chú giải
                    </p>
                    <div className="mt-3 space-y-2">
                      {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((severity) => (
                        <div
                          key={severity}
                          className="flex items-center justify-between rounded-[1.05rem] bg-[#f8f5ef] px-3 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`size-3 rounded-full ${severityConfig[severity].dot}`} />
                            <span className="text-sm font-medium text-slate-700">
                              {severityConfig[severity].label}
                            </span>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {
                              visibleCases.filter((caseItem) => caseItem.severity === severity).length
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => setSelectedCaseId(null)}
                  className="clay-button-primary h-14 w-14 justify-center rounded-[1.25rem] p-0"
                  aria-label="Hiện tất cả điểm"
                  title="Hiện tất cả điểm"
                >
                  <MapPinned className="size-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setLegendOpen((current) => !current)}
                  className="clay-button-primary h-14 w-14 justify-center rounded-[1.25rem] p-0"
                  aria-label="Mở chú giải"
                  title="Mở chú giải"
                >
                  <Layers3 className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function InfoLine({
  icon,
  label,
}: {
  icon: ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-[0.95rem] bg-[#f8f5ef] px-2.5 py-2 text-xs text-slate-700">
      {icon}
      <span>{label}</span>
    </div>
  )
}
