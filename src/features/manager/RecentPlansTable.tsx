import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { useFormat, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { DashboardPlan } from './dashboard-summary'
import { plannerPath } from '@/lib/planner-path'

const helper = createColumnHelper<BaseTableFeatures, DashboardPlan>()

const mono = 'font-mono text-caption'

/** Bảng kế hoạch gần đây: mỗi dòng là một job đã lưu, tên chuyến dẫn thẳng sang Planner của revision đó. */
export function RecentPlansTable({ plans }: { plans: DashboardPlan[] }) {
  const t = useT()
  const format = useFormat()

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor('tripName', {
          header: t('manager.recent.trip'),
          cell: (info) => (
            <Link
              to={plannerPath(info.row.original)}
              className="block truncate font-medium text-primary"
            >
              {info.getValue()}{' '}
              <span className={cn(mono, 'font-normal text-text-3')}>{info.row.original.tripId}</span>
            </Link>
          ),
        }),
        helper.accessor('createdAt', {
          header: t('manager.recent.createdAt'),
          meta: { width: '170px' } satisfies ColumnMeta,
          cell: (info) => (
            <span className={cn(mono, 'text-text-2')}>
              {t('manager.dateTime', {
                time: format.time(info.getValue()),
                date: format.date(info.getValue()),
              })}
            </span>
          ),
        }),
        helper.accessor('method', {
          header: t('manager.recent.method'),
          meta: { width: '120px' } satisfies ColumnMeta,
          cell: (info) => <span className={mono}>{info.getValue()}</span>,
        }),
        helper.accessor('volumeUtilizationPercent', {
          header: t('manager.recent.volume'),
          meta: { align: 'right', width: '110px' } satisfies ColumnMeta,
          cell: (info) => <span className={mono}>{format.percent(info.getValue())}</span>,
        }),
        helper.accessor('placedCount', {
          header: t('manager.recent.placed'),
          meta: { align: 'right', width: '130px' } satisfies ColumnMeta,
          cell: (info) => <span className={mono}>{format.integer(info.getValue())}</span>,
        }),
      ]),
    [t, format],
  )

  return (
    <DataTable
      data={plans}
      columns={columns}
      density="comfortable"
      emptyMessage={t('manager.recent.empty')}
    />
  )
}
