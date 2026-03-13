import { useMemo, useState, type ReactNode } from 'react'
import { ArrowRight, MapPinned, Siren, Target, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUiStore } from '../../../app/store/ui-store'
import { CaseMap } from '../../../shared/components/map/case-map'
import { LoadingCard } from '../../../shared/components/ui/loading-card'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'
import { StatusBadge } from '../../../shared/components/ui/status-badge'
import { formatPercent } from '../../../shared/lib/format'
import { useDashboardQuery } from '../../../shared/lib/query-hooks'
import { severityConfig } from '../../../shared/lib/severity'
import type { SeverityLevel } from '../../../shared/types/domain'

type SeverityFilter = 'ALL' | Extract<SeverityLevel, 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>

const filterOptions: SeverityFilter[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export function DashboardOverview() {
  const activePresetId = useUiStore((state) => state.activePresetId)
  const selectedCaseId = useUiStore((state) => state.selectedCaseId)
  const setSelectedCaseId = useUiStore((state) => state.setSelectedCaseId)
  const dashboardQuery = useDashboardQuery(activePresetId)
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('ALL')

  const filteredCases = useMemo(() => {
    const source = dashboardQuery.data?.cases ?? []
    return source.filter((caseItem) => {
      if (severityFilter !== 'ALL' && caseItem.severity !== severityFilter) return false
      return caseItem.severity !== 'NOT_RESCUE'
    })
  }, [dashboardQuery.data?.cases, severityFilter])

  const topCases = filteredCases
    .filter((item) => item.currentRank)
    .sort((left, right) => (left.currentRank ?? 99) - (right.currentRank ?? 99))
    .slice(0, 5)

  const heroCase = topCases[0]

  if (dashboardQuery.isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-12">
        <LoadingCard className="h-32 xl:col-span-12" />
        <LoadingCard className="h-[30rem] xl:col-span-8" />
        <LoadingCard className="h-[30rem] xl:col-span-4" />
      </div>
    )
  }

  const data = dashboardQuery.data
  if (!data) return null

  const geocodedRate =
    data.stats.totalIncomingCases > 0 ? data.stats.geocodedCount / data.stats.totalIncomingCases : 0

  return (
    <div className="space-y-5">
      <section className="clay-card grid gap-5 p-5 md:p-6 xl:grid-cols-[1.12fr,0.88fr]">
        <div className="space-y-5">
          <div className="clay-chip w-fit bg-[#8bee8d] text-slate-900">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            AI + AHP cho điều phối SOS
          </div>

          <div className="max-w-[40rem]">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
              Bảng điều phối cứu hộ
              <span className="text-emerald-500"> nhanh, rõ và dễ thao tác</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/cases" className="clay-button-primary px-5 py-3 text-sm">
              Mở danh sách ưu tiên
              <ArrowRight className="size-4" />
            </Link>
            <Link to="/ahp" className="clay-button-secondary px-5 py-3 text-sm">
              Mở khu vực AHP
            </Link>
          </div>

          <div className="grid max-w-[40rem] grid-cols-2 gap-3 md:grid-cols-4">
            <HeroMetric value={data.stats.waitingCases} label="Đang chờ cứu hộ" />
            <HeroMetric value={data.stats.criticalCount} label="Ca nguy cấp" />
            <HeroMetric value={data.stats.geocodedCount} label="Đã định vị" />
            <HeroMetric value={data.stats.activePosts} label="Nguồn đang chạy" />
          </div>
        </div>

        <div className="rounded-[1.7rem] border-[3px] border-slate-800 bg-white px-5 py-5 shadow-[6px_7px_0_rgba(43,54,80,0.92)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="clay-icon-box h-14 w-14 rounded-[1.2rem] bg-[#c6e7f3] text-slate-800">
                <Siren className="size-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Ca ưu tiên
                </p>
                <p className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                  {heroCase?.locationDescription ?? 'Đang tổng hợp ca ưu tiên'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {heroCase
                    ? `${heroCase.numPeople ?? 0} người • ${heroCase.district}`
                    : 'Chưa có dữ liệu'}
                </p>
              </div>
            </div>
            {heroCase ? (
              <StatusBadge className={severityConfig[heroCase.severity].tone}>
                {severityConfig[heroCase.severity].label}
              </StatusBadge>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <QuickMetric
              icon={<Target className="size-4" />}
              label="Mẫu hiện tại"
              value={data.stats.currentPresetLabel}
            />
            <QuickMetric
              icon={<MapPinned className="size-4" />}
              label="Sẵn sàng"
              value={`${Math.round(geocodedRate * 100)}%`}
            />
          </div>

          <button
            type="button"
            className="mt-5 inline-flex w-full items-center justify-center rounded-[1.2rem] border-[3px] border-slate-800 bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-[5px_6px_0_rgba(43,54,80,0.92)] transition hover:bg-emerald-600"
            onClick={() => heroCase && setSelectedCaseId(heroCase.id)}
          >
            Chọn ca ưu tiên
          </button>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
        <Panel className="p-5 md:p-6">
          <SectionHeading
            eyebrow="Bản đồ"
            title="Bản đồ điều phối"
            action={
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSeverityFilter(option)}
                    className={`rounded-full border-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                      severityFilter === option
                        ? 'border-slate-800 bg-[#d9eef7] text-slate-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {option === 'ALL' ? 'Tất cả' : severityConfig[option].label}
                  </button>
                ))}
              </div>
            }
          />

          <div className="mt-4">
            <CaseMap
              cases={filteredCases}
              selectedCaseId={selectedCaseId}
              onSelectCase={setSelectedCaseId}
            />
          </div>
        </Panel>

        <Panel className="p-5 md:p-6">
          <SectionHeading eyebrow="Danh sách" title="Danh sách rút gọn" />

          <div className="mt-4 space-y-3">
            {topCases.map((caseItem) => (
              <button
                key={caseItem.id}
                type="button"
                onClick={() => setSelectedCaseId(caseItem.id)}
                className={`w-full rounded-[1.6rem] border-[3px] px-4 py-4 text-left transition ${
                  selectedCaseId === caseItem.id
                    ? 'border-slate-800 bg-[#d9eef7] shadow-[6px_7px_0_rgba(43,54,80,0.92)]'
                    : 'bg-white hover:-translate-y-[1px] hover:shadow-[6px_7px_0_rgba(43,54,80,0.92)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Hạng #{caseItem.currentRank}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {caseItem.locationDescription}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{caseItem.district}</p>
                  </div>
                  <StatusBadge className={severityConfig[caseItem.severity].tone}>
                    {severityConfig[caseItem.severity].label}
                  </StatusBadge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <QueueTag icon={<Users className="size-3.5" />} label={`${caseItem.numPeople ?? 0} người`} />
                  <QueueTag
                    icon={<Target className="size-3.5" />}
                    label={`AHP ${formatPercent(caseItem.currentScore ?? 0)}`}
                  />
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function HeroMetric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white/60 px-3 py-3">
      <p className="text-3xl font-bold tracking-tight text-slate-900">{value}+</p>
      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </div>
  )
}

function QueueTag({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#f3efe8] px-3 py-1.5 text-xs font-semibold text-slate-700">
      {icon}
      {label}
    </span>
  )
}

function QuickMetric({
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
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
