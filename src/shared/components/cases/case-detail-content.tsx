import type { ReactNode } from 'react'
import {
  BrainCircuit,
  Clock3,
  LocateFixed,
  MapPinned,
  MessageSquareText,
  ShieldAlert,
  Users,
} from 'lucide-react'
import type { RescueCase } from '../../types/domain'
import { formatConfidence, formatHours, formatLongDateTime } from '../../lib/format'
import { geocodeStatusLabel, rescueStatusLabel, severityConfig } from '../../lib/severity'
import { Panel } from '../ui/panel'
import { StatusBadge } from '../ui/status-badge'

type CaseDetailContentProps = {
  caseItem: RescueCase
}

export function CaseDetailContent({ caseItem }: CaseDetailContentProps) {
  const severity = severityConfig[caseItem.severity]

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge className={severity.tone}>{severity.label}</StatusBadge>
          <StatusBadge tone="neutral">{rescueStatusLabel[caseItem.rescueStatus]}</StatusBadge>
          <StatusBadge tone={caseItem.geocodeStatus === 'failed' ? 'warning' : 'info'}>
            {geocodeStatusLabel[caseItem.geocodeStatus]}
          </StatusBadge>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{caseItem.locationDescription}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {caseItem.normalizedAddress ?? 'Chưa có địa chỉ chuẩn hóa'}
          </p>
        </div>
      </div>

      <Panel className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow icon={<ShieldAlert className="size-4" />} label="Mức độ" value={severity.label} />
          <InfoRow icon={<Users className="size-4" />} label="Số người" value={`${caseItem.numPeople ?? 0} người`} />
          <InfoRow icon={<Clock3 className="size-4" />} label="Thời gian chờ" value={formatHours(caseItem.waitingHours)} />
          <InfoRow icon={<BrainCircuit className="size-4" />} label="AI confidence" value={formatConfidence(caseItem.aiConfidence)} />
          <InfoRow icon={<LocateFixed className="size-4" />} label="Tiếp cận" value={caseItem.accessibility ?? 'Chưa rõ'} />
          <InfoRow icon={<MapPinned className="size-4" />} label="Cập nhật" value={formatLongDateTime(caseItem.updatedAt)} />
        </div>
      </Panel>

      <Panel className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">AI Extract</p>
        <div className="mt-3 grid gap-3 text-sm text-slate-700">
          <p>
            <span className="text-slate-500">Nhóm yếu thế:</span>{' '}
            {caseItem.vulnerableGroups.length > 0 ? caseItem.vulnerableGroups.join(', ') : 'Không phát hiện'}
          </p>
          <p>
            <span className="text-slate-500">Nguồn:</span> {caseItem.sourcePostId}
          </p>
          <p>
            <span className="text-slate-500">Hạng AHP hiện tại:</span>{' '}
            {caseItem.currentRank ? `#${caseItem.currentRank}` : 'Chưa xếp hạng'}
          </p>
        </div>
      </Panel>

      <Panel className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MessageSquareText className="size-4 text-cyan-600" />
          Bình luận gốc
        </div>
        <p className="text-sm leading-6 text-slate-700">{caseItem.rawComment}</p>
      </Panel>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/72 p-3">
      <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}
