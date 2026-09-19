import { createColumnHelper } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCan } from '@/features/auth/useCan'
import { useFormat, useT, type TFunction } from '@/lib/i18n'
import { EmptyTripsIllustration } from './EmptyTripsIllustration'
import type { TripRow } from './trip-list'
import { TripListSkeleton } from './TripListSkeleton'
import { useTripsQuery } from './useTripsQuery'

const helper = createColumnHelper<BaseTableFeatures, TripRow>()
const mono = 'font-mono text-caption'

function createColumns(t: TFunction, format: ReturnType<typeof useFormat>) {
  return helper.columns([
    helper.accessor('id', {
      header: t('trips.list.id'),
      meta: { width: '150px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{info.getValue()}</span>,
    }),
    helper.accessor('name', {
      header: t('trips.list.name'),
      cell: (info) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{info.getValue()}</span>
          <span className="truncate text-caption text-text-3">{info.row.original.route}</span>
        </span>
      ),
    }),
    helper.accessor('vehicleName', {
      header: t('trips.list.vehicle'),
      meta: { width: '220px' } satisfies ColumnMeta,
      cell: (info) => <span className="block truncate">{info.getValue()}</span>,
    }),
    helper.accessor('stopCount', {
      header: t('trips.list.stops'),
      meta: { align: 'right', width: '72px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.integer(info.getValue())}</span>,
    }),
    helper.accessor('packageCount', {
      header: t('trips.list.packages'),
      meta: { align: 'right', width: '80px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.integer(info.getValue())}</span>,
    }),
    helper.accessor('volumePercent', {
      header: t('trips.list.volume'),
      meta: { width: '160px' } satisfies ColumnMeta,
      cell: (info) => {
        const value = info.getValue()
        if (value === null) return <span className="text-caption text-text-3">{t('trips.list.notOptimized')}</span>
        return (
          <span className="flex items-center gap-2">
            <ProgressBar value={value} className="w-20" />
            <span className={mono}>{format.percent(value)}</span>
          </span>
        )
      },
    }),
    helper.accessor('status', {
      header: t('trips.list.status'),
      meta: { width: '140px' } satisfies ColumnMeta,
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
  ])
}

/**
 * Danh sách chuyến của dispatcher (LM-053): đọc kho qua `useTripsQuery`, ba trạng thái đang tải, rỗng, có dữ liệu.
 * Mỗi dòng chỉ gồm số có trong kho — không ngày chạy hay trạng thái giao hàng khi kho chưa lưu chúng.
 */
export function TripListPage() {
  const navigate = useNavigate()
  const t = useT()
  const format = useFormat()
  const canCreate = useCan()('trips.edit')
  const query = useTripsQuery()
  const columns = useMemo(() => createColumns(t, format), [t, format])
  const trips = query.data ?? []
  const hasTrips = trips.length > 0

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center justify-between gap-4 border-b border-border bg-bg px-6">
        <h1 className="text-h2 font-semibold">{t('trips.list.title')}</h1>
        {hasTrips && canCreate ? (
          <Button variant="primary" className="h-9 px-3.5" asChild>
            <Link to="/chuyen/moi">
              <Plus strokeWidth={1.5} />
              {t('trips.list.create')}
            </Link>
          </Button>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        {query.isPending ? (
          <TripListSkeleton />
        ) : query.isError ? (
          <p role="alert" className="text-body text-danger">{t('trips.list.loadError')}</p>
        ) : !hasTrips ? (
          <EmptyState
            illustration={<EmptyTripsIllustration />}
            title={t('trips.list.emptyTitle')}
            description={t('trips.list.emptyDescription')}
            action={canCreate ? (
              <Button variant="primary" asChild>
                <Link to="/chuyen/moi">
                  <Plus strokeWidth={1.5} />
                  {t('trips.list.createFirst')}
                </Link>
              </Button>
            ) : undefined}
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
