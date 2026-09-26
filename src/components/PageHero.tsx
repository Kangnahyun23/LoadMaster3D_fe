import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'

/**
 * Thanh tiêu đề 72 px của màn trong khung ứng dụng (V2): icon nhận diện màn, tiêu đề, một dòng mô tả, hành động ở phải.
 *
 * - Icon là `<span aria-hidden>` đứng **ngoài** `<h1>`: tên truy cập của tiêu đề giữ đúng chữ tiêu đề, test đọc tiêu đề
 *   bằng `exact: true` không đổi.
 * - Hành động nằm trong cùng `<header>` với tiêu đề — test tìm nút theo `heading.closest('header')`.
 * - `meta` là số đếm hoặc mã đi kèm tiêu đề (mono, nhỏ); `description` ẩn dưới 768 px để thanh giữ đúng 72 px.
 *
 * Không dùng cho màn có tiêu đề là dữ liệu (mã chuyến, tên xe) hay thanh 56 px của Planner (AGENTS mục 5).
 */
export function PageHero({
  icon: Icon,
  title,
  meta,
  description,
  actions,
  back,
}: {
  icon: LucideIcon
  title: string
  meta?: string
  description?: ReactNode
  actions?: ReactNode
  back?: { to: string; label: string }
}) {
  return (
    <header className="flex h-18 flex-none items-center gap-4 border-b border-border bg-chrome px-shell max-sm:px-4">
      {back ? (
        <Button variant="ghost" size="icon" aria-label={back.label} className="-mr-1 flex-none" asChild>
          <Link to={back.to}>
            <ChevronLeft strokeWidth={1.5} aria-hidden />
          </Link>
        </Button>
      ) : null}

      <span aria-hidden className="hero-icon grid size-11 flex-none place-items-center rounded-lg text-tint-blue-fg max-sm:hidden">
        <Icon className="size-5" strokeWidth={1.5} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-baseline gap-2">
          <h1 className="text-h1 font-semibold tracking-[-0.35px] whitespace-nowrap text-ink-strong">{title}</h1>
          {meta ? <span className="truncate font-mono text-caption text-ink-3">{meta}</span> : null}
        </div>
        {description ? <p className="hidden truncate text-lede text-ink-2 md:block">{description}</p> : null}
      </div>

      {actions ? <div className="flex flex-none items-center gap-3">{actions}</div> : null}
    </header>
  )
}
