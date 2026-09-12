import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import type { ComponentProps, ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Radio 18px tròn, chấm trong 10px màu primary khi chọn.
 * Theo mục 5 style sheet.
 */
export function RadioGroup({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      className={cn('flex flex-col gap-3', className)}
      {...props}
    />
  )
}

export function RadioGroupItem({
  className,
  label,
  id,
  disabled,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item> & { label?: ReactNode }) {
  const generatedId = useId()
  const itemId = id ?? generatedId

  return (
    <div className="flex items-center gap-2.5">
      <RadioGroupPrimitive.Item
        id={itemId}
        disabled={disabled}
        className={cn(
          'grid size-4.5 flex-none place-items-center rounded-full border bg-bg',
          'transition-colors duration-(--dur-fast) ease-standard',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          'border-text-disabled data-[state=checked]:border-primary',
          'disabled:cursor-not-allowed disabled:border-border disabled:bg-surface',
          className,
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-primary" />
      </RadioGroupPrimitive.Item>
      {label ? (
        <label
          htmlFor={itemId}
          className={cn(
            'cursor-pointer text-body',
            disabled ? 'cursor-not-allowed text-text-disabled' : 'text-text',
          )}
        >
          {label}
        </label>
      ) : null}
    </div>
  )
}
