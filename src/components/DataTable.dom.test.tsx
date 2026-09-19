import { createColumnHelper } from '@tanstack/react-table'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import { I18nProvider } from '@/lib/i18n'
import { DataTable, type BaseTableFeatures, type ColumnMeta, type DataTablePagination } from './DataTable'

/** Seam: `DataTable` qua props công khai. Tính năng LM-085 chỉ bật khi màn truyền prop; không truyền thì như cũ. */

type Place = { code: string; name: string; weightKg: number }

const helper = createColumnHelper<BaseTableFeatures, Place>()

/** Cột như các màn hiện có: không khai `enableSorting`. */
const PLAIN_COLUMNS = helper.columns([
  helper.accessor('code', { header: 'Mã điểm' }),
  helper.accessor('name', { header: 'Tên điểm giao' }),
  helper.accessor('weightKg', { header: 'Khối lượng', meta: { align: 'right' } satisfies ColumnMeta }),
])

const SORTABLE_COLUMNS = helper.columns([
  helper.accessor('code', { header: 'Mã điểm', enableSorting: true }),
  helper.accessor('name', { header: 'Tên điểm giao', enableSorting: true }),
])

const PLACES: Place[] = [
  { code: 'DG-10', name: 'Kho Đà Lạt', weightKg: 820 },
  { code: 'DG-2', name: 'Kho Dĩ An', weightKg: 1240 },
  { code: 'DG-1', name: 'Kho Bình Dương', weightKg: 415 },
]

/** 1.200 dòng `DG-1` … `DG-1200` cho phân trang. */
const MANY: Place[] = Array.from({ length: 1200 }, (_, index) => ({ code: `DG-${index + 1}`, name: 'Kho Sóng Thần', weightKg: 100 }))

const renderInVietnamese = (ui: ReactNode) => render(<I18nProvider>{ui}</I18nProvider>)
const bodyRows = () => within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row')
const names = () => bodyRows().map((row) => within(row).getAllByRole('cell')[1]!.textContent)

afterEach(() => {
  window.history.replaceState(null, '', '/')
  sessionStorage.clear()
})

test('without the new props a table looks and behaves as before: every row, plain headers, no footer', () => {
  renderInVietnamese(<DataTable data={MANY.slice(0, 60)} columns={PLAIN_COLUMNS} />)
  expect(bodyRows()).toHaveLength(60)
  expect(within(screen.getByRole('table')).queryAllByRole('button')).toHaveLength(0)
  expect(screen.getByRole('columnheader', { name: 'Mã điểm' })).not.toHaveAttribute('aria-sort')
  expect(screen.queryByText('Số dòng mỗi trang')).toBeNull()
})

test('a table without sorting props keeps its own order, in Vietnamese alphabet order and numbers by value', async () => {
  const user = userEvent.setup()
  renderInVietnamese(<DataTable data={PLACES} columns={SORTABLE_COLUMNS} />)
  expect(names()).toStrictEqual(['Kho Đà Lạt', 'Kho Dĩ An', 'Kho Bình Dương'])

  await user.click(screen.getByRole('button', { name: 'Tên điểm giao' }))
  expect(screen.getByRole('columnheader', { name: 'Tên điểm giao' })).toHaveAttribute('aria-sort', 'ascending')
  expect(names()).toStrictEqual(['Kho Bình Dương', 'Kho Dĩ An', 'Kho Đà Lạt'])
  await user.click(screen.getByRole('button', { name: 'Tên điểm giao' }))
  expect(names()).toStrictEqual(['Kho Đà Lạt', 'Kho Dĩ An', 'Kho Bình Dương'])

  await user.click(screen.getByRole('button', { name: 'Mã điểm' }))
  expect(bodyRows().map((row) => within(row).getAllByRole('cell')[0]!.textContent)).toStrictEqual(['DG-1', 'DG-2', 'DG-10'])
})

test('a controlled table reports the next order and shows the one it is given', async () => {
  const user = userEvent.setup()
  const onSortingChange = vi.fn()
  renderInVietnamese(
    <DataTable data={PLACES} columns={SORTABLE_COLUMNS} sorting={[{ id: 'name', desc: true }]} onSortingChange={onSortingChange} />,
  )
  expect(names()).toStrictEqual(['Kho Đà Lạt', 'Kho Dĩ An', 'Kho Bình Dương'])

  await user.click(screen.getByRole('button', { name: 'Tên điểm giao' }))
  expect(onSortingChange).toHaveBeenLastCalledWith([{ id: 'name', desc: false }])
  await user.click(screen.getByRole('button', { name: 'Mã điểm' }))
  expect(onSortingChange).toHaveBeenLastCalledWith([{ id: 'code', desc: false }])
  // Màn chưa đổi `sorting` thì bảng giữ thứ tự cũ.
  expect(screen.getByRole('columnheader', { name: 'Tên điểm giao' })).toHaveAttribute('aria-sort', 'descending')
})

test('an empty table says there is no data yet; an empty filtered table says nothing matches and offers to clear', async () => {
  const user = userEvent.setup()
  const { rerender } = renderInVietnamese(<DataTable data={[]} columns={PLAIN_COLUMNS} />)
  expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument()
  expect(screen.queryByRole('table')).toBeNull()

  const onClearFilters = vi.fn()
  rerender(<I18nProvider><DataTable data={[]} columns={PLAIN_COLUMNS} isFiltering onClearFilters={onClearFilters} /></I18nProvider>)
  expect(screen.getByRole('columnheader', { name: 'Tên điểm giao' })).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Không có kết quả khớp bộ lọc')
  await user.click(screen.getByRole('button', { name: 'Xoá lọc' }))
  expect(onClearFilters).toHaveBeenCalledOnce()

  rerender(<I18nProvider><DataTable data={[]} columns={PLAIN_COLUMNS} isFiltering noMatchMessage="Không có chuyến nào trong khoảng ngày này" /></I18nProvider>)
  expect(screen.getByRole('status')).toHaveTextContent('Không có chuyến nào trong khoảng ngày này')
  expect(screen.queryByRole('button', { name: 'Xoá lọc' })).toBeNull()
})

test('a page past the end of the data shows the last page without rewriting the page it was given', async () => {
  const user = userEvent.setup()
  const pagination: DataTablePagination = { pageIndex: 60, pageSize: 25, onPageChange: vi.fn(), onPageSizeChange: vi.fn() }
  renderInVietnamese(<DataTable data={MANY} columns={PLAIN_COLUMNS} pagination={pagination} />)

  expect(screen.getByText('1.176–1.200 / 1.200')).toBeInTheDocument()
  expect(bodyRows()).toHaveLength(25)
  expect(within(bodyRows()[0]!).getAllByRole('cell')[0]).toHaveTextContent('DG-1176')
  expect(pagination.onPageChange).not.toHaveBeenCalled()

  await user.click(screen.getByRole('button', { name: 'Trang trước' }))
  expect(pagination.onPageChange).toHaveBeenCalledWith(46)
})

test('the footer reads in English with English number grouping', () => {
  window.history.replaceState(null, '', '/?lang=en')
  const pagination: DataTablePagination = { pageIndex: 0, pageSize: 100, onPageChange: vi.fn(), onPageSizeChange: vi.fn() }
  render(<I18nProvider><DataTable data={MANY} columns={PLAIN_COLUMNS} pagination={pagination} /></I18nProvider>)
  expect(screen.getByText('1–100 of 1,200')).toBeInTheDocument()
  expect(screen.getByRole('combobox', { name: 'Rows per page' })).toHaveTextContent('100')
  expect(screen.getByRole('button', { name: 'Previous page' })).toHaveAttribute('aria-disabled', 'true')
})

test('a screen that names its rows keeps each row on its own node when a filter removes the rows before it', () => {
  // Khoá theo vị trí thì menu thao tác đang mở ở dòng thứ ba bị gỡ khi lọc, hoặc sang nhầm dòng của người khác (LM-101)
  const byCode = (place: Place) => place.code
  const { rerender } = renderInVietnamese(<DataTable data={PLACES} columns={PLAIN_COLUMNS} getRowId={byCode} />)
  const before = screen.getByRole('row', { name: /Kho Bình Dương/ })

  rerender(<I18nProvider><DataTable data={PLACES.slice(2)} columns={PLAIN_COLUMNS} getRowId={byCode} /></I18nProvider>)
  expect(screen.getByRole('row', { name: /Kho Bình Dương/ })).toBe(before)
})
