import * as SwitchPrimitive from '@radix-ui/react-switch'
import type { ComponentProps, ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Switch 36×20, núm 16px. Bật: nền primary, núm trượt sang 18px.
 * Theo mục 5 style sheet.
 */
export function Switch({
  className,
  label,
  id,
  disabled,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root> & { label?: ReactNode }) {
  const generatedId = useId()
  const switchId = id ?? generatedId

  return (
    <div className="flex items-center gap-3">
      <SwitchPrimitive.Root
        id={switchId}
        disabled={disabled}
        className={cn(
          'relative h-5 w-9 flex-none rounded-full',
          'transition-colors duration-150 ease-standard',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          'bg-switch-off data-[state=checked]:bg-primary',
          'disabled:cursor-not-allowed disabled:bg-border',
          className,
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'block size-4 rounded-full bg-bg shadow-[0_1px_2px_rgba(16,24,40,.2)]',
            'translate-x-0.5 transition-transform duration-150 ease-standard',
            'data-[state=checked]:translate-x-[18px]',
            'data-[disabled]:bg-surface data-[disabled]:shadow-none',
          )}
        />
      </SwitchPrimitive.Root>
      {label ? (
        <label
          htmlFor={switchId}
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
