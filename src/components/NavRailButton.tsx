import type { LucideIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type NavRailButtonProps = ComponentProps<'button'> & {
  icon: LucideIcon
  /** Nhãn chữ dưới icon, như mục nav. */
  label: string
  /** Lớp đè góc trên icon, ví dụ số thông báo chưa đọc. */
  badge?: ReactNode
  /**
   * `vertical` (mặc định) là hình cũ của rail dọc: icon trên, nhãn dưới.
   * `horizontal` dùng cho thanh điều hướng 56px — chỉ icon, nhãn thành `aria-label`
   * vì không đủ chiều cao cho hai dòng.
   */
  orientation?: 'vertical' | 'horizontal'
}

/**
 * Nút hành động trên nav rail (tìm nhanh LM-099, chuông thông báo LM-098): cùng hình với mục nav — icon 24px, nhãn 12px, vùng bấm
 * ≥ 64px — nhưng là nút, không phải liên kết. Dùng làm con của `DialogTrigger`/`DropdownMenuTrigger` (`asChild`): nhận `ref` và
 * `data-state`; đang mở thì nền icon `--primary-bg` như mục đang chọn.
 */
export function NavRailButton({
  icon: Icon,
  label,
  badge,
  orientation = 'vertical',
  className,
  'aria-label': ariaLabel,
  ...props
}: NavRailButtonProps) {
  const horizontal = orientation === 'horizontal'
  return (
    <button
      type="button"
      // Bản ngang không có chữ hiện ra nên nhãn phải thành aria-label. Người gọi vẫn
      // ghi đè được (chuông dùng nhãn kèm số tin chưa đọc).
      aria-label={ariaLabel ?? (horizontal ? label : undefined)}
      className={cn(
        'group relative flex flex-none items-center justify-center text-center',
        'text-text-2 outline-none hover:text-text data-[state=open]:text-primary-hover',
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
        horizontal ? 'size-9 rounded-md' : 'min-h-16 w-full flex-col gap-1 px-2 py-2',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'relative grid place-items-center rounded-md transition-colors duration-(--dur-fast) ease-standard',
          'group-hover:bg-border group-data-[state=open]:bg-primary-bg',
          horizontal ? 'size-9' : 'h-8 w-14',
        )}
      >
        <Icon className={horizontal ? 'size-5' : 'size-6'} strokeWidth={1.5} aria-hidden />
        {badge}
      </span>
      {horizontal ? null : <span className="text-caption leading-4 font-medium">{label}</span>}
    </button>
  )
}
