import { cn } from '@/lib/utils'

/**
 * Nhóm nút chọn một — dùng cho preset camera, chế độ tô màu, tốc độ phát.
 * Bản `md` là panel nổi trên khung 3D (được phép có bóng, mục 5);
 * bản `sm` gọn hơn, viền 1px, cho thanh timeline.
 */
export type SegmentedOption<T extends string | number> = {
  value: T
  label: string
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
  mono = false,
  floating = true,
  className,
}: {
  options: ReadonlyArray<SegmentedOption<T>>
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  size?: 'md' | 'sm'
  mono?: boolean
  /** Panel nổi trên nền tối: nền trắng + bóng --e2 */
  floating?: boolean
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'flex border border-border bg-bg',
        size === 'md' ? 'gap-0.5 rounded-md p-1' : 'gap-0.5 rounded-sm p-0.5',
        floating && 'shadow-e2',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'whitespace-nowrap font-medium transition-colors duration-(--dur-fast) ease-standard',
              'outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary',
              size === 'md'
                ? 'h-7 rounded-sm px-2.5 text-caption'
                : 'h-[22px] rounded-[4px] px-2 text-[11px] leading-[14px]',
              mono && 'font-mono',
              active
                ? 'bg-primary-bg text-primary-hover'
                : 'text-text-2 hover:bg-surface',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
