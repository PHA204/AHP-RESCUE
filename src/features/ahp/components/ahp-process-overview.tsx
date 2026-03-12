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
              AHP Theory
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Goal → Criteria → Alternatives
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <StepCard
            icon={<GitBranch className="size-4" />}
            step="Bước 1"
            title="Xây dựng cấu trúc thứ bậc"
            description="Xác định mục tiêu, các tiêu chí đánh giá và danh sách phương án cần so sánh."
            tone="sky"
          />
          <StepCard
            icon={<Scale className="size-4" />}
            step="Bước 2"
            title="Tính trọng số tiêu chí"
            description="Lập ma trận so sánh cặp, chuẩn hóa, tính vector trọng số và kiểm tra CR."
            tone="orange"
          />
          <StepCard
            icon={<Sigma className="size-4" />}
            step="Bước 3"
            title="Tính ưu tiên phương án"
            description="So sánh cặp alternatives theo từng criterion, ghép ma trận S rồi tính Final Score."
            tone="emerald"
          />
        </div>
      </div>

      <div className="clay-card p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Rescue Context
        </p>
        <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
          Screening là bước tiền xử lý thực tế
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Trong hệ thống cứu hộ, số lượng ca có thể rất lớn. Vì vậy app thực hiện screening trước
          để rút gọn alternatives, nhưng phần AHP lý thuyết phía dưới vẫn giữ đủ 3 bước chuẩn.
        </p>

        <div className="mt-5 grid gap-3">
          <div className="rounded-[1.5rem] bg-[#f3efe8] px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">Goal</p>
            <p className="mt-1 text-sm text-slate-600">
              Xac dinh nan nhan can uu tien cuu truoc
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[#e9f6ff] px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">Criteria</p>
            <p className="mt-1 text-sm text-slate-600">
              {criteriaOrder.map((criterionKey) => criteriaLabels[criterionKey]).join(' • ')}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[#eefbe7] px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">Alternatives</p>
            <p className="mt-1 text-sm text-slate-600">
              {alternativesPreview.length > 0
                ? alternativesPreview
                    .map((caseItem) => caseItem.locationDescription ?? caseItem.id)
                    .join(' • ')
                : 'Chua co candidate sau screening'}
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
