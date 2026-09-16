import type { ReactNode } from 'react'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * Khung chung cho hai trang bàn giao (kiểu dáng, thành phần): tiêu đề,
 * mô tả, chip nhảy mục, các mục đánh số. Không có nav rail — đây là tài
 * liệu sống cho đội dev/design, không phải màn nghiệp vụ.
 */

export type SheetNavItem = { id: string; label: string }

export function SheetLayout({
  badge,
  title,
  description,
  nav,
  children,
}: {
  badge: string
  title: string
  description: string
  nav: SheetNavItem[]
  children: ReactNode
}) {
  const t = useT()
  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto flex max-w-300 flex-col gap-16 px-10 pt-14 pb-24">
        <header className="flex flex-col gap-3 border-b border-border pb-7">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-primary">
              <span className="h-2.5 w-3.5 rounded-xs border-2 border-t-4 border-white" />
            </span>
            <span className="text-body-lg font-semibold tracking-[-0.01em]">LoadMaster</span>
            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-caption font-medium text-text-3">
              {badge}
            </span>
            <LanguageSwitch className="ml-auto" />
          </div>
          <h1 className="text-display font-semibold tracking-[-0.02em]">{title}</h1>
          <p className="max-w-190 text-body-lg text-pretty text-text-2">{description}</p>
          <nav aria-label={t('designSystem.sections')} className="flex flex-wrap gap-2 text-caption">
            {nav.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-full border border-border px-2.5 py-1 text-text-2 transition-colors duration-(--dur-fast) hover:bg-surface"
              >
                {index + 1} · {item.label}
              </a>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </div>
  )
}

export function SheetSection({
  id,
  number,
  title,
  description,
  children,
}: {
  id: string
  number: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-caption font-medium text-text-3">{number}</span>
        <h2 className="text-h1 font-semibold tracking-[-0.01em]">{title}</h2>
        {description ? <p className="max-w-160 text-body text-pretty text-text-2">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

/** Một hàng trong mục: tên thành phần + ghi chú bên trái, mẫu bên phải. */
export function SheetRow({
  name,
  note,
  children,
  className,
}: {
  name: string
  note?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-6 border-t border-border py-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-h3 font-medium">{name}</h3>
        {note ? <p className="text-body text-pretty text-text-2">{note}</p> : null}
      </div>
      <div className={cn('flex min-w-0 flex-wrap items-start gap-4', className)}>{children}</div>
    </div>
  )
}

/** Nhãn nhỏ dưới một mẫu: "Default", "Hover"… */
export function Sample({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div>{children}</div>
      <span className="font-mono text-caption text-text-3">{label}</span>
    </div>
  )
}

/** Khung nền tối cho các thành phần vùng 3D. */
export function DarkStage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative min-h-60 w-full overflow-hidden rounded-md bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)] p-4',
        className,
      )}
    >
      {children}
    </div>
  )
}
