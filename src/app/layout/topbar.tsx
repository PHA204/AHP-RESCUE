// REFACTORED: expanded primary navigation and surfaced query connectivity status in the header
import { onlineManager, useQueryClient } from '@tanstack/react-query'
import { LifeBuoy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../shared/lib/cn'

type ConnectionState = 'online' | 'offline' | 'pending'

const navItems = [
  { to: '/dashboard', label: 'Tổng quan' },
  { to: '/cases', label: 'Ca cứu nạn' },
  { to: '/ahp', label: 'AHP' },
  { to: '/map', label: 'Bản đồ' },
  { to: '/dispatch', label: 'Điều phối' },
  { to: '/analytics', label: 'Phân tích' },
  { to: '/settings', label: 'Cài đặt' },
]

export function Topbar() {
  const queryClient = useQueryClient()
  const [connectionState, setConnectionState] = useState<ConnectionState>('pending')

  useEffect(() => {
    const updateConnection = () => {
      const queries = queryClient.getQueryCache().getAll()
      const hasSuccess = queries.some((query) => query.state.status === 'success')
      const allError = queries.length > 0 && queries.every((query) => query.state.status === 'error')
      const isOnline = onlineManager.isOnline()

      if (!isOnline || allError) {
        setConnectionState('offline')
        return
      }

      if (hasSuccess) {
        setConnectionState('online')
        return
      }

      setConnectionState('pending')
    }

    updateConnection()

    const unsubscribeCache = queryClient.getQueryCache().subscribe(updateConnection)
    const unsubscribeOnline = onlineManager.subscribe(updateConnection)

    return () => {
      unsubscribeCache()
      unsubscribeOnline()
    }
  }, [queryClient])

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

          <div className="flex items-center gap-3">
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em]',
                connectionState === 'online' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                connectionState === 'offline' && 'border-rose-200 bg-rose-50 text-rose-700',
                connectionState === 'pending' && 'border-slate-200 bg-white/80 text-slate-600',
              )}
            >
              <span
                className={cn(
                  'size-2.5 rounded-full',
                  connectionState === 'online' && 'bg-emerald-500',
                  connectionState === 'offline' && 'bg-rose-500',
                  connectionState === 'pending' && 'bg-slate-400',
                )}
              />
              {connectionState === 'online'
                ? 'Kết nối'
                : connectionState === 'offline'
                  ? 'Mất kết nối'
                  : 'Đang kiểm tra'}
            </div>

            <NavLink to="/dispatch" className="clay-button-primary px-4 py-3 text-sm">
              Mở điều phối
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  )
}

