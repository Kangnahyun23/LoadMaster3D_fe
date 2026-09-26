import type { TooltipContentProps } from 'recharts'

/**
 * Nét chung của ba biểu đồ recharts trên bảng điều khiển (LM-090). Màu lấy token qua `var()` (AGENTS mục 4); tám màu điểm giao
 * không dùng ở đây vì chúng chỉ để định danh điểm giao. Một chuỗi mỗi biểu đồ nên một màu `--primary`, không cần chú giải — tiêu
 * đề nói hình vẽ gì. Cột ≤ 24 px, đầu dữ liệu bo 4 px, lưới là đường mảnh 1 px liền, nhãn trục cỡ micro (11 px).
 */
export const BAR_FILL = 'var(--primary)'

export const GRID_STROKE = 'var(--border)'

/** Dải nền khi rê chuột qua một cột. */
export const HOVER_CURSOR = { fill: 'var(--surface)' }

/** Chữ trục và nhãn đầu cột: micro 11 px, màu chữ phụ; số dùng JetBrains Mono. */
export const TICK = { fontSize: 11, fill: 'var(--text-3)' }
export const MONO_TICK = { ...TICK, className: 'font-mono' }
export const VALUE_LABEL = { fontSize: 11, fill: 'var(--text-2)', className: 'font-mono' }

export const AXIS_LINE = { stroke: 'var(--border)' }

/** Kích thước ban đầu trước khi đo khung: trình duyệt đo lại ngay, jsdom (không có layout) giữ nguyên để vẫn vẽ được. */
export const INITIAL_SIZE = { width: 640, height: 240 }

/**
 * Chiều cao tối thiểu của biểu đồ cột ngang: `rowHeight` px mỗi hàng, ít nhất ba hàng. Khung cao hơn (hàng lưới cao theo thẻ bên
 * cạnh) thì biểu đồ giãn theo, cột vẫn ≤ 24 px.
 */
export function rowsHeight(rows: number, rowHeight = 36): number {
  return Math.max(3, rows) * rowHeight + 8
}

/**
 * Tooltip theo token: giá trị đậm đứng trước, nhãn phụ phía dưới (người đọc đã biết chuỗi, cần con số). Là lớp nổi nên
 * được dùng bóng `--e2` (mục 5). Truyền dạng phần tử (`content={<ChartTooltip … />}`): recharts nhân bản phần tử và gắn thêm
 * `active`/`label`/`payload`, nên kiểu component giữ nguyên giữa các lần vẽ.
 */
export function ChartTooltip({ active, label, payload, formatLabel, formatValue, formatDetail }: Partial<
  Pick<TooltipContentProps, 'active' | 'label' | 'payload'>
> & {
  formatLabel: (label: string) => string
  formatValue: (value: number) => string
  /** Dòng phụ thứ ba (tỷ lệ trên tổng của kỳ), tra theo nhãn của cột. */
  formatDetail?: (label: string) => string | undefined
}) {
  const value = payload?.[0]?.value
  if (!active || typeof value !== 'number') return null
  const detail = formatDetail?.(String(label ?? ''))
  return (
    <div className="flex max-w-64 flex-col gap-0.5 rounded-md border border-border bg-bg px-3 py-2 shadow-e2">
      <span className="font-mono text-body font-semibold text-text">{formatValue(value)}</span>
      <span className="text-caption text-text-2">{formatLabel(String(label ?? ''))}</span>
      {detail ? <span className="font-mono text-caption text-text-3">{detail}</span> : null}
    </div>
  )
}
