import type { GeocodeStatus, RescueStatus, SeverityLevel } from '../types/domain'

export const severityConfig: Record<
  SeverityLevel,
  { label: string; tone: string; ring: string; dot: string }
> = {
  CRITICAL: {
    label: 'Nguy cấp',
    tone: 'border-rose-200 bg-rose-50 text-rose-700',
    ring: 'ring-rose-300/50',
    dot: 'bg-rose-500',
  },
  HIGH: {
    label: 'Cao',
    tone: 'border-orange-200 bg-orange-50 text-orange-700',
    ring: 'ring-orange-300/50',
    dot: 'bg-orange-500',
  },
  MEDIUM: {
    label: 'Trung bình',
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
    ring: 'ring-amber-300/50',
    dot: 'bg-amber-400',
  },
  LOW: {
    label: 'Thấp',
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
    ring: 'ring-sky-300/50',
    dot: 'bg-sky-500',
  },
  NOT_RESCUE: {
    label: 'Không cứu hộ',
    tone: 'border-slate-200 bg-slate-50 text-slate-600',
    ring: 'ring-slate-300/50',
    dot: 'bg-slate-400',
  },
}

export const rescueStatusLabel: Record<RescueStatus, string> = {
  waiting: 'Chờ cứu hộ',
  dispatched: 'Đang điều phối',
  rescued: 'Đã tiếp cận',
  false_alarm: 'Không hợp lệ',
}

export const geocodeStatusLabel: Record<GeocodeStatus, string> = {
  success: 'Định vị tốt',
  failed: 'Thiếu tọa độ',
  pending: 'Đang xử lý',
}
