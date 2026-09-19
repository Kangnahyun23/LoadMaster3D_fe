import {
  constructSortFn,
  createPaginatedRowModel,
  createSortedRowModel,
  functionalUpdate,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type RowData,
  type SortingState,
  type TableOptions,
  type Updater,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import { useT } from '@/lib/i18n'
import { compareText } from '@/lib/list-filter'
import { cn } from '@/lib/utils'
import { NoMatchRow, SortHeader } from './DataTableParts'
import { clampPageIndex, PaginationFooter, type DataTablePagination } from './DataTablePagination'

/**
 * Bảng dữ liệu dùng chung (CLAUDE.md mục 5).
 * Chiều cao dòng cố định, tiêu đề dính khi cuộn, không kẻ sọc xen kẽ,
 * phân tách bằng đường 1px. Cột số căn phải dùng mono — khai báo qua
 * `meta.align` trên từng cột.
 *
 * Sắp xếp và phân trang (LM-085, D-52) là tính năng TanStack Table v9 đăng ký sẵn nhưng chỉ chạy khi màn bật:
 * - Sắp xếp: cột khai `enableSorting: true` (cột khác không bấm được); thứ tự do màn giữ qua `sorting` + `onSortingChange`,
 *   không truyền thì bảng tự giữ. Một cột mỗi lần, bấm lại đảo chiều, không có trạng thái "bỏ sắp xếp".
 *   Chữ sắp theo tiếng Việt; cột ngày muốn bấm lần đầu là mới nhất trước thì khai `sortDescFirst: true`.
 * - Phân trang: truyền `pagination`; vắng thì hiện mọi dòng như cũ.
 * - Lọc: màn tự lọc `data` (`@/lib/list-filter`) rồi truyền `isFiltering` để bảng rỗng nói "không có kết quả khớp".
 */

/** Chữ theo thứ tự tiếng Việt, số trong chuỗi theo giá trị — thay hai hàm so chữ mặc định vốn so mã Unicode (Đ sau Z). */
const sortFn_vietnamese = constructSortFn({
  resolveDataValue: (value) => (typeof value === 'string' ? value : value == null ? '' : String(value)),
  sort: (a: string, b: string) => compareText(a, b),
})

/** Tính năng mọi `DataTable` đăng ký. Cột của màn khai bằng `createColumnHelper<BaseTableFeatures, Row>()`. */
export const baseTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { text: sortFn_vietnamese, alphanumeric: sortFn_vietnamese },
})

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

export type { DataTablePagination }

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

/** Không cột nào sắp xếp được trừ khi màn khai `enableSorting: true` (TanStack mặc định bật cho mọi cột). */
const SORTING_OFF_BY_DEFAULT = { enableSorting: false }

type SortingProps =
  | { sorting: SortingState; onSortingChange: (sorting: SortingState) => void }
  | { sorting?: undefined; onSortingChange?: undefined }

type DataTableProps<TData extends RowData> = SortingProps & {
  data: TData[]
  columns: DataTableColumns<TData>
  density?: keyof typeof ROW_HEIGHT
  cellPadding?: keyof typeof CELL_PADDING
  /** Hàng 56px cho tablet tại kho */
  touch?: boolean
  onRowClick?: (row: TData) => void
  /** Đánh dấu hàng đang chọn — nền primary-bg */
  isRowSelected?: (row: TData) => boolean
  /** Bảng rỗng vì chưa có dữ liệu. */
  emptyMessage?: string
  /** Phân trang ở chân bảng: 25/50/100 dòng, "x–y / n", trước/sau. Vắng thì hiện mọi dòng. */
  pagination?: DataTablePagination
  /** Màn đang tìm/lọc (`list.isFiltering`): bảng rỗng thì nói không có kết quả khớp, kèm nút xoá lọc. */
  isFiltering?: boolean
  onClearFilters?: () => void
  /** Thay câu "Không có kết quả khớp bộ lọc". */
  noMatchMessage?: string
}

export function DataTable<TData extends RowData>({
  data,
  columns,
  density = 'compact',
  cellPadding = 'normal',
  touch = false,
  onRowClick,
  isRowSelected,
  emptyMessage,
  sorting,
  onSortingChange,
  pagination,
  isFiltering = false,
  onClearFilters,
  noMatchMessage,
}: DataTableProps<TData>) {
  const t = useT()
  const rowCount = data.length
  const pageIndex = pagination ? clampPageIndex(pagination.pageIndex, rowCount, pagination.pageSize) : 0
  const pageSize = pagination?.pageSize
  const page = useMemo(() => (pageSize === undefined ? undefined : { pageIndex, pageSize }), [pageIndex, pageSize])
  // Chỉ gắn khi màn giữ thứ tự: gắn `undefined` sẽ đè hàm ghi state mặc định và bảng tự giữ không sắp được nữa.
  const controlledSorting = sorting && onSortingChange
    ? { onSortingChange: (updater: Updater<SortingState>) => onSortingChange(functionalUpdate(updater, sorting)) }
    : {}

  const table = useTable({
    features: baseTableFeatures,
    columns,
    data,
    defaultColumn: SORTING_OFF_BY_DEFAULT,
    enableMultiSort: false,
    enableSortingRemoval: false,
    // Trang do màn giữ trên URL: dữ liệu về muộn không được kéo người dùng về trang 1.
    autoResetPageIndex: false,
    manualPagination: page === undefined,
    state: { ...(sorting ? { sorting } : {}), ...(page ? { pagination: page } : {}) },
    ...controlledSorting,
  })
  const rowHeight = touch ? TOUCH_ROW_HEIGHT : ROW_HEIGHT[density]
  const padX = CELL_PADDING[cellPadding]

  if (rowCount === 0 && !isFiltering) {
    return (
      <div className="flex h-24 items-center justify-center text-body text-text-3">
        {emptyMessage ?? t('common.noData')}
      </div>
    )
  }

  return (
    <>
      <table className="w-full table-fixed border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as ColumnMeta | undefined
                const align = meta?.align ?? 'left'
                const sorted = header.column.getCanSort() ? header.column.getIsSorted() : false
                return (
                  <th
                    key={header.id}
                    aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                    style={meta?.width ? { width: meta.width } : undefined}
                    className={cn(
                      'sticky top-0 z-10 h-8 border-b border-border bg-surface',
                      padX,
                      'text-caption font-medium leading-none text-text-3',
                      ALIGN[align],
                    )}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <SortHeader direction={sorted} align={align} onToggle={header.column.getToggleSortingHandler()}>
                        <table.FlexRender header={header} />
                      </SortHeader>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rowCount === 0 ? (
            <NoMatchRow columnCount={table.getAllLeafColumns().length} message={noMatchMessage} onClear={onClearFilters} />
          ) : table.getRowModel().rows.map((row) => {
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
      {pagination && rowCount > 0 ? (
        <PaginationFooter {...pagination} pageIndex={pageIndex} rowCount={rowCount} />
      ) : null}
    </>
  )
}
