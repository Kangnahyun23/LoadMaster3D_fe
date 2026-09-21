import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Hộp thoại theo bản design: rộng 640px, radius 12px, bóng --e3,
 * lớp phủ rgba(17,24,39,.45). Modal mở 220ms standard (mục 8 AGENTS.md).
 */
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-300 grid place-items-center overflow-y-auto p-6',
          'bg-[rgb(17_24_39_/_0.45)]',
          'data-[state=open]:animate-[lm-fade-in_220ms_var(--ease-standard)]',
        )}
      >
        <DialogPrimitive.Content
          className={cn(
            'flex w-160 max-w-full flex-col overflow-hidden rounded-lg bg-bg shadow-e3',
            'outline-none',
            'data-[state=open]:animate-[lm-dialog-in_220ms_var(--ease-standard)]',
            className,
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  )
}

/** Chân hộp thoại: đường kẻ trên, hành động trái/phải. */
export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mt-1 flex items-center justify-between gap-3 border-t border-border px-7 pt-4 pb-5',
        className,
      )}
      {...props}
    />
  )
}
