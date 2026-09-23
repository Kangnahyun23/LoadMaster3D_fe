import type { TooltipContentProps } from 'recharts'

/**
 * Nét chung của biểu đồ recharts trên bảng điều khiển (LM-090, lấp đầy theo ngày). Màu lấy token qua `var()` (AGENTS mục 4); tám màu điểm giao không dùng ở
 * đây vì chúng chỉ để định danh điểm giao. Một chuỗi mỗi biểu đồ nên một màu `--primary`, không cần chú giải — tiêu đề nói hình
 * vẽ gì. Cột ≤ 24 px, đầu dữ liệu bo 4 px, lưới là đường mảnh 1 px liền, nhãn trục cỡ micro (11 px).
 */
export const BAR_FILL = 'var(--primary)'

export const GRID_STROKE = 'var(--border)'

/** Dải nền khi rê chuột qua một cột. */
export const HOVER_CURSOR = { fill: 'var(--surface)' }

/** Chữ trục: micro 11 px, màu chữ phụ; số dùng JetBrains Mono. */
const TICK = { fontSize: 11, fill: 'var(--text-3)' }
export const MONO_TICK = { ...TICK, className: 'font-mono' }

export const AXIS_LINE = { stroke: 'var(--border)' }

/** Kích thước ban đầu trước khi đo khung: trình duyệt đo lại ngay, jsdom (không có layout) giữ nguyên để vẫn vẽ được. */
export const INITIAL_SIZE = { width: 640, height: 240 }

/**
 * Tooltip theo token: giá trị đậm đứng trước, nhãn phụ phía dưới (người đọc đã biết chuỗi, cần con số). Là lớp nổi nên
 * được dùng bóng `--e2` (mục 5). Truyền dạng phần tử (`content={<ChartTooltip … />}`): recharts nhân bản phần tử và gắn thêm
 * `active`/`label`/`payload`, nên kiểu component giữ nguyên giữa các lần vẽ.
 */
export function ChartTooltip({ active, label, payload, formatLabel, formatValue }: Partial<
  Pick<TooltipContentProps, 'active' | 'label' | 'payload'>
> & {
  formatLabel: (label: string) => string
  formatValue: (value: number) => string
}) {
  const value = payload?.[0]?.value
  if (!active || typeof value !== 'number') return null
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border bg-bg px-3 py-2 shadow-e2">
      <span className="font-mono text-body font-semibold text-text">{formatValue(value)}</span>
      <span className="text-caption text-text-2">{formatLabel(String(label ?? ''))}</span>
    </div>
  )
}
