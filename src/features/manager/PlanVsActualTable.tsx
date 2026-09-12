import { createColumnHelper } from '@tanstack/react-table'
import {
  DataTable,
  type BaseTableFeatures,
  type ColumnMeta,
} from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDecimal } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PlanVsActualRow } from './dashboard.mock'
import { PLAN_VS_ACTUAL } from './dashboard.mock'

const helper = createColumnHelper<BaseTableFeatures, PlanVsActualRow>()

const mono = 'font-mono text-caption'

/** Lệch quá 3 điểm phần trăm so với kế hoạch thì tô màu cảnh báo. */
const ACTUAL_WARNING_THRESHOLD = -3
/** Từ 3 kiện sai trở lên thì tô màu cảnh báo. */
const DEVIATION_WARNING_THRESHOLD = 3

const columns = helper.columns([
  helper.accessor('id', {
    header: 'Mã chuyến',
    meta: { width: '130px' } satisfies ColumnMeta,
    cell: (info) => <span className={mono}>{info.getValue()}</span>,
  }),
  helper.accessor('date', {
    header: 'Ngày',
    meta: { width: '110px' } satisfies ColumnMeta,
    cell: (info) => (
      <span className={cn(mono, 'text-text-2')}>{info.getValue()}</span>
    ),
  }),
  helper.accessor('truck', {
    header: 'Xe',
    cell: (info) => (
      <span className="block truncate">
        {info.getValue()}{' '}
        <span className={cn(mono, 'text-text-3')}>
          {info.row.original.plate}
        </span>
      </span>
    ),
  }),
  helper.accessor('plan', {
    header: 'Lấp đầy kế hoạch',
    meta: { align: 'right', width: '150px' } satisfies ColumnMeta,
    cell: (info) => (
      <span className={mono}>{formatDecimal(info.getValue())}%</span>
    ),
  }),
  helper.accessor('actual', {
    header: 'Lấp đầy thực tế',
    meta: { align: 'right', width: '150px' } satisfies ColumnMeta,
    cell: (info) => {
      const { plan, actual } = info.row.original
      const diff = actual - plan
      return (
        <span
          className={cn(
            mono,
            'font-medium',
            diff < ACTUAL_WARNING_THRESHOLD
              ? 'text-badge-warning-fg'
              : 'text-text',
          )}
        >
          {formatDecimal(actual)}%{' '}
          <span className="font-normal text-text-3">
            {diff >= 0 ? '+' : '−'}
            {formatDecimal(Math.abs(diff))}
          </span>
        </span>
      )
    },
  }),
  helper.accessor('deviations', {
    header: 'Số sai lệch',
    meta: { align: 'right', width: '120px' } satisfies ColumnMeta,
    cell: (info) => {
      const value = info.getValue()
      return (
        <span
          className={cn(
            mono,
            value >= DEVIATION_WARNING_THRESHOLD
              ? 'text-badge-warning-fg'
              : value === 0
                ? 'text-text-3'
                : 'text-text',
          )}
        >
          {value}
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

export function PlanVsActualTable({
  onSelectTrip,
}: {
  onSelectTrip?: (row: PlanVsActualRow) => void
}) {
  return (
    <DataTable
      data={PLAN_VS_ACTUAL}
      columns={columns}
      density="compact"
      onRowClick={onSelectTrip}
    />
  )
}
