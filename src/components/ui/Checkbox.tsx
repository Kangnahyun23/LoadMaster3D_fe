import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Checkbox 18px, radius 4px. Chọn: nền primary, dấu tích trắng stroke 3.
 * Theo mục 5 style sheet.
 */
export function Checkbox({
  className,
  label,
  id,
  disabled,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root> & { label?: ReactNode }) {
  const generatedId = useId()
  const boxId = id ?? generatedId

  return (
    <div className="flex items-center gap-2.5">
      <CheckboxPrimitive.Root
        id={boxId}
        disabled={disabled}
        className={cn(
          'grid size-4.5 flex-none place-items-center rounded-xs border',
          'transition-colors duration-(--dur-fast) ease-standard',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          'border-text-disabled bg-bg',
          'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
          'disabled:cursor-not-allowed disabled:border-border disabled:bg-surface',
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          <Check className="size-3 text-white" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label ? (
        <label
          htmlFor={boxId}
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
