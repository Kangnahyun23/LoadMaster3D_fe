import type { ComponentProps, ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Ô nhập nhiều dòng. Cùng luật với Input: viền 1px, radius 8px,
 * focus viền primary + vòng 2px ngoài.
 */
type TextareaProps = ComponentProps<'textarea'> & {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
}

export function Textarea({
  className,
  label,
  hint,
  error,
  id,
  rows = 3,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const describedById = `${fieldId}-mo-ta`
  const invalid = Boolean(error)

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={fieldId} className="text-body font-medium text-text">
          {label}
        </label>
      ) : null}

      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={invalid || undefined}
        aria-describedby={hint || error ? describedById : undefined}
        className={cn(
          'w-full resize-y rounded-md border bg-bg px-3 py-2 text-body text-text outline-none',
          'placeholder:text-text-3',
          'focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          'disabled:bg-surface disabled:text-text-disabled',
          invalid ? 'border-danger' : 'border-border',
          className,
        )}
        {...props}
      />

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
