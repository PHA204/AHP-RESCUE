import { Panel } from './panel'

export function LoadingCard({ className = 'h-48' }: { className?: string }) {
  return (
    <Panel className={`animate-pulse overflow-hidden ${className}`}>
      <div className="h-full bg-[linear-gradient(110deg,rgba(255,255,255,0.03),rgba(255,255,255,0.08),rgba(255,255,255,0.03))] bg-[length:200%_100%] animate-[shimmer_2.5s_linear_infinite]" />
    </Panel>
  )
}
