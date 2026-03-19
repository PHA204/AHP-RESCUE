import { LifeBuoy } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../shared/lib/cn'

const navItems = [
  { to: '/dashboard', label: 'Tổng quan' },
  { to: '/cases', label: 'Danh sách' },
  { to: '/map', label: 'Bản đồ' },
  { to: '/ahp', label: 'AHP' },
  { to: '/sources', label: 'Nguồn' },
]

export function Topbar() {
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

          <NavLink to="/dispatch" className="clay-button-primary px-4 py-3 text-sm">
            Mở điều phối
          </NavLink>
        </div>
      </div>
    </header>
  )
}
