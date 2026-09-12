import { createColumnHelper } from '@tanstack/react-table'
import { FileUp, Plus } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatDecimal, formatInteger } from '@/lib/format'
import { notifyPendingFeature } from '@/lib/pending-feature'
import { EmptyTripsIllustration } from './EmptyTripsIllustration'
import type { TripSummary } from './trip-list.mock'
import { TripListSkeleton } from './TripListSkeleton'
import { useTripsQuery } from './useTripsQuery'

const helper = createColumnHelper<BaseTableFeatures, TripSummary>()
const mono = 'font-mono text-caption'

const columns = helper.columns([
  helper.accessor('id', {
    header: 'Mã chuyến',
    meta: { width: '140px' } satisfies ColumnMeta,
    cell: (info) => <span className={mono}>{info.getValue()}</span>,
  }),
  helper.accessor('plate', {
    header: 'Biển số',
    meta: { width: '220px' } satisfies ColumnMeta,
    cell: (info) => (
      <span className={`block truncate ${mono}`}>
        {info.getValue()} <span className="text-text-3">{info.row.original.truck}</span>
      </span>
    ),
  }),
  helper.accessor('route', {
    header: 'Tuyến',
    cell: (info) => <span className="block truncate">{info.getValue()}</span>,
  }),
  helper.accessor('stopCount', {
    header: 'Điểm',
    meta: { align: 'right', width: '80px' } satisfies ColumnMeta,
    cell: (info) => <span className={mono}>{formatInteger(info.getValue())}</span>,
  }),
  helper.accessor('fillRate', {
    header: 'Lấp đầy',
    meta: { width: '160px' } satisfies ColumnMeta,
    cell: (info) => {
      const value = info.getValue()
      if (value === null) return <span className="text-caption text-text-3">Chưa tối ưu</span>
      return (
        <span className="flex items-center gap-2">
          <ProgressBar value={value} className="w-20" />
          <span className={mono}>{formatDecimal(value)}%</span>
        </span>
      )
    },
  }),
  helper.accessor('status', {
    header: 'Trạng thái',
    meta: { width: '150px' } satisfies ColumnMeta,
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
])

/**
 * Danh sách chuyến của dispatcher, ba trạng thái: đang tải (skeleton),
 * rỗng, có dữ liệu. Thêm `?rong` vào URL để xem trạng thái rỗng.
 */
export function TripListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = useTripsQuery({ empty: searchParams.has('rong') })
  const trips = query.data ?? []
  const hasTrips = trips.length > 0

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center justify-between gap-4 border-b border-border bg-bg px-6">
        <h1 className="text-h2 font-semibold">Chuyến hàng</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="h-9 px-3.5"
            onClick={() =>
              notifyPendingFeature('Nhập chuyến từ Excel', 'Cần dịch vụ đọc file phía máy chủ.')
            }
          >
            <FileUp strokeWidth={1.5} />
            Nhập từ Excel
          </Button>
          {hasTrips ? (
            <Button variant="primary" className="h-9 px-3.5" asChild>
              <Link to="/chuyen/moi">
                <Plus strokeWidth={1.5} />
                Tạo chuyến
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        {query.isPending ? (
          <TripListSkeleton />
        ) : !hasTrips ? (
          <EmptyState
            illustration={<EmptyTripsIllustration />}
            title="Chưa có chuyến hàng nào"
            description="Tạo chuyến, thêm đơn hàng rồi chạy tối ưu để nhận phương án xếp hàng 3D."
            action={
              <Button variant="primary" asChild>
                <Link to="/chuyen/moi">
                  <Plus strokeWidth={1.5} />
                  Tạo chuyến đầu tiên
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-md border border-border bg-bg">
            <DataTable
              data={trips}
              columns={columns}
              density="comfortable"
              onRowClick={(trip) => void navigate(`/chuyen/${trip.id}`)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
