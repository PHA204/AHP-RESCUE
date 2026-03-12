import type { ReactNode } from 'react'
import { Panel } from './panel'

type EmptyStateProps = {
  title: string
  description: string
  icon?: ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <Panel className="flex min-h-48 flex-col items-center justify-center gap-4 border-dashed p-8 text-center">
      {icon ? <div className="text-sky-600">{icon}</div> : null}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="max-w-sm text-sm text-slate-600">{description}</p>
      </div>
    </Panel>
  )
}
