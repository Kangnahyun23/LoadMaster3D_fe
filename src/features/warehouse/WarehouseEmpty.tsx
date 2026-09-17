import { EmptyState } from '@/components/EmptyState'
import { ExitActionButton, ExitIconButton } from '@/features/auth/ExitControl'
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
        <ExitIconButton screenHome="/kho" contextual="/chuyen" label={t('warehouse.exit')} iconClassName="size-7" />
      </header>
      <div className="grid flex-1 place-items-center p-6">
        <EmptyState
          // Mô tả của EmptyState là 14px; màn kho chạy trên tablet nên nâng mọi chữ lên 16px (mục 10)
          className="w-full max-w-160 [&_span]:text-body-lg"
          title={failed ? t('warehouse.loadErrorTitle') : t('warehouse.emptyTitle')}
          description={description}
          action={<ExitActionButton screenHome="/kho" contextual="/chuyen" label={t('warehouse.toTrips')} />}
        />
      </div>
    </div>
  )
}
