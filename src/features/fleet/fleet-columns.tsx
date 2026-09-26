import { createColumnHelper } from '@tanstack/react-table'
import { Link } from 'react-router'
import type { BaseTableFeatures, ColumnMeta } from '@/components/DataTable'
import type { Formatter } from '@/lib/format'
import type { TFunction } from '@/lib/i18n'
import { statusRank, type VehicleRow } from './vehicle-status'
import { VehicleStatusCell, VehicleThumb } from './VehicleStatusBadge'

const helper = createColumnHelper<BaseTableFeatures, VehicleRow>()
const mono = 'font-mono text-caption text-ink-1'

/**
 * Cột bảng đội xe (V2): Phương tiện · Lòng thùng · Tải tối đa · Vật cản · Trạng thái. Cửa xe xem ở trang cấu hình xe.
 * Phụ thuộc ngôn ngữ đang chọn (số và tiêu đề), nên dựng trong component chứ không ở module.
 */
export function createFleetColumns(t: TFunction, format: Formatter) {
  return helper.columns([
    helper.accessor('name', {
      header: t('fleet.columns.name'),
      enableSorting: true,
      cell: (info) => {
        const vehicle = info.row.original
        return (
          <span className="flex min-w-0 items-center gap-2.5">
            <VehicleThumb status={vehicle.state.status} />
            <span className="flex min-w-0 flex-col whitespace-normal">
              {/* Dòng mở trang bằng chuột; liên kết ở tên cho bàn phím (AGENTS mục 10). */}
              <Link
                to={`/doi-xe/${vehicle.id}`}
                onClick={(event) => event.stopPropagation()}
                className="line-clamp-2 rounded-sm font-medium text-ink-strong hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {info.getValue()}
              </Link>
              {/* Khoảng trắng không hiện trong flex nhưng tách tên và mã trong tên truy cập của dòng */}
              {' '}
              <span className="font-mono text-caption text-ink-3">{vehicle.id}</span>
            </span>
          </span>
        )
      },
    }),
    helper.accessor('innerLengthCm', {
      header: t('fleet.columns.inner'),
      enableSorting: true,
      meta: { align: 'right', width: '220px' } satisfies ColumnMeta,
      cell: (info) => {
        const vehicle = info.row.original
        return <span className={mono}>{format.dimensions(vehicle.innerLengthCm, vehicle.innerWidthCm, vehicle.innerHeightCm)}</span>
      },
    }),
    helper.accessor('maxPayloadKg', {
      header: t('fleet.columns.payload'),
      enableSorting: true,
      meta: { align: 'right', width: '140px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.weight(info.getValue())}</span>,
    }),
    helper.accessor((vehicle) => vehicle.obstacles.length, {
      id: 'obstacleCount',
      header: t('fleet.columns.obstacles'),
      meta: { width: '110px' } satisfies ColumnMeta,
      cell: (info) => <span className="text-body text-ink-1">{t('fleet.obstacleZones', { count: info.getValue() })}</span>,
    }),
    helper.accessor((vehicle) => statusRank(vehicle.state.status), {
      id: 'status',
      header: t('fleet.columns.status'),
      enableSorting: true,
      // Bấm lần đầu: sẵn sàng trước, như thứ tự bộ lọc
      sortDescFirst: false,
      meta: { width: '280px' } satisfies ColumnMeta,
      cell: (info) => <VehicleStatusCell state={info.row.original.state} />,
    }),
  ])
}
