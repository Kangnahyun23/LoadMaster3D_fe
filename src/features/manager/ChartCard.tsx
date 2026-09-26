import { useId, type ReactNode } from 'react'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * Khung một biểu đồ của bảng điều khiển (LM-090, V2): thẻ nền đặc, tiêu đề và số tổng ở hai đầu, dòng nguồn dưới tiêu đề, rồi
 * hình. Hình chỉ để nhìn (`aria-hidden`); trình đọc màn hình đọc bảng số ẩn ngay sau nó, cùng giá trị. Kỳ không có dữ liệu thì
 * thay hình bằng một câu, không vẽ trục trống.
 *
 * `relative`: bảng `sr-only` định vị tuyệt đối phải có tổ tiên định vị, không thì nó kéo cả trang dài ra (AGENTS mục 5).
 */
export function ChartCard({
  title,
  note,
  badge,
  meta,
  empty,
  table,
  className,
  children,
}: {
  title: string
  note: string
  badge?: ReactNode
  /** Số tổng của biểu đồ ở góc phải tiêu đề ("12 chuyến"). */
  meta?: string
  /** Câu thay hình khi kỳ không có dữ liệu cho biểu đồ này. */
  empty?: string
  /** Bảng số thay thế (`ChartTable`). */
  table: ReactNode
  className?: string
  children: ReactNode
}) {
  const titleId = useId()
  return (
    <section className={cn('relative flex min-w-0 flex-col rounded-lg border border-border bg-bg', className)}>
      <figure aria-labelledby={titleId} className="m-0 flex flex-1 flex-col gap-5 p-5">
        <figcaption className="flex flex-col gap-0.5">
          <span className="flex items-baseline justify-between gap-3">
            <span className="flex flex-wrap items-center gap-2">
              <h2 id={titleId} className="text-h3 font-semibold text-ink-strong">{title}</h2>
              {badge}
            </span>
            {meta ? <span className="flex-none text-body text-ink-2 tabular-nums">{meta}</span> : null}
          </span>
          <span className="text-caption text-ink-3">{note}</span>
        </figcaption>
        {empty ? (
          <p className="flex min-h-40 flex-1 items-center justify-center rounded-md bg-surface px-6 text-center text-body text-ink-2">{empty}</p>
        ) : (
          <>
            <div aria-hidden className="flex min-w-0 flex-1 flex-col">{children}</div>
            {table}
          </>
        )}
      </figure>
    </section>
  )
}

/** Bảng số của biểu đồ, chỉ cho trình đọc màn hình. Hàng là chữ đã format theo ngôn ngữ. */
export function ChartTable({ title, headers, rows }: {
  title: string
  headers: readonly string[]
  rows: readonly (readonly string[])[]
}) {
  const t = useT()
  return (
    <table className="sr-only">
      <caption>{t('manager.charts.tableCaption', { title })}</caption>
      <thead>
        <tr>
          {headers.map((header) => <th key={header} scope="col">{header}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[0]}>
            {row.map((cell, index) => (index === 0 ? <th key={index} scope="row">{cell}</th> : <td key={index}>{cell}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
