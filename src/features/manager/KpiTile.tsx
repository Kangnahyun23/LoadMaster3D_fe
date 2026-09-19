import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

/**
 * Ô KPI: nhãn, số lớn dùng mono, đơn vị và một dòng ghi chú nói số đến từ đâu.
 *
 * Số đã được format theo ngôn ngữ ở nơi gọi (`useFormat()`), ô chỉ trình bày. Không có chip chênh lệch so với kỳ trước
 * (LM-052, D-20): kho có chuỗi theo ngày nhưng "kỳ trước" chưa phải một con số màn nào cần. `badge` cạnh nhãn dành cho
 * nhãn nguồn như MOCK RESULT (số lấy từ kết quả tối ưu mock).
 */
export function KpiTile({
  label,
  value,
  unit,
  note,
  badge,
}: {
  label: string
  /** Đã format theo ngôn ngữ đang chọn. */
  value: string
  unit?: string
  note?: string
  badge?: ReactNode
}) {
  return (
    <Card role="group" aria-label={label} className="flex flex-col gap-2 px-5 py-4">
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-body text-text-2">{label}</span>
        {badge}
      </span>

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
