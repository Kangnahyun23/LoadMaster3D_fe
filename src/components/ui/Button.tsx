import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { Spinner } from './Spinner'
import { cn } from '@/lib/utils'

/**
 * Nút theo mục 3 style sheet + mục 5 AGENTS.md.
 * Hover chỉ đổi nền — không phóng to, không nhấc lên, không thêm bóng.
 */
const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md font-semibold',
    'transition-colors duration-(--dur-fast) ease-standard',
    'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'disabled:cursor-not-allowed',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        // V2.3: gradient dọc + viền cyan + chữ tối --on-primary (7,7:1), phản sáng trong và quầng nhẹ (AGENTS mục 5).
        // Rê chuột chỉ trượt gradient xuống một bậc cyan. Vô hiệu hoá thì bỏ gradient, về nền --border như mọi nút.
        primary: [
          'border border-primary-fill-border bg-linear-to-b from-primary-fill-from to-primary-fill-to text-on-primary shadow-primary-fill',
          'hover:from-primary-fill-hover-from hover:to-primary-fill-hover-to',
          'disabled:border-transparent disabled:bg-none disabled:bg-border disabled:text-text-disabled disabled:shadow-none',
        ],
        secondary:
          'border border-border bg-bg text-text hover:bg-surface disabled:border-none disabled:bg-border disabled:text-text-disabled',
        ghost:
          'border-none bg-transparent text-text hover:bg-surface disabled:bg-transparent disabled:text-text-disabled',
        danger:
          'border-none bg-danger text-white hover:bg-danger-hover disabled:bg-border disabled:text-text-disabled',
      },
      size: {
        /** Desktop — 40px */
        md: 'h-10 px-4 text-body [&_svg]:size-4',
        /** Tablet và điện thoại — 56px, chữ 16px, icon 20px */
        touch: 'h-14 px-5 text-body-lg [&_svg]:size-5',
        /** Nút chỉ có icon — 36px desktop */
        icon: 'size-9 px-0 [&_svg]:size-5',
        /** Nút chỉ có icon — 48px cảm ứng */
        iconTouch: 'size-12 px-0 [&_svg]:size-5',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      block: false,
    },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Giữ nguyên chiều rộng, thêm spinner 16px bên trái chữ */
    loading?: boolean
    asChild?: boolean
  }

export function Button({
  className,
  variant,
  size,
  block,
  loading = false,
  asChild = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  // Nút chính V2.3 chữ tối nên spinner tối; chỉ nút nguy hiểm còn chữ trắng
  const isLight = variant === 'danger'
  const classes = cn(buttonVariants({ variant, size, block }), className)

  // Slot của Radix yêu cầu đúng một phần tử con, nên khi asChild không chèn spinner.
  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <button
      className={classes}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner tone={isLight ? 'light' : 'dark'} /> : null}
      {children}
    </button>
  )
}

export { buttonVariants }
