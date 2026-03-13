import { ChevronLeft, ChevronRight } from 'lucide-react'

type StepItem = {
  id: string
  label: string
}

type AhpBlockStepperProps = {
  title: string
  subtitle: string
  steps: StepItem[]
  activeStepId: string
  onChange: (stepId: string) => void
}

export function AhpBlockStepper({
  title,
  subtitle,
  steps,
  activeStepId,
  onChange,
}: AhpBlockStepperProps) {
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStepId),
  )

  const previousStep = activeIndex > 0 ? steps[activeIndex - 1] : null
  const nextStep = activeIndex < steps.length - 1 ? steps[activeIndex + 1] : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        <div className="rounded-full bg-[#f3efe8] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
          Bước {activeIndex + 1}/{steps.length}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => onChange(step.id)}
            className={`rounded-full border-[2px] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
              step.id === activeStepId
                ? 'border-slate-800 bg-[#d9eef7] text-slate-900'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {index + 1}. {step.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => previousStep && onChange(previousStep.id)}
          disabled={!previousStep}
          className="inline-flex items-center gap-2 rounded-full border-[2px] border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft className="size-4" />
          {previousStep ? previousStep.label : 'Đầu trang'}
        </button>

        <button
          type="button"
          onClick={() => nextStep && onChange(nextStep.id)}
          disabled={!nextStep}
          className="inline-flex items-center gap-2 rounded-full border-[2px] border-slate-800 bg-[#d9eef7] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[#cbe7f4] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          {nextStep ? nextStep.label : 'Hết'}
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
