import type { ReactNode } from 'react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/utils'

export type ShareRow = {
  readonly key: string
  readonly label: ReactNode
  /** Giá trị đã format ("3", "2.580 kg"). */
  readonly value: string
  /** Phần của hàng trên tổng, 0–100 — độ dài thanh. */
  readonly share: number
  /** `share` đã format ("25,0%"). */
  readonly shareLabel: string
}

/**
 * Hàng thanh ngang theo V2 cho biểu đồ phần-trên-tổng của bảng điều khiển (chuyến theo trạng thái, khối lượng theo xe): nhãn,
 * thanh, giá trị, tỷ lệ. Thanh dài theo tỷ lệ trên tổng của kỳ, một màu `--primary` (AGENTS mục 5, biểu đồ 2D); dạng viên thuốc
 * vì đây là thanh tỷ lệ, không phải nút. Chỉ để nhìn: `ChartCard` đặt nó trong vùng `aria-hidden`, bảng số `sr-only` đọc thay.
 *
 * - `inline`: nhãn ngắn một cột, thanh giãn giữa — cột rộng (chuyến theo trạng thái).
 * - `stacked`: nhãn và giá trị một dòng, thanh ngay dưới — cột hẹp với nhãn dài (tên xe có biển số).
 */
export function ShareBars({ rows, layout }: { rows: readonly ShareRow[]; layout: 'inline' | 'stacked' }) {
  return (
    <ul className={cn('m-0 flex list-none flex-col p-0', layout === 'inline' ? 'gap-3.5' : 'gap-4')}>
      {rows.map((row) => (layout === 'inline' ? (
        <li key={row.key} className="grid grid-cols-[minmax(0,168px)_minmax(0,1fr)_32px_52px] items-center gap-3.5">
          <span className="min-w-0 text-body text-ink-1">{row.label}</span>
          <ProgressBar value={row.share} />
          <span className="text-right text-body font-semibold text-ink-strong tabular-nums">{row.value}</span>
          <span className="text-right text-caption text-ink-3 tabular-nums">{row.shareLabel}</span>
        </li>
      ) : (
        <li key={row.key} className="flex flex-col gap-1.5">
          <span className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 text-body text-ink-1">{row.label}</span>
            <span className="flex-none text-body font-semibold whitespace-nowrap text-ink-strong tabular-nums">{row.value}</span>
          </span>
          <span className="grid grid-cols-[minmax(0,1fr)_52px] items-center gap-3">
            <ProgressBar value={row.share} />
            <span className="text-right text-caption text-ink-3 tabular-nums">{row.shareLabel}</span>
          </span>
        </li>
      )))}
    </ul>
  )
}
