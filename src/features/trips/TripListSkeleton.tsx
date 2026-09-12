import { Skeleton } from '@/components/ui/Skeleton'

/** Độ rộng cột "Tuyến" của từng dòng giữ chỗ, để không đều tăm tắp. */
const ROUTE_WIDTHS = ['90%', '70%', '100%', '60%', '80%', '85%']

const GRID = 'grid grid-cols-[110px_120px_minmax(0,1fr)_90px_120px_110px] items-center gap-4 px-4'

/** Bảng chuyến đang tải: tiêu đề thật, 6 dòng giữ chỗ chạy dải sáng. */
export function TripListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Đang tải danh sách chuyến">
      <div className="overflow-hidden rounded-md border border-border">
        <div className={`${GRID} h-9 border-b border-border bg-surface text-caption font-medium text-text-3`}>
          <span>Mã chuyến</span>
          <span>Biển số</span>
          <span>Tuyến</span>
          <span className="text-right">Điểm</span>
          <span>Lấp đầy</span>
          <span>Trạng thái</span>
        </div>
        {ROUTE_WIDTHS.map((width, index) => (
          <div key={index} className={`${GRID} h-11 border-b border-border last:border-b-0`}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-22" />
            <Skeleton className="h-3 max-w-full" style={{ width }} />
            <Skeleton className="h-3 w-6 justify-self-end" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-[22px] w-21 rounded-full" />
          </div>
        ))}
      </div>
      <p className="mt-3 text-caption text-text-3">Đang tải danh sách chuyến…</p>
    </div>
  )
}
