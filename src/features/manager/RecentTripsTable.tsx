import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { Card } from '@/components/ui/Card'
import type { Formatter } from '@/lib/format'
import { useFormat, useT, type TFunction } from '@/lib/i18n'
import { plannerPath } from '@/lib/planner-path'
import { cn } from '@/lib/utils'
import type { DashboardTripRow } from './dashboard-summary'

/** Số chuyến hiện trong bảng; báo cáo .xlsx có đủ mọi chuyến của kỳ. */
export const RECENT_TRIP_LIMIT = 10

const helper = createColumnHelper<BaseTableFeatures, DashboardTripRow>()
const mono = 'font-mono text-caption'

/** Tiêu đề, nhãn trạng thái và số theo ngôn ngữ đang chọn, nên dựng trong component. */
function createColumns(t: TFunction, format: Formatter) {
  return helper.columns([
    // Tên tuyến và tên xe xuống dòng trong hàng 48 px thay vì cắt bằng dấu ba chấm ở 1.366 px (LM-095); mã chuyến ở dòng dưới
    helper.accessor('name', {
      header: t('manager.recent.trip'),
      cell: (info) => (
        <Link to={`/chuyen/${encodeURIComponent(info.row.original.id)}`} className="flex flex-col font-medium whitespace-normal text-primary">
          <span className="line-clamp-1">{info.getValue()}</span>{' '}
          <span className={cn(mono, 'font-normal text-text-3')}>{info.row.original.id}</span>
        </Link>
      ),
    }),
    helper.accessor('scheduledDate', {
      header: t('manager.recent.date'),
      meta: { width: '120px' } satisfies ColumnMeta,
      cell: (info) => <span className={cn(mono, 'text-text-2')}>{format.date(info.getValue())}</span>,
    }),
    helper.accessor('vehicleName', {
      header: t('manager.recent.vehicle'),
      meta: { width: '220px' } satisfies ColumnMeta,
      cell: (info) => <span className="line-clamp-2 whitespace-normal">{info.getValue()}</span>,
    }),
    helper.accessor('status', {
      header: t('manager.recent.status'),
      meta: { width: '150px' } satisfies ColumnMeta,
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    helper.accessor('volumePercent', {
      header: t('manager.recent.volume'),
      meta: { align: 'right', width: '96px' } satisfies ColumnMeta,
      cell: (info) => {
        const value = info.getValue()
        return <span className={mono}>{value === null ? t('manager.noValue') : format.percent(value)}</span>
      },
    }),
    helper.accessor('deliveredWeightKg', {
      header: t('manager.recent.delivered'),
      meta: { align: 'right', width: '120px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{info.getValue() > 0 ? format.weight(info.getValue()) : t('manager.noValue')}</span>,
    }),
    helper.accessor('plan', {
      header: t('manager.recent.plan'),
      meta: { width: '136px' } satisfies ColumnMeta,
      cell: (info) => {
        const plan = info.getValue()
        return plan ? (
          <Link to={plannerPath(plan)} aria-label={t('manager.recent.openPlanFor', { name: info.row.original.name })} className="font-medium text-primary">
            {t('manager.recent.openPlan')}
          </Link>
        ) : null
      },
    }),
  ])
}

/** Chuyến có ngày chạy gần nhất trong kỳ: tên dẫn tới chi tiết chuyến, cột cuối mở phương án trong Planner. */
export function RecentTripsTable({ trips }: { trips: readonly DashboardTripRow[] }) {
  const t = useT()
  const format = useFormat()
  const columns = useMemo(() => createColumns(t, format), [t, format])
  const rows = useMemo(() => trips.slice(0, RECENT_TRIP_LIMIT), [trips])

  return (
    <Card className="flex flex-none flex-col overflow-hidden">
      <div className="flex h-11 flex-none items-center gap-2 border-b border-border px-4">
        <h2 className="text-body font-medium">{t('manager.recent.title')}</h2>
        <span className="text-caption text-text-3">{t('manager.recent.subtitle', { count: RECENT_TRIP_LIMIT })}</span>
      </div>
      <DataTable data={rows} columns={columns} density="comfortable" />
    </Card>
  )
}
