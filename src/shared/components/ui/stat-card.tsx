import type { ReactNode } from 'react'
import { Panel } from './panel'

type StatCardProps = {
  label: string
  value: string | number
  meta: string
  icon: ReactNode
}

export function StatCard({ label, value, meta, icon }: StatCardProps) {
  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          <p className="text-sm text-slate-600">{meta}</p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(224,242,254,0.92))] p-3 text-sky-700">
          {icon}
        </div>
      </div>
    </Panel>
  )
}
