import { useEffect } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { formatConfidence, formatHours } from '../../lib/format'
import { severityConfig } from '../../lib/severity'
import type { RescueCase } from '../../types/domain'

type CaseMapProps = {
  cases: RescueCase[]
  selectedCaseId?: string | null
  onSelectCase?: (caseId: string) => void
  className?: string
  zoom?: number
  fitBoundsPadding?: {
    topLeft?: [number, number]
    bottomRight?: [number, number]
  }
}

const markerColors = {
  CRITICAL: '#f43f5e',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#0ea5e9',
  NOT_RESCUE: '#94a3b8',
} as const

export function CaseMap({
  cases,
  selectedCaseId,
  onSelectCase,
  className = 'h-[28rem]',
  zoom = 12,
  fitBoundsPadding,
}: CaseMapProps) {
  const geocodedCases = cases.filter((item) => item.lat !== undefined && item.lng !== undefined)

  if (geocodedCases.length === 0) {
    return (
      <div
        className={`hero-aurora flex items-center justify-center rounded-[2rem] border border-dashed border-sky-200/80 px-6 text-center text-sm text-slate-600 ${className}`}
      >
        Chưa đủ dữ liệu định vị để hiển thị bản đồ.
      </div>
    )
  }

  const center = geocodedCases[0]

  return (
    <div
      className={`overflow-hidden rounded-[2rem] border border-sky-100 bg-white/80 shadow-[0_24px_50px_rgba(37,99,235,0.14)] ${className}`}
    >
      <MapContainer
        center={[center.lat!, center.lng!]}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitBoundsController
          cases={geocodedCases}
          selectedCaseId={selectedCaseId}
          fitBoundsPadding={fitBoundsPadding}
        />
        {geocodedCases.map((caseItem) => {
          const severity = severityConfig[caseItem.severity]
          const isSelected = caseItem.id === selectedCaseId
          const color = markerColors[caseItem.severity]
          const radius = getMarkerRadius(caseItem.severity, isSelected)

          return (
            <CircleMarker
              key={caseItem.id}
              center={[caseItem.lat!, caseItem.lng!]}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: isSelected ? 0.98 : 0.72,
                weight: isSelected ? 4 : 2,
              }}
              radius={radius}
              eventHandlers={{
                click: () => onSelectCase?.(caseItem.id),
              }}
            >
              {isSelected ? (
                <Tooltip direction="top" offset={[0, -10]} permanent>
                  <span className="text-xs font-semibold text-slate-800">
                    {caseItem.locationDescription ?? caseItem.id}
                  </span>
                </Tooltip>
              ) : null}
              <Popup>
                <div className="min-w-64 space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {caseItem.id}
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {caseItem.locationDescription}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">{caseItem.rawComment}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs ${severity.tone}`}>
                      {severity.label}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                      {caseItem.numPeople ?? 0} người
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Chờ {formatHours(caseItem.waitingHours)} | AI {formatConfidence(caseItem.aiConfidence)}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}

function FitBoundsController({
  cases,
  selectedCaseId,
  fitBoundsPadding,
}: {
  cases: RescueCase[]
  selectedCaseId?: string | null
  fitBoundsPadding?: {
    topLeft?: [number, number]
    bottomRight?: [number, number]
  }
}) {
  const map = useMap()

  useEffect(() => {
    const focusCase = cases.find((item) => item.id === selectedCaseId)
    if (focusCase?.lat && focusCase.lng) {
      map.flyTo([focusCase.lat, focusCase.lng], 14, { duration: 0.6 })
      return
    }

    const bounds = cases
      .filter((item) => item.lat !== undefined && item.lng !== undefined)
      .map((item) => [item.lat!, item.lng!] as [number, number])

    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        paddingTopLeft: fitBoundsPadding?.topLeft ?? [30, 30],
        paddingBottomRight: fitBoundsPadding?.bottomRight ?? [30, 30],
      })
    }
  }, [cases, fitBoundsPadding, map, selectedCaseId])

  return null
}

function getMarkerRadius(
  severity: RescueCase['severity'],
  isSelected: boolean,
) {
  const baseRadius =
    severity === 'CRITICAL'
      ? 12
      : severity === 'HIGH'
        ? 10
        : severity === 'MEDIUM'
          ? 9
          : severity === 'LOW'
            ? 8
            : 7

  return isSelected ? baseRadius + 4 : baseRadius
}
