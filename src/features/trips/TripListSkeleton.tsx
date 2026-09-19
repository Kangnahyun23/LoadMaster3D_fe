import { Skeleton } from '@/components/ui/Skeleton'
import { useT } from '@/lib/i18n'

/** Độ rộng cột "Chuyến và tuyến" của từng dòng giữ chỗ, để không đều tăm tắp. */
const ROUTE_WIDTHS = ['90%', '70%', '100%', '60%', '80%', '85%']

const GRID = 'grid grid-cols-[88px_120px_minmax(0,1fr)_150px_130px_110px_110px] items-center gap-4 px-4'

/** Bảng chuyến đang tải: tiêu đề thật theo cột của danh sách (LM-088), 6 dòng giữ chỗ chạy dải sáng. */
export function TripListSkeleton() {
  const t = useT()
  return (
    <div aria-busy="true" aria-label={t('trips.skeleton.loading')}>
      <div className="overflow-hidden rounded-md border border-border">
        <div className={`${GRID} h-9 border-b border-border bg-surface text-caption font-medium text-text-3`}>
          <span>{t('trips.skeleton.date')}</span>
          <span>{t('trips.skeleton.id')}</span>
          <span>{t('trips.skeleton.route')}</span>
          <span>{t('trips.skeleton.vehicle')}</span>
          <span>{t('trips.skeleton.driver')}</span>
          <span>{t('trips.skeleton.fill')}</span>
          <span>{t('trips.skeleton.status')}</span>
        </div>
        {ROUTE_WIDTHS.map((width, index) => (
          <div key={index} className={`${GRID} h-12 border-b border-border last:border-b-0`}>
            <Skeleton className="h-3 w-18" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 max-w-full" style={{ width }} />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-5.5 w-21 rounded-full" />
          </div>
        ))}
      </div>
      <p className="mt-3 text-caption text-text-3">{t('trips.skeleton.loadingText')}</p>
    </div>
  )
}
