import { Plus } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { FilterBar, type FilterField } from '@/components/FilterBar'
import { Button } from '@/components/ui/Button'
import { useListUrlState } from '@/components/useListUrlState'
import { useCan } from '@/features/auth/useCan'
import { useFormat, useT } from '@/lib/i18n'
import { EmptyTripsIllustration } from './EmptyTripsIllustration'
import { FILTERABLE_STATUSES, filterTripRows, TRIP_LIST_FILTERS, tripFilterOptions, UNASSIGNED_DRIVER, type TripListFilter, type TripRow } from './trip-list'
import { createTripColumns } from './trip-list-columns'
import { TripListSkeleton } from './TripListSkeleton'
import { useTripsQuery } from './useTripsQuery'

const NO_ROWS: TripRow[] = []

/**
 * Danh sách chuyến (LM-053, LM-088): đọc kho qua `useTripsQuery`; tìm bỏ dấu, lọc trạng thái / khoảng ngày chạy / xe / tài xế,
 * sắp xếp (mặc định ngày chạy mới nhất trước) và phân trang, giữ trên URL (D-52).
 */
export function TripListPage() {
  const navigate = useNavigate()
  const t = useT()
  const format = useFormat()
  const canCreate = useCan()('trips.edit')
  const query = useTripsQuery()
  const list = useListUrlState({ filters: TRIP_LIST_FILTERS, defaultSort: { id: 'scheduledDate', desc: true } })
  const columns = useMemo(() => createTripColumns(t, format), [t, format])
  const trips = query.data ?? NO_ROWS
  const rows = useMemo(() => filterTripRows(trips, list.query, list.filters), [trips, list.query, list.filters])
  const fields = useMemo<FilterField<TripListFilter>[]>(() => {
    const { vehicles, drivers } = tripFilterOptions(trips)
    return [
      { kind: 'select', name: 'trang-thai', label: t('trips.list.status'), options: FILTERABLE_STATUSES.map((status) => ({ value: status, label: t(`status.${status}`) })) },
      { kind: 'dateRange', label: t('trips.list.date'), from: 'tu', to: 'den' },
      { kind: 'select', name: 'xe', label: t('trips.list.vehicle'), options: vehicles },
      { kind: 'select', name: 'tai-xe', label: t('trips.list.driver'), options: [{ value: UNASSIGNED_DRIVER, label: t('trips.list.unassigned') }, ...drivers] },
    ]
  }, [trips, t])
  const hasTrips = trips.length > 0

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center justify-between gap-4 border-b border-border bg-chrome px-6">
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

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-6">
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
          <>
            <FilterBar
              query={list.query}
              onQueryChange={list.setQuery}
              searchLabel={t('trips.list.search')}
              fields={fields}
              values={list.filters}
              onValueChange={list.setFilter}
              onClear={list.clearAll}
            />
            {/* Màn điều phối là màn desktop (AGENTS mục 5): khung hẹp hơn bảng thì cuộn ngang trong khung, không bóp cột */}
            <div className="overflow-x-auto rounded-md border border-border bg-bg">
              <div className="min-w-285">
                <DataTable
                  data={rows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  density="comfortable"
                  sorting={list.sorting}
                  onSortingChange={list.setSorting}
                  pagination={{ pageIndex: list.pageIndex, pageSize: list.pageSize, onPageChange: list.setPage, onPageSizeChange: list.setPageSize }}
                  isFiltering={list.isFiltering}
                  onClearFilters={list.clearAll}
                  onRowClick={(trip) => void navigate(`/chuyen/${trip.id}`)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
