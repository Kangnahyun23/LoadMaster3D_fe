import { Card } from '@/components/ui/Card'

/**
 * Ô KPI: nhãn, số lớn dùng mono, đơn vị và một dòng ghi chú nói số đến từ đâu.
 *
 * Số đã được format theo ngôn ngữ ở nơi gọi (`useFormat()`), ô chỉ trình bày. Không còn chip chênh lệch
 * so với kỳ trước: kho dữ liệu không có kỳ trước để so (LM-052, D-20).
 */
export function KpiTile({
  label,
  value,
  unit,
  note,
}: {
  label: string
  /** Đã format theo ngôn ngữ đang chọn. */
  value: string
  unit?: string
  note?: string
}) {
  return (
    <Card role="group" aria-label={label} className="flex flex-col gap-2 px-5 py-4">
      <span className="text-body text-text-2">{label}</span>

      <span className="font-mono text-[28px] font-semibold leading-8 tracking-[-0.02em]">
        {value}
        {unit ? (
          <span className="ml-1 font-mono text-body-lg font-normal text-text-3">{unit}</span>
        ) : null}
      </span>

      {note ? <span className="text-caption text-text-3">{note}</span> : null}
    </Card>
  )
}
