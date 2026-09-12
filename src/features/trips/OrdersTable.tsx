import { createColumnHelper } from '@tanstack/react-table'
import {
  DataTable,
  type BaseTableFeatures,
  type ColumnMeta,
} from '@/components/DataTable'
import { formatInteger } from '@/lib/format'
import { stopColor, stopForeground } from '@/lib/stops'
import { ORDERS, type Order } from './trip-detail.mock'

const helper = createColumnHelper<BaseTableFeatures, Order>()

const mono = 'font-mono text-caption'

const columns = helper.columns([
  helper.accessor('id', {
    header: 'Mã đơn',
    meta: { width: '86px' } satisfies ColumnMeta,
    cell: (info) => <span className={mono}>{info.getValue()}</span>,
  }),
  helper.accessor('customer', {
    header: 'Khách',
    cell: (info) => <span className="block truncate">{info.getValue()}</span>,
  }),
  helper.accessor('packageCount', {
    header: 'Kiện',
    meta: { align: 'right', width: '44px' } satisfies ColumnMeta,
    cell: (info) => (
      <span className={mono}>{formatInteger(info.getValue())}</span>
    ),
  }),
  helper.accessor('weightKg', {
    header: 'kg',
    meta: { align: 'right', width: '58px' } satisfies ColumnMeta,
    cell: (info) => (
      <span className={mono}>{formatInteger(info.getValue())}</span>
    ),
  }),
  helper.accessor('stop', {
    header: 'Điểm',
    meta: { align: 'center', width: '52px' } satisfies ColumnMeta,
    cell: (info) => {
      const stop = info.getValue()
      return (
        <span className="flex justify-center">
          <span
            className="grid size-5 place-items-center rounded-full font-mono text-[11px] font-semibold leading-none"
            style={{
              background: stopColor(stop),
              color: stopForeground(stop),
            }}
          >
            <span className="sr-only">Điểm giao số </span>
            {stop}
          </span>
        </span>
      )
    },
  }),
])

/** Bảng đơn hàng ở cột phải, kèm hàng tổng cố định dưới cùng. */
export function OrdersTable() {
  const totalPackages = ORDERS.reduce((sum, o) => sum + o.packageCount, 0)
  const totalWeight = ORDERS.reduce((sum, o) => sum + o.weightKg, 0)

  return (
    <div className="overflow-hidden rounded-md border border-border bg-bg">
      <DataTable
        data={ORDERS}
        columns={columns}
        density="compact"
        cellPadding="tight"
      />
      <table className="w-full table-fixed border-collapse">
        <tbody>
          <tr className="h-9 bg-surface">
            <td
              colSpan={2}
              className="h-9 px-2.5 text-caption font-medium text-text-2"
            >
              Tổng
            </td>
            <td className="h-9 w-11 px-2.5 text-right font-mono text-caption font-medium">
              {formatInteger(totalPackages)}
            </td>
            <td className="h-9 w-[58px] px-2.5 text-right font-mono text-caption font-medium">
              {formatInteger(totalWeight)}
            </td>
            <td className="h-9 w-[52px] px-2.5" />
          </tr>
        </tbody>
      </table>
    </div>
  )
}
