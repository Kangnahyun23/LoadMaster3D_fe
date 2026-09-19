import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Button } from '@/components/ui/Button'
import { useT } from '@/lib/i18n'
import { ErrorScreen } from './ErrorScreen'

/**
 * Màn lỗi chung: dùng cho cả route không tồn tại (404) lẫn lỗi bất ngờ khi render. Không hiện stack trace cho người dùng cuối.
 */
export function NotFoundPage() {
  const t = useT()
  const error = useRouteError()
  // Không có error nghĩa là component được dùng làm route bắt mọi đường dẫn lạ.
  const isNotFound = !error || (isRouteErrorResponse(error) && error.status === 404)
  const code = isRouteErrorResponse(error) ? String(error.status) : isNotFound ? '404' : t('notFound.errorCode')

  return (
    <ErrorScreen
      code={code}
      title={isNotFound ? t('notFound.title') : t('notFound.errorTitle')}
      description={isNotFound ? t('notFound.description') : t('notFound.errorDescription')}
      actions={
        <>
          <Button variant="primary" asChild>
            <Link to="/">{t('notFound.backHome')}</Link>
          </Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            {t('notFound.reload')}
          </Button>
        </>
      }
    />
  )
}
