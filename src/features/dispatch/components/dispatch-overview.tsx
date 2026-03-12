import { ArrowRight, LifeBuoy, Users } from 'lucide-react'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'
import { StatusBadge } from '../../../shared/components/ui/status-badge'
import { useDispatchTeamsQuery } from '../../../shared/lib/query-hooks'

export function DispatchOverview() {
  const teamsQuery = useDispatchTeamsQuery()
  const teams = teamsQuery.data ?? []
  const availableCount = teams.filter((team) => team.status === 'available').length
  const totalCapacity = teams.reduce((sum, team) => sum + team.capacity, 0)

  return (
    <div className="space-y-4">
      <Panel className="p-4 md:p-5">
        <SectionHeading
          eyebrow="Dispatch"
          title="Điều phối lực lượng cứu hộ"
          description="Màn dispatch được nén theo kiểu operation board: nhìn nhanh trạng thái đội, sức chứa và hành động tiếp theo."
        />

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <CompactMetric label="Đội sẵn sàng" value={String(availableCount)} />
          <CompactMetric label="Tổng đội" value={String(teams.length)} />
          <CompactMetric label="Tổng sức chứa" value={String(totalCapacity)} />
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <div className="max-h-[72vh] overflow-auto">
          <table className="min-w-full text-left">
            <thead className="sticky top-0 z-10 bg-[#f8fbff] text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-4">Đội</th>
                <th className="px-4 py-4">Khu vực</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-4 py-4">Sức chứa</th>
                <th className="px-4 py-4">Workflow</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 align-top">
                    <p className="text-sm font-semibold text-slate-900">{team.name}</p>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-slate-600">{team.district}</td>
                  <td className="px-4 py-4 align-top">
                    <StatusBadge
                      tone={
                        team.status === 'available'
                          ? 'success'
                          : team.status === 'en_route'
                            ? 'info'
                            : 'warning'
                      }
                    >
                      {team.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#f3efe8] px-3 py-2 text-xs font-semibold text-slate-700">
                      <Users className="size-3.5 text-sky-600" />
                      {team.capacity} người / lượt
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="rounded-[1.2rem] bg-[#fff0d9] px-4 py-3 text-sm text-slate-700">
                      <div className="flex items-center gap-2 font-medium">
                        <LifeBuoy className="size-4 text-orange-600" />
                        Assignment workflow
                      </div>
                      <button
                        type="button"
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-sky-700 hover:text-sky-800"
                      >
                        Mở điều phối
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] bg-[#f3efe8] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
