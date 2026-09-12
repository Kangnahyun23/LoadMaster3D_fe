import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CircleCheck, Info, OctagonAlert, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { AuthProvider } from '@/features/auth/AuthProvider'

/**
 * Toast theo mục "Phản hồi" của bản design: thẻ trắng viền 1px, bóng --e2
 * (toast là lớp nổi), icon 20px màu ngữ nghĩa, tiêu đề 14px/500,
 * mô tả 12px, hành động dạng link, nút đóng 28px góc phải.
 */
const TOAST_CLASSES = {
  toast: 'flex w-95 max-w-[calc(100vw-32px)] items-start gap-3 rounded-md border border-border bg-bg p-4 font-sans shadow-e2',
  icon: 'mt-0.5 flex-none [&_svg]:size-5',
  content: 'flex min-w-0 flex-1 flex-col gap-0.5',
  title: 'text-body font-medium text-text',
  description: 'text-caption text-text-2',
  actionButton: '!mt-1.5 !h-auto !bg-transparent !p-0 !text-body !font-medium !text-primary',
  cancelButton: '!mt-1.5 !h-auto !bg-transparent !p-0 !text-body !font-medium !text-text-2',
  closeButton:
    '!static !order-last !ml-auto !size-7 !translate-x-0 !translate-y-0 !rounded-sm !border-0 !bg-transparent !text-text-3 hover:!bg-surface [&_svg]:size-4',
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </AuthProvider>
      <Toaster
        position="top-right"
        closeButton
        gap={12}
        offset={16}
        icons={{
          success: <CircleCheck className="text-success" strokeWidth={1.5} />,
          warning: <TriangleAlert className="text-warning" strokeWidth={1.5} />,
          error: <OctagonAlert className="text-danger" strokeWidth={1.5} />,
          info: <Info className="text-info" strokeWidth={1.5} />,
        }}
        toastOptions={{ unstyled: true, classNames: TOAST_CLASSES, duration: 5000 }}
      />
    </QueryClientProvider>
  )
}
