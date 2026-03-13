import { ChevronDown, LifeBuoy, Target } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useUiStore } from '../store/ui-store'
import { useDashboardQuery, usePresetsQuery } from '../../shared/lib/query-hooks'
import { cn } from '../../shared/lib/cn'

const navItems = [
  { to: '/dashboard', label: 'Tổng quan' },
  { to: '/cases', label: 'Danh sách' },
  { to: '/map', label: 'Bản đồ' },
  { to: '/ahp', label: 'AHP' },
  { to: '/sources', label: 'Nguồn' },
]

export function Topbar() {
  const activePresetId = useUiStore((state) => state.activePresetId)
  const setActivePresetId = useUiStore((state) => state.setActivePresetId)
  const presetsQuery = usePresetsQuery()
  const dashboardQuery = useDashboardQuery(activePresetId)

  const presets = presetsQuery.data ?? []
  const stats = dashboardQuery.data?.stats

  return (
    <header className="sticky top-0 z-30 px-4 pb-3 pt-4 backdrop-blur-sm md:px-6">
      <div className="mx-auto w-full max-w-[1360px]">
        <div className="nav-pill flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-5">
          <div className="flex items-center gap-3">
            <div className="clay-icon-box h-11 w-11 bg-[#f6b6a9] text-slate-800">
              <LifeBuoy className="size-4" />
            </div>
            <p className="text-xl font-bold tracking-tight text-slate-900">SOSHub</p>
          </div>

          <nav className="flex flex-wrap items-center gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-[#d9eef7] text-slate-900'
                      : 'text-slate-500 hover:bg-white/80 hover:text-slate-900',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <label className="clay-metric-chip min-w-[12rem] cursor-pointer px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Mẫu AHP
              </span>
              <div className="flex items-center gap-2">
                <Target className="size-4 text-emerald-600" />
                <select
                  aria-label="Chọn mẫu AHP"
                  value={activePresetId}
                  onChange={(event) => setActivePresetId(event.target.value)}
                  className="min-w-0 bg-transparent pr-5 text-sm font-semibold text-slate-900 outline-none"
                >
                  {presets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="size-4 text-slate-400" />
              </div>
            </label>

            <MetricChip label="CR" value={stats ? stats.consistencyRatio.toFixed(3) : '...'} tone="orange" />
            <MetricChip label="Rút gọn" value={stats ? String(stats.shortlistedCount) : '...'} tone="blue" />

            <NavLink to="/dispatch" className="clay-button-primary px-4 py-3 text-sm">
              Mở điều phối
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  )
}

function MetricChip({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'orange' | 'blue'
}) {
  return (
    <div
      className={cn(
        'clay-metric-chip min-w-[6.6rem] px-3 py-3',
        tone === 'orange' ? 'bg-[#fff0d9]' : 'bg-[#e9f6ff]',
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <span className="text-lg font-bold text-slate-900">{value}</span>
    </div>
  )
}
