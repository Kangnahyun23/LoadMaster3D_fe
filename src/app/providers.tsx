import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CircleCheck, Info, OctagonAlert, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { I18nProvider } from '@/lib/i18n'

/**
 * Toast V2.3 (`.toast`, `TrangThaiChung.jpg`): thẻ trắng bo 14px, không viền, bóng `--e2` (toast là lớp nổi); ô icon 30px tô theo
 * nghĩa, tiêu đề 14/600, mô tả 13px, hành động dạng link, nút đóng 28px góc phải.
 */
const TOAST_CLASSES = {
  toast: 'flex w-95 max-w-[calc(100vw-32px)] items-start gap-3 rounded-lg bg-bg p-3.5 font-sans shadow-e2',
  icon: 'flex-none',
  content: 'flex min-w-0 flex-1 flex-col gap-0.5 pt-1',
  title: 'text-body font-semibold text-ink-strong',
  description: 'text-small text-ink-2',
  actionButton: '!mt-1.5 !h-auto !bg-transparent !p-0 !text-body !font-semibold !text-primary',
  cancelButton: '!mt-1.5 !h-auto !bg-transparent !p-0 !text-body !font-medium !text-text-2',
  closeButton:
    '!static !order-last !ml-auto !size-7 !translate-x-0 !translate-y-0 !rounded-sm !border-0 !bg-transparent !text-n-600 hover:!bg-n-50 [&_svg]:size-4',
}

/** Ô icon 30px của toast, tô theo nghĩa như ô icon của hộp thoại. */
function ToastIcon({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`grid size-7.5 place-items-center rounded-md [&_svg]:size-4 ${tone}`}>{children}</span>
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

  // Ngôn ngữ bọc ngoài cùng: đổi ngôn ngữ chỉ render lại chữ, không dựng lại
  // router hay cache query nên không mất dữ liệu đang nhập.
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </AuthProvider>
        <Toaster
          position="top-right"
          closeButton
          gap={12}
          // Dưới cả hai dải chrome: thanh điều hướng ngang 56 px + thanh tiêu đề màn 72 px = 128. Trước đây là 80 vì
          // điều hướng nằm dọc bên trái nên chỉ phải tránh thanh tiêu đề. Rê chuột lên toast làm nó dừng đếm giờ, nên
          // toast đè nút hành động góc phải header thì người dùng không bấm được nút cho tới khi đóng toast (LM-101).
          offset={{ top: 136, right: 16 }}
          mobileOffset={{ top: 136, right: 16, left: 16 }}
          icons={{
            success: <ToastIcon tone="bg-green-50 text-green-700"><CircleCheck strokeWidth={1.75} /></ToastIcon>,
            warning: <ToastIcon tone="bg-amber-50 text-amber-700"><TriangleAlert strokeWidth={1.75} /></ToastIcon>,
            error: <ToastIcon tone="bg-red-50 text-red-700"><OctagonAlert strokeWidth={1.75} /></ToastIcon>,
            info: <ToastIcon tone="bg-cyan-50 text-cyan-700"><Info strokeWidth={1.75} /></ToastIcon>,
          }}
          toastOptions={{ unstyled: true, classNames: TOAST_CLASSES, duration: 5000 }}
        />
      </QueryClientProvider>
    </I18nProvider>
  )
}
