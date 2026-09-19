import { createColumnHelper } from '@tanstack/react-table'
import { Plus, RotateCcw } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { FilterBar } from '@/components/FilterBar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useListUrlState } from '@/components/useListUrlState'
import { useCan } from '@/features/auth/useCan'
import type { Formatter } from '@/lib/format'
import { useFormat, useT, type TFunction } from '@/lib/i18n'
import { useVehicleStatesQuery, useVehiclesQuery } from './useVehiclesQuery'
import { filterVehicleRows, statusRank, vehicleRows, VEHICLE_STATUSES, VEHICLE_STATUS_SLUGS, type VehicleRow } from './vehicle-status'
import { VehicleStatusCell } from './VehicleStatusBadge'

const helper = createColumnHelper<BaseTableFeatures, VehicleRow>()
const mono = 'font-mono text-caption'
const STATUS_FILTER = 'trang-thai'

/** Cột phụ thuộc ngôn ngữ đang chọn (số và tiêu đề), nên dựng trong component chứ không ở module. */
function createColumns(t: TFunction, format: Formatter) {
  return helper.columns([
    helper.accessor('name', {
      header: t('fleet.columns.name'),
      enableSorting: true,
      cell: (info) => (
        <span className="block truncate">
          {/* Dòng mở trang bằng chuột; liên kết ở tên cho bàn phím (AGENTS mục 10). */}
          <Link
            to={`/doi-xe/${info.row.original.id}`}
            onClick={(event) => event.stopPropagation()}
            className="rounded-sm font-medium text-text hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {info.getValue()}
          </Link>{' '}
          <span className={`${mono} text-text-3`}>{info.row.original.id}</span>
        </span>
      ),
    }),
    helper.accessor((vehicle) => statusRank(vehicle.state.status), {
      id: 'status',
      header: t('fleet.columns.status'),
      enableSorting: true,
      // Bấm lần đầu: sẵn sàng trước, như thứ tự bộ lọc
      sortDescFirst: false,
      meta: { width: '250px' } satisfies ColumnMeta,
      cell: (info) => <VehicleStatusCell state={info.row.original.state} />,
    }),
    helper.accessor('innerLengthCm', {
      header: t('fleet.columns.inner'),
      enableSorting: true,
      meta: { align: 'right', width: '240px' } satisfies ColumnMeta,
      cell: (info) => {
        const vehicle = info.row.original
        return (
          <span className={mono}>
            {format.dimensions(vehicle.innerLengthCm, vehicle.innerWidthCm, vehicle.innerHeightCm)}
          </span>
        )
      },
    }),
    helper.accessor('maxPayloadKg', {
      header: t('fleet.columns.payload'),
      enableSorting: true,
      meta: { align: 'right', width: '140px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.weight(info.getValue())}</span>,
    }),
    helper.accessor('doorWidthCm', {
      header: t('fleet.columns.door'),
      meta: { align: 'right', width: '150px' } satisfies ColumnMeta,
      cell: (info) => (
        <span className={mono}>{format.widthByHeight(info.getValue(), info.row.original.doorHeightCm)}</span>
      ),
    }),
    helper.accessor((vehicle) => vehicle.obstacles.length, {
      id: 'obstacleCount',
      header: t('fleet.columns.obstacles'),
      meta: { align: 'right', width: '90px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.integer(info.getValue())}</span>,
    }),
  ])
}

/**
 * Đội xe — danh sách xe và trạng thái (LM-040, LM-089) đọc qua TanStack Query từ kho mock dùng chung (D-06).
 * Tìm bỏ dấu, lọc trạng thái, sắp xếp, phân trang; trạng thái lọc giữ trên URL (`?q=…&trang-thai=bao-duong`, D-52).
 * Bấm một dòng mở trang cấu hình xe.
 */
export function FleetPage() {
  const t = useT()
  const format = useFormat()
  const navigate = useNavigate()
  const canEdit = useCan()('fleet.edit')
  const vehiclesQuery = useVehiclesQuery()
  const statesQuery = useVehicleStatesQuery()
  const list = useListUrlState({ filters: [STATUS_FILTER], defaultSort: { id: 'name', desc: false } })
  const statusSlug = list.filters[STATUS_FILTER]

  const columns = useMemo(() => createColumns(t, format), [t, format])
  const vehicles = useMemo(() => vehicleRows(vehiclesQuery.data ?? [], statesQuery.data ?? []), [vehiclesQuery.data, statesQuery.data])
  const rows = useMemo(() => filterVehicleRows(vehicles, list.query, statusSlug), [vehicles, list.query, statusSlug])
  const statusOptions = VEHICLE_STATUSES.map((status) => ({ value: VEHICLE_STATUS_SLUGS[status], label: t(`fleet.status.${status}`) }))

  const isPending = vehiclesQuery.isPending || statesQuery.isPending
  const isError = vehiclesQuery.isError || statesQuery.isError

  function handleRetry() {
    void vehiclesQuery.refetch()
    void statesQuery.refetch()
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center justify-between gap-4 border-b border-border bg-bg px-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-h2 font-semibold">{t('fleet.title')}</h1>
          {vehiclesQuery.isSuccess ? (
            <span className="font-mono text-caption text-text-3">
              {t('fleet.count', { count: vehicles.length })}
            </span>
          ) : null}
        </div>
        {vehicles.length > 0 && canEdit ? (
          <Button variant="primary" asChild>
            <Link to="/doi-xe/moi">
              <Plus strokeWidth={1.5} />
              {t('fleet.add')}
            </Link>
          </Button>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        {isPending ? (
          <div className="flex items-center justify-center py-16" role="status" aria-label={t('fleet.loading')}>
            <Spinner />
          </div>
        ) : isError ? (
          <EmptyState
            title={t('fleet.error.title')}
            description={t('fleet.error.description')}
            action={
              <Button variant="secondary" onClick={handleRetry} loading={vehiclesQuery.isFetching || statesQuery.isFetching}>
                <RotateCcw strokeWidth={1.5} />
                {t('fleet.error.retry')}
              </Button>
            }
          />
        ) : vehicles.length === 0 ? (
          <EmptyState
            title={t('fleet.empty.title')}
            description={t('fleet.empty.description')}
            action={canEdit ? (
              <Button variant="primary" asChild>
                <Link to="/doi-xe/moi">
                  <Plus strokeWidth={1.5} />
                  {t('fleet.empty.action')}
                </Link>
              </Button>
            ) : undefined}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <FilterBar
              query={list.query}
              onQueryChange={list.setQuery}
              searchLabel={t('fleet.search')}
              fields={[{ kind: 'select', name: STATUS_FILTER, label: t('fleet.columns.status'), options: statusOptions }]}
              values={list.filters}
              onValueChange={list.setFilter}
              onClear={list.clearAll}
            />
            <div className="overflow-hidden rounded-md border border-border bg-bg">
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
                onRowClick={(vehicle) => void navigate(`/doi-xe/${vehicle.id}`)}
              />
            </div>
            <p className="text-caption text-text-3">{t('fleet.rowHint')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
