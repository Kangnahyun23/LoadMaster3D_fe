import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Button } from '@/components/ui/Button'
import { EmptyTripsIllustration } from '@/features/trips/EmptyTripsIllustration'
import { useT } from '@/lib/i18n'

/**
 * Màn lỗi chung: dùng cho cả route không tồn tại (404) lẫn lỗi bất ngờ khi
 * render. Không hiện stack trace cho người dùng cuối.
 *
 * Đây là màn không có dữ liệu nghiệp vụ nên được phép căn giữa và có hình
 * minh hoạ — xem ngoại lệ bố cục ở CLAUDE.md mục 5.
 */
export function NotFoundPage() {
  const t = useT()
  const error = useRouteError()
  // Không có error nghĩa là component được dùng làm route bắt mọi đường dẫn lạ.
  const isNotFound = !error || (isRouteErrorResponse(error) && error.status === 404)
  const code = isRouteErrorResponse(error)
    ? String(error.status)
    : isNotFound
      ? '404'
      : t('notFound.errorCode')

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-surface px-6 py-16">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-md bg-primary">
          <span className="h-3 w-4.5 rounded-xs border-2 border-t-4 border-white" />
        </span>
        <span className="text-h3 font-semibold tracking-[-0.01em]">LoadMaster</span>
      </div>

      <div className="flex w-full max-w-120 flex-col items-center gap-6 rounded-md border border-border bg-bg px-8 py-10 text-center">
        <EmptyTripsIllustration />

        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-body font-medium text-text-3">{code}</span>
          <h1 className="text-h1 font-semibold tracking-[-0.01em]">
            {isNotFound ? t('notFound.title') : t('notFound.errorTitle')}
          </h1>
          <p className="text-body text-pretty text-text-2">
            {isNotFound ? t('notFound.description') : t('notFound.errorDescription')}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="primary" asChild>
            <Link to="/chuyen">{t('notFound.backToTrips')}</Link>
          </Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            {t('notFound.reload')}
          </Button>
        </div>
      </div>
    </main>
  )
}
