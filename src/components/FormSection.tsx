import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Một phần đánh số của form dài (V2): số thứ tự trong ô vuông bo góc, tiêu đề h2, một câu mô tả, rồi nội dung. Các phần nằm trong
 * cùng một thẻ và phân cách bằng đường 1px — dùng ở form chuyến và Thiết lập tối ưu. Số chỉ để dẫn mắt, không phải bước bắt buộc
 * theo thứ tự: `aria-hidden`, tiêu đề đọc được một mình.
 */
export function FormSection({ number, title, description, children, className }: {
  number: number
  title: string
  description?: ReactNode
  children: ReactNode
  className?: string
}) {
  // Phần đầu không có đường phân cách phía trên
  const first = number === 1
  return (
    <section className={cn('flex flex-col gap-4', !first && 'border-t border-border pt-6', className)}>
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-6 flex-none place-items-center rounded-md border border-primary/40 font-mono text-caption font-semibold text-primary">
          {number}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-h3 font-semibold text-ink-strong">{title}</h2>
          {description ? <p className="text-lede text-ink-2">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}
