import type { LucideIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type NavRailButtonProps = ComponentProps<'button'> & {
  icon: LucideIcon
  /** Nhãn chữ dưới icon, như mục nav. */
  label: string
  /** Lớp đè góc trên icon, ví dụ số thông báo chưa đọc. */
  badge?: ReactNode
}

/**
 * Nút hành động trên nav rail (tìm nhanh LM-099, chuông thông báo LM-098): cùng hình với mục nav — icon 24px, nhãn 12px, vùng bấm
 * ≥ 64px — nhưng là nút, không phải liên kết. Dùng làm con của `DialogTrigger`/`DropdownMenuTrigger` (`asChild`): nhận `ref` và
 * `data-state`; đang mở thì nền icon `--primary-bg` như mục đang chọn.
 */
export function NavRailButton({ icon: Icon, label, badge, className, ...props }: NavRailButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'group relative flex min-h-16 w-full flex-none flex-col items-center justify-center gap-1 px-2 py-2 text-center',
        'text-text-2 outline-none hover:text-text data-[state=open]:text-primary-hover',
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'relative grid h-8 w-14 place-items-center rounded-md transition-colors duration-(--dur-fast) ease-standard',
          'group-hover:bg-border group-data-[state=open]:bg-primary-bg',
        )}
      >
        <Icon className="size-6" strokeWidth={1.5} aria-hidden />
        {badge}
      </span>
      <span className="text-caption leading-4 font-medium">{label}</span>
    </button>
  )
}
