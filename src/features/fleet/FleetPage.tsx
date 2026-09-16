import { createColumnHelper } from '@tanstack/react-table'
import { Plus, RotateCcw } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { VehicleConfig } from '@/domain/models'
import type { Formatter } from '@/lib/format'
import { useFormat, useT, type TFunction } from '@/lib/i18n'
import { useVehiclesQuery } from './useVehiclesQuery'

const helper = createColumnHelper<BaseTableFeatures, VehicleConfig>()
const mono = 'font-mono text-caption'

/** Cột phụ thuộc ngôn ngữ đang chọn (số và tiêu đề), nên dựng trong component chứ không ở module. */
function createColumns(t: TFunction, format: Formatter) {
  return helper.columns([
    helper.accessor('name', {
      header: t('fleet.columns.name'),
      cell: (info) => (
        <span className="block truncate">
          {info.getValue()} <span className={`${mono} text-text-3`}>{info.row.original.id}</span>
        </span>
      ),
    }),
    helper.accessor('innerLengthCm', {
      header: t('fleet.columns.inner'),
      meta: { align: 'right', width: '230px' } satisfies ColumnMeta,
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
      meta: { align: 'right', width: '130px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.weight(info.getValue())}</span>,
    }),
    helper.accessor('doorWidthCm', {
      header: t('fleet.columns.door'),
      meta: { align: 'right', width: '160px' } satisfies ColumnMeta,
      cell: (info) => (
        <span className={mono}>{format.widthByHeight(info.getValue(), info.row.original.doorHeightCm)}</span>
      ),
    }),
    helper.accessor((vehicle) => vehicle.obstacles.length, {
      id: 'obstacleCount',
      header: t('fleet.columns.obstacles'),
      meta: { align: 'right', width: '100px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.integer(info.getValue())}</span>,
    }),
  ])
}

/**
 * Đội xe — danh sách xe đọc qua TanStack Query từ kho mock dùng chung (D-06, LM-040).
 * Bấm một dòng mở trang cấu hình xe; không giữ dữ liệu ở `useState` nữa.
 */
export function FleetPage() {
  const t = useT()
  const format = useFormat()
  const navigate = useNavigate()
  const query = useVehiclesQuery()
  const columns = useMemo(() => createColumns(t, format), [t, format])
  const vehicles = query.data ?? []

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center justify-between gap-4 border-b border-border bg-bg px-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-h2 font-semibold">{t('fleet.title')}</h1>
          {query.isSuccess ? (
            <span className="font-mono text-caption text-text-3">
              {t('fleet.count', { count: vehicles.length })}
            </span>
          ) : null}
        </div>
        {vehicles.length > 0 ? (
          <Button variant="primary" asChild>
            <Link to="/doi-xe/moi">
              <Plus strokeWidth={1.5} />
              {t('fleet.add')}
            </Link>
          </Button>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        {query.isPending ? (
          <div className="flex items-center justify-center py-16" role="status" aria-label={t('fleet.loading')}>
            <Spinner />
          </div>
        ) : query.isError ? (
          <EmptyState
            title={t('fleet.error.title')}
            description={t('fleet.error.description')}
            action={
              <Button variant="secondary" onClick={() => void query.refetch()} loading={query.isFetching}>
                <RotateCcw strokeWidth={1.5} />
                {t('fleet.error.retry')}
              </Button>
            }
          />
        ) : vehicles.length === 0 ? (
          <EmptyState
            title={t('fleet.empty.title')}
            description={t('fleet.empty.description')}
            action={
              <Button variant="primary" asChild>
                <Link to="/doi-xe/moi">
                  <Plus strokeWidth={1.5} />
                  {t('fleet.empty.action')}
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-md border border-border bg-bg">
              <DataTable
                data={vehicles}
                columns={columns}
                density="comfortable"
                onRowClick={(vehicle) => void navigate(`/doi-xe/${vehicle.id}`)}
              />
            </div>
            <p className="mt-3 text-caption text-text-3">{t('fleet.rowHint')}</p>
          </>
        )}
      </div>
    </div>
  )
}
