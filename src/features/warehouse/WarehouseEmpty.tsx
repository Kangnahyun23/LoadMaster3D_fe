import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { useT } from '@/lib/i18n'

/**
 * Màn kho khi không có phương án đã duyệt để xếp (LM-060) hoặc không tải được: giải thích phải Duyệt ở Planner trước,
 * có lối thoát 56px nhìn thấy được (mục 10). Không dựng phương án giả.
 */
export function WarehouseEmpty({ tripId, failed }: { tripId?: string; failed: boolean }) {
  const t = useT()
  const description = failed
    ? t('warehouse.loadErrorDescription')
    : tripId ? t('warehouse.emptyTripDescription', { tripId }) : t('warehouse.emptyDescription')

  return (
    <div className="flex h-dvh flex-col bg-bg text-body-lg">
      <header className="flex h-18 flex-none items-center border-b border-border pl-3">
        <Link
          to="/chuyen"
          aria-label={t('warehouse.exit')}
          className="grid size-14 place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronLeft className="size-7" strokeWidth={2} aria-hidden />
        </Link>
      </header>
      <div className="grid flex-1 place-items-center p-6">
        <EmptyState
          // Mô tả của EmptyState là 14px; màn kho chạy trên tablet nên nâng mọi chữ lên 16px (mục 10)
          className="w-full max-w-160 [&_span]:text-body-lg"
          title={failed ? t('warehouse.loadErrorTitle') : t('warehouse.emptyTitle')}
          description={description}
          action={
            <Button variant="primary" size="touch" asChild>
              <Link to="/chuyen">{t('warehouse.toTrips')}</Link>
            </Button>
          }
        />
      </div>
    </div>
  )
}
