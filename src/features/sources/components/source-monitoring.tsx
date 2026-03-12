import { type ReactNode } from 'react'
import { Activity, MessageCircleMore, RadioTower, RefreshCw } from 'lucide-react'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'
import { StatusBadge } from '../../../shared/components/ui/status-badge'
import { formatDateTime } from '../../../shared/lib/format'
import { usePostsQuery } from '../../../shared/lib/query-hooks'

export function SourceMonitoring() {
  const postsQuery = usePostsQuery()
  const posts = postsQuery.data ?? []
  const liveCount = posts.filter((post) => post.syncStatus === 'live').length
  const totalComments = posts.reduce((sum, post) => sum + post.commentVolume, 0)

  return (
    <div className="space-y-4">
      <Panel className="p-4 md:p-5">
        <SectionHeading
          eyebrow="Sources"
          title="Monitoring sources"
          description="Màn theo dõi nguồn được nén lại theo kiểu management: nhìn nhanh trạng thái sync, volume comment và vùng bao phủ."
        />

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <CompactMetric icon={<Activity className="size-4" />} label="Nguồn live" value={String(liveCount)} />
          <CompactMetric
            icon={<MessageCircleMore className="size-4" />}
            label="Tổng comments"
            value={String(totalComments)}
          />
          <CompactMetric icon={<RefreshCw className="size-4" />} label="Tổng nguồn" value={String(posts.length)} />
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <div className="max-h-[72vh] overflow-auto">
          <table className="min-w-full text-left">
            <thead className="sticky top-0 z-10 bg-[#f8fbff] text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-4">Nguồn</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-4 py-4">Comment volume</th>
                <th className="px-4 py-4">Khu vực</th>
                <th className="px-4 py-4">Lần sync</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 align-top">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{post.title}</p>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#f3efe8] px-3 py-1 text-xs font-semibold text-slate-700">
                        <RadioTower className="size-3.5 text-sky-600" />
                        {post.sourceName}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusBadge tone={post.syncStatus === 'live' ? 'success' : 'warning'}>
                      <Activity className="size-3.5" />
                      {post.syncStatus}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-4 align-top text-sm font-medium text-slate-900">
                    {post.commentVolume}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      {post.districtScope.map((district) => (
                        <span
                          key={district}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                        >
                          {district}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-slate-600">
                    {formatDateTime(post.lastSyncAt)}
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

function CompactMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.2rem] bg-[#f3efe8] px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
