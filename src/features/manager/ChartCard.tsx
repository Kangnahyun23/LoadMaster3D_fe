import { useId, type ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * Khung một biểu đồ của bảng điều khiển (LM-090): tiêu đề, dòng nguồn, rồi hình. Hình chỉ để nhìn (`aria-hidden`); trình đọc màn
 * hình đọc bảng số ẩn ngay sau nó, cùng giá trị. Kỳ không có dữ liệu thì thay hình bằng một câu, không vẽ trục trống.
 */
export function ChartCard({
  title,
  note,
  badge,
  empty,
  table,
  className,
  children,
}: {
  title: string
  note: string
  badge?: ReactNode
  /** Câu thay hình khi kỳ không có dữ liệu cho biểu đồ này. */
  empty?: string
  /** Bảng số thay thế (`ChartTable`). */
  table: ReactNode
  className?: string
  children: ReactNode
}) {
  const titleId = useId()
  return (
    <Card className={cn('flex min-w-0 flex-col', className)}>
      <figure aria-labelledby={titleId} className="m-0 flex flex-col gap-4 px-5 py-4">
        <figcaption className="flex flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-2">
            <h2 id={titleId} className="text-h3 font-semibold">{title}</h2>
            {badge}
          </span>
          <span className="text-caption text-text-3">{note}</span>
        </figcaption>
        {empty ? (
          <p className="flex h-40 items-center justify-center rounded-md bg-surface px-6 text-center text-body text-text-2">{empty}</p>
        ) : (
          <>
            <div aria-hidden className="min-w-0">{children}</div>
            {table}
          </>
        )}
      </figure>
    </Card>
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
