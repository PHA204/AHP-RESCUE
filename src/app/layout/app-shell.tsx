import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ContextDrawer } from './context-drawer'
import { Topbar } from './topbar'
import { useUiStore } from '../store/ui-store'

const contextualRoutes = new Set(['/dashboard', '/cases', '/ahp'])

export function AppShell() {
  const theme = useUiStore((state) => state.theme)
  const selectedCaseId = useUiStore((state) => state.selectedCaseId)
  const isContextDrawerOpen = useUiStore((state) => state.isContextDrawerOpen)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const showContextDrawer =
    isContextDrawerOpen && Boolean(selectedCaseId) && contextualRoutes.has(location.pathname)

  return (
    <div className="min-h-screen bg-transparent">
      <Topbar />
      <div className="mx-auto flex w-full max-w-[1360px] gap-5 px-4 pb-8 md:px-6">
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
        {showContextDrawer ? <ContextDrawer /> : null}
      </div>
    </div>
  )
}
