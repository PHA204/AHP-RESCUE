import type { ReactNode } from 'react'
import { GitBranch, Scale, Sigma } from 'lucide-react'
import { criteriaLabels, criteriaOrder } from '../../../shared/lib/ahp'
import type { RescueCase } from '../../../shared/types/domain'

type AhpProcessOverviewProps = {
  screenedCases: RescueCase[]
}

export function AhpProcessOverview({ screenedCases }: AhpProcessOverviewProps) {
  const alternativesPreview = screenedCases.slice(0, 4)

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
      <div className="clay-card hero-aurora p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="clay-icon-box h-14 w-14 rounded-[1.25rem] bg-[#c7e9f6] text-slate-800">
            <GitBranch className="size-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Quy trình
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Mục tiêu {'->'} Tiêu chí {'->'} Phương án
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <StepCard
            icon={<GitBranch className="size-4" />}
            step="Bước 1"
            title="Cấu trúc thứ bậc"
            description="Xác định mục tiêu, tiêu chí và phương án."
            tone="sky"
          />
          <StepCard
            icon={<Scale className="size-4" />}
            step="Bước 2"
            title="Trọng số tiêu chí"
            description="Lập ma trận, chuẩn hóa và tính CR."
            tone="orange"
          />
          <StepCard
            icon={<Sigma className="size-4" />}
            step="Bước 3"
            title="Ưu tiên phương án"
            description="Tính trọng số phương án và tổng hợp điểm."
            tone="emerald"
          />
        </div>
      </div>

      <div className="clay-card p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Thiết lập
        </p>
        <div className="mt-5 grid gap-3">
          <div className="rounded-[1.5rem] bg-[#f3efe8] px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">Mục tiêu</p>
            <p className="mt-1 text-sm text-slate-600">
              Xác định nạn nhân cần ưu tiên cứu trước
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[#e9f6ff] px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">Tiêu chí</p>
            <p className="mt-1 text-sm text-slate-600">
              {criteriaOrder.map((criterionKey) => criteriaLabels[criterionKey]).join(' | ')}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[#eefbe7] px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">Phương án</p>
            <p className="mt-1 text-sm text-slate-600">
              {alternativesPreview.length > 0
                ? alternativesPreview
                    .map((caseItem) => caseItem.locationDescription ?? caseItem.id)
                    .join(' | ')
                : 'Chưa có phương án'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepCard({
  icon,
  step,
  title,
  description,
  tone,
}: {
  icon: ReactNode
  step: string
  title: string
  description: string
  tone: 'sky' | 'orange' | 'emerald'
}) {
  const background =
    tone === 'sky' ? 'bg-[#e9f6ff]' : tone === 'orange' ? 'bg-[#fff0d9]' : 'bg-[#eefbe7]'

  return (
    <div className={`rounded-[1.5rem] px-4 py-4 ${background}`}>
      <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
        {icon}
        {step}
      </div>
      <p className="mt-3 text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}
