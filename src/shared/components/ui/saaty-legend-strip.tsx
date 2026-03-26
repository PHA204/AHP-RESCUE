// REFACTORED: extracted reusable Saaty legend strip for clearer AHP input guidance
const legendItems = [
  { value: '1', label: 'Ngang nhau' },
  { value: '3', label: 'Hơi quan trọng hơn' },
  { value: '5', label: 'Quan trọng hơn' },
  { value: '7', label: 'Rất quan trọng hơn' },
  { value: '9', label: 'Tuyệt đối hơn' },
  { value: '2,4,6,8', label: 'Trung gian' },
]

export function SaatyLegendStrip() {
  return (
    <div className="flex flex-wrap gap-2 rounded-[1.5rem] bg-[#f8f5ef] p-3">
      {legendItems.map((item) => (
        <div
          key={item.value}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2"
        >
          <span className="text-sm font-bold text-slate-900">{item.value}</span>
          <span className="text-xs text-slate-600">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
