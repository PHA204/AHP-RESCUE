import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useUiStore } from '../../../app/store/ui-store'
import { useCasesQuery } from '../../../shared/lib/query-hooks'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'

export function AnalyticsOverview() {
  const activePresetId = useUiStore((state) => state.activePresetId)
  const casesQuery = useCasesQuery(activePresetId)
  const cases = casesQuery.data ?? []

  const severityData = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => ({
    name: severity,
    value: cases.filter((item) => item.severity === severity).length,
  }))

  const rescueStatusData = ['waiting', 'dispatched', 'rescued', 'false_alarm'].map((status) => ({
    name: status,
    value: cases.filter((item) => item.rescueStatus === status).length,
  }))

  return (
    <div className="space-y-4">
      <Panel className="p-4 md:p-5">
        <SectionHeading eyebrow="Phân tích" title="Số liệu tổng hợp" />

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <CompactMetric label="Tổng ca" value={String(cases.length)} />
          <CompactMetric
            label="Nguy cấp + cao"
            value={String(cases.filter((item) => item.severity === 'CRITICAL' || item.severity === 'HIGH').length)}
          />
          <CompactMetric
            label="Đã tiếp cận"
            value={String(cases.filter((item) => item.rescueStatus === 'rescued').length)}
          />
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel className="p-4 md:p-5">
          <SectionHeading eyebrow="Mức độ" title="Phân bố mức độ" />
          <div className="mt-4 h-[52vh] rounded-[1.6rem] border border-slate-200 bg-white/80 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-4 md:p-5">
          <SectionHeading eyebrow="Trạng thái" title="Phân bố trạng thái cứu hộ" />
          <div className="mt-4 h-[52vh] rounded-[1.6rem] border border-slate-200 bg-white/80 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rescueStatusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={105}
                  fill="#f97316"
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
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
