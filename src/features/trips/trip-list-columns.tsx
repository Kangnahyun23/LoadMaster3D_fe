import { createColumnHelper } from '@tanstack/react-table'
import { Link } from 'react-router'
import type { BaseTableFeatures, ColumnMeta } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { VehicleName } from '@/components/VehicleName'
import type { Formatter } from '@/lib/format'
import type { TFunction } from '@/lib/i18n'
import { dateOnly } from './trip-dates'
import type { TripRow } from './trip-list'

const helper = createColumnHelper<BaseTableFeatures, TripRow>()
const mono = 'font-mono text-caption'

/**
 * Cột danh sách chuyến (LM-088): ngày chạy, mã, tên + tuyến, xe, tài xế, số kiện, lấp đầy, trạng thái. Cột sắp xếp được khai
 * `enableSorting`; ngày chạy bấm lần đầu là mới nhất trước. Mã chuyến là liên kết để mở chi tiết bằng bàn phím.
 */
export function createTripColumns(t: TFunction, format: Formatter) {
  return helper.columns([
    helper.accessor('scheduledDate', {
      header: t('trips.list.date'),
      enableSorting: true,
      sortDescFirst: true,
      // Đủ chỗ cho tiêu đề "Ngày chạy" cùng mũi tên sắp xếp 16px
      meta: { width: '128px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.date(dateOnly(info.getValue()))}</span>,
    }),
    helper.accessor('id', {
      header: t('trips.list.id'),
      enableSorting: true,
      // "TRIP-2026-0914" mono 12 px cùng mũi tên sắp xếp; phần dư nhường cột tên chuyến (LM-095)
      meta: { width: '136px' } satisfies ColumnMeta,
      cell: (info) => (
        <Link
          to={`/chuyen/${info.getValue()}`}
          // Dòng cũng mở chi tiết khi bấm: chặn nổi bọt để không đẩy hai mục lịch sử
          onClick={(event) => event.stopPropagation()}
          className="rounded-sm font-mono text-caption text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    helper.accessor('name', {
      header: t('trips.list.name'),
      enableSorting: true,
      cell: (info) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{info.getValue()}</span>
          <span className="truncate text-caption text-text-3">{info.row.original.route}</span>
        </span>
      ),
    }),
    helper.accessor('vehicleName', {
      header: t('trips.list.vehicle'),
      enableSorting: true,
      meta: { width: '180px' } satisfies ColumnMeta,
      // Tên xe xuống tối đa hai dòng: không cắt mất biển số ở 1.366 px (LM-095)
      cell: (info) => <VehicleName name={info.getValue()} className="line-clamp-2 whitespace-normal" />,
    }),
    helper.accessor('driverName', {
      header: t('trips.list.driver'),
      enableSorting: true,
      meta: { width: '148px' } satisfies ColumnMeta,
      cell: (info) => {
        const name = info.getValue()
        return name === null
          ? <span className="text-caption text-text-3">{t('trips.list.unassigned')}</span>
          : <span className="block truncate">{name}</span>
      },
    }),
    helper.accessor('packageCount', {
      header: t('trips.list.packages'),
      enableSorting: true,
      meta: { align: 'right', width: '88px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.integer(info.getValue())}</span>,
    }),
    helper.accessor('volumePercent', {
      header: t('trips.list.volume'),
      enableSorting: true,
      meta: { width: '140px' } satisfies ColumnMeta,
      cell: (info) => {
        const value = info.getValue()
        if (value === null) return <span className="text-caption text-text-3">{t('trips.list.notOptimized')}</span>
        return (
          <span className="flex items-center gap-2">
            <ProgressBar value={value} className="w-14" />
            <span className={mono}>{format.percent(value)}</span>
          </span>
        )
      },
    }),
    helper.accessor('status', {
      header: t('trips.list.status'),
      meta: { width: '148px' } satisfies ColumnMeta,
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
  ])
}
