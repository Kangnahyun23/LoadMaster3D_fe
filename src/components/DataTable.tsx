import {
  tableFeatures,
  useTable,
  type RowData,
  type TableOptions,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'

/**
 * Bảng dữ liệu dùng chung (CLAUDE.md mục 5).
 * Chiều cao dòng cố định, tiêu đề dính khi cuộn, không kẻ sọc xen kẽ,
 * phân tách bằng đường 1px. Cột số căn phải dùng mono — khai báo qua
 * `meta.align` trên từng cột.
 */

/** Bảng cơ bản: chưa bật sort/filter/pagination. Bật thêm khi màn nào cần. */
export const baseTableFeatures = tableFeatures({})

export type BaseTableFeatures = typeof baseTableFeatures

/** Kiểu mảng cột lấy thẳng từ options của useTable, tránh tự dựng generic. */
export type DataTableColumns<TData extends RowData> = TableOptions<
  BaseTableFeatures,
  TData
>['columns']

export type ColumnMeta = {
  align?: 'left' | 'right' | 'center'
  /** Chiều rộng cố định, ví dụ '130px' */
  width?: string
}

const ALIGN = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const

const ROW_HEIGHT = {
  /** Thoáng — 48px */
  comfortable: 'h-12',
  /** Gọn — 36px, dùng cho danh sách dài */
  compact: 'h-9',
} as const

/** Cảm ứng: hàng 56px (mục 8 style sheet) */
const TOUCH_ROW_HEIGHT = 'h-14'

/** Bảng hẹp (cột phụ 360px) cần padding sát hơn để tiêu đề không xuống dòng. */
const CELL_PADDING = {
  normal: 'px-3',
  tight: 'px-2.5',
} as const

type DataTableProps<TData extends RowData> = {
  data: TData[]
  columns: DataTableColumns<TData>
  density?: keyof typeof ROW_HEIGHT
  cellPadding?: keyof typeof CELL_PADDING
  /** Hàng 56px cho tablet tại kho */
  touch?: boolean
  onRowClick?: (row: TData) => void
  /** Đánh dấu hàng đang chọn — nền primary-bg */
  isRowSelected?: (row: TData) => boolean
  emptyMessage?: string
}

export function DataTable<TData extends RowData>({
  data,
  columns,
  density = 'compact',
  cellPadding = 'normal',
  touch = false,
  onRowClick,
  isRowSelected,
  emptyMessage = 'Chưa có dữ liệu',
}: DataTableProps<TData>) {
  const table = useTable({ features: baseTableFeatures, columns, data })
  const rowHeight = touch ? TOUCH_ROW_HEIGHT : ROW_HEIGHT[density]
  const padX = CELL_PADDING[cellPadding]

  if (data.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-body text-text-3">
        {emptyMessage}
      </div>
    )
  }

  return (
    <table className="w-full table-fixed border-collapse">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const meta = header.column.columnDef.meta as ColumnMeta | undefined
              return (
                <th
                  key={header.id}
                  style={meta?.width ? { width: meta.width } : undefined}
                  className={cn(
                    'sticky top-0 z-10 h-8 border-b border-border bg-surface',
                    padX,
                    'text-caption font-medium leading-none text-text-3',
                    ALIGN[meta?.align ?? 'left'],
                  )}
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              )
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => {
          const selected = isRowSelected?.(row.original) ?? false
          return (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn(
                rowHeight,
                selected ? 'bg-primary-bg' : 'hover:bg-surface',
                onRowClick && 'cursor-pointer',
              )}
            >
              {row.getAllCells().map((cell) => {
                const meta = cell.column.columnDef.meta as ColumnMeta | undefined
                return (
                  <td
                    key={cell.id}
                    className={cn(
                      rowHeight,
                      'border-b border-border text-body whitespace-nowrap',
                      padX,
                      ALIGN[meta?.align ?? 'left'],
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
