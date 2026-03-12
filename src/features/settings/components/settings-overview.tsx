import { type ReactNode } from 'react'
import { MonitorCog, Palette, SlidersHorizontal } from 'lucide-react'
import { Panel } from '../../../shared/components/ui/panel'
import { SectionHeading } from '../../../shared/components/ui/section-heading'

export function SettingsOverview() {
  return (
    <div className="space-y-4">
      <Panel className="p-4 md:p-5">
        <SectionHeading
          eyebrow="Settings"
          title="Presets và cấu hình giao diện"
          description="Màn settings được gọn lại như bảng cấu hình, không còn chia nhiều hero block dọc."
        />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-3">
        <SettingCard
          icon={<SlidersHorizontal className="size-4 text-sky-600" />}
          title="AHP presets"
          description="Điểm nối preset manager thật sẽ nằm ở đây khi backend sẵn sàng."
        />
        <SettingCard
          icon={<Palette className="size-4 text-orange-500" />}
          title="Giao diện vận hành"
          description="Design tokens semantic đang tách riêng để đổi theme hoặc density dễ hơn."
        />
        <SettingCard
          icon={<MonitorCog className="size-4 text-emerald-500" />}
          title="Mock system config"
          description="Map layers, refresh interval và health endpoint có thể nối bằng adapter mà không sửa UI presentation."
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
