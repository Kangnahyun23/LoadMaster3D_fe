import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

/** Nghĩa cố định của năm cặp tint (AGENTS mục 4): không mượn màu sang nghĩa khác. */
export type KpiTone = 'blue' | 'green' | 'amber' | 'violet' | 'slate'

const TONE_CLASS: Record<KpiTone, string> = {
  blue: 'bg-tint-blue text-tint-blue-fg',
  green: 'bg-tint-green text-tint-green-fg',
  amber: 'bg-tint-amber text-tint-amber-fg',
  violet: 'bg-tint-violet text-tint-violet-fg',
  slate: 'bg-tint-slate text-tint-slate-fg',
}

/**
 * Ô số liệu dùng chung (V2): icon trên nền tint, số lớn 26 px sans (chữ số đều nhau), nhãn, và một dòng ghi chú nói số đến
 * từ đâu. Số KPI không dùng mono: mono dành cho mã và số đo trong bảng (brief V2).
 *
 * - Số đã được format theo ngôn ngữ ở nơi gọi (`useFormat()`), ô chỉ trình bày. Mọi số cùng màu mực — màu chỉ ở icon.
 * - Vỏ ngoài là `role="group"` có `aria-label` = nhãn: test và trình đọc màn hình đọc đúng số của ô đó chứ không bắt nhầm số
 *   trùng ở bảng bên dưới.
 * - `value` và `unit` là hai text node liền nhau, không khoảng trắng giữa — `"7/ 12 chuyến"`; khoảng cách nhìn thấy là margin.
 * - Không có chip chênh lệch so với kỳ trước (LM-052, D-20). `badge` cạnh nhãn dành cho nhãn nguồn như MOCK RESULT.
 */
export function KpiTile({
  label,
  value,
  unit,
  note,
  badge,
  icon: Icon,
  tone = 'blue',
}: {
  label: string
  /** Đã format theo ngôn ngữ đang chọn. */
  value: string
  unit?: string
  note?: string
  badge?: ReactNode
  icon?: LucideIcon
  tone?: KpiTone
}) {
  return (
    <div role="group" aria-label={label} className="glass-tile flex min-h-21 items-center gap-3.5 rounded-xl px-4.5 py-3.5">
      {Icon ? (
        <span aria-hidden className={`grid size-10 flex-none place-items-center rounded-lg shadow-(--icon-ring) ${TONE_CLASS[tone]}`}>
          <Icon className="size-5" strokeWidth={1.5} />
        </span>
      ) : null}

      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[26px] leading-[1.1] font-semibold text-ink-strong tabular-nums">
          {value}
          {unit ? <span className="ml-1 text-body font-normal text-ink-2">{unit}</span> : null}
        </span>
        <span className="flex flex-wrap items-center gap-2 text-body text-ink-2">
          {label}
          {badge}
        </span>
        {note ? <span className="text-note text-ink-3">{note}</span> : null}
      </div>
    </div>
  )
}
