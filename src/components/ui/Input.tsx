import type { ComponentProps, ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Ô nhập theo mục 5 style sheet.
 * Cao 40px, viền 1px, radius 8px. Focus: viền primary + vòng 2px ngoài.
 * Nhãn 14px/500 phía trên, gợi ý hoặc lỗi 12px phía dưới.
 */
const fieldRing =
  'focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

type InputProps = Omit<ComponentProps<'input'>, 'size'> & {
  label?: ReactNode
  /** Gợi ý dưới ô nhập */
  hint?: ReactNode
  /** Thông báo lỗi — thay chỗ gợi ý và đổi viền sang danger */
  error?: ReactNode
  required?: boolean
  /** Số dùng mono, canh phải */
  numeric?: boolean
  /** Hậu tố đơn vị: kg, m³, mm… */
  suffix?: ReactNode
}

export function Input({
  className,
  label,
  hint,
  error,
  required,
  numeric = false,
  suffix,
  id,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedById = `${inputId}-mo-ta`
  const invalid = Boolean(error)

  const control = (
    <input
      id={inputId}
      aria-invalid={invalid || undefined}
      aria-describedby={hint || error ? describedById : undefined}
      className={cn(
        'h-10 w-full min-w-0 rounded-md border bg-bg px-3 text-body text-text outline-none',
        'placeholder:text-text-3',
        'disabled:bg-surface disabled:text-text-disabled',
        numeric && 'text-right font-mono',
        invalid ? 'border-danger' : 'border-border',
        !suffix && fieldRing,
        suffix && 'h-auto border-none bg-transparent px-0 focus-visible:outline-none',
        className,
      )}
      {...props}
    />
  )

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-body font-medium text-text">
          {label}
          {required ? <span className="text-danger"> *</span> : null}
        </label>
      ) : null}

      {suffix ? (
        <div
          className={cn(
            'flex h-10 items-center gap-2 rounded-md border bg-bg px-3',
            invalid ? 'border-danger' : 'border-border',
            'focus-within:border-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary',
          )}
        >
          {control}
          <span className="shrink-0 text-body text-text-3">{suffix}</span>
        </div>
      ) : (
        control
      )}

      {error ? (
        <span id={describedById} className="text-caption text-danger">
          {error}
        </span>
      ) : hint ? (
        <span id={describedById} className="text-caption text-text-3">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
