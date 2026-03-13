import type { ReactNode } from 'react'
import { MonitorCog, Palette, SlidersHorizontal } from 'lucide-react'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'

export function SettingsOverview() {
  return (
    <div className="space-y-4">
      <Panel className="p-4 md:p-5">
        <SectionHeading eyebrow="Cài đặt" title="Mẫu và cấu hình" />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-3">
        <SettingCard
          icon={<SlidersHorizontal className="size-4 text-sky-600" />}
          title="Mẫu AHP"
          description="Quản lý mẫu và cấu hình so sánh cặp."
        />
        <SettingCard
          icon={<Palette className="size-4 text-orange-500" />}
          title="Giao diện"
          description="Điều chỉnh theme và mật độ hiển thị."
        />
        <SettingCard
          icon={<MonitorCog className="size-4 text-emerald-500" />}
          title="Hệ thống"
          description="Thiết lập tần suất cập nhật và lớp dữ liệu."
        />
      </div>
    </div>
  )
}

function SettingCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <Panel className="p-5">
      <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
        {icon}
        {title}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
    </Panel>
  )
}
