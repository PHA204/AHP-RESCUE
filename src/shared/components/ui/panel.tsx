import type { HTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

type PanelProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    tone?: 'default' | 'muted' | 'critical'
  }
>

const toneClasses: Record<NonNullable<PanelProps['tone']>, string> = {
  default: 'clay-card',
  muted: 'clay-card bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,241,235,0.96))]',
  critical: 'clay-card bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(254,242,242,0.96))]',
}

export function Panel({ children, className, tone = 'default', ...props }: PanelProps) {
  return (
    <div
      className={cn(
        'rounded-[2rem] transition-colors duration-200',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
