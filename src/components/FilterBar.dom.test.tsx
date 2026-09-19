import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { I18nProvider } from '@/lib/i18n'
import { FilterBar, type FilterField } from './FilterBar'

/** Seam: `FilterBar` chỉ trình bày — nhận giá trị, báo thay đổi, không tự lọc dữ liệu. */

type Name = 'xe' | 'tu' | 'den'

const FIELDS: readonly FilterField<Name>[] = [
  { kind: 'select', name: 'xe', label: 'Xe', options: [{ value: 'VEHICLE-001', label: 'Hyundai HD210 · 60C-446.32' }], allLabel: 'Mọi xe' },
  { kind: 'dateRange', label: 'Ngày chạy', from: 'tu', to: 'den' },
]

const EMPTY: Record<Name, string> = { xe: '', tu: '', den: '' }

function bar(query: string, values: Record<Name, string>, handlers: { onQueryChange?: (query: string) => void; onValueChange?: (name: Name, value: string) => void; onClear?: () => void } = {}) {
  return (
    <I18nProvider>
      <FilterBar
        query={query}
        onQueryChange={handlers.onQueryChange ?? vi.fn()}
        searchLabel="Tìm theo mã, tên chuyến"
        fields={FIELDS}
        values={values}
        onValueChange={handlers.onValueChange ?? vi.fn()}
        onClear={handlers.onClear ?? vi.fn()}
      />
    </I18nProvider>
  )
}

test('the search box keeps what is typed while the list catches up, and follows changes made elsewhere', async () => {
  const user = userEvent.setup()
  const onQueryChange = vi.fn()
  // Giá trị URL đứng yên trong lúc gõ, như khi router chưa kịp đổi địa chỉ.
  const { rerender } = render(bar('', EMPTY, { onQueryChange }))
  const search = screen.getByRole('searchbox', { name: 'Tìm theo mã, tên chuyến' })

  await user.type(search, 'bien hoa')
  expect(search).toHaveValue('bien hoa')
  expect(onQueryChange).toHaveBeenLastCalledWith('bien hoa')

  rerender(bar('bien hoa', EMPTY, { onQueryChange }))
  expect(search).toHaveValue('bien hoa')
  // Xoá lọc từ nơi khác, rồi quay lại một địa chỉ cũ.
  rerender(bar('', EMPTY, { onQueryChange }))
  expect(search).toHaveValue('')
  rerender(bar('thu duc', EMPTY, { onQueryChange }))
  expect(search).toHaveValue('thu duc')
})

test('the clear button shows only while searching or filtering', async () => {
  const user = userEvent.setup()
  const onClear = vi.fn()
  const { rerender } = render(bar('', EMPTY, { onClear }))
  expect(screen.queryByRole('button', { name: 'Xoá lọc' })).toBeNull()

  rerender(bar('   ', EMPTY, { onClear }))
  expect(screen.queryByRole('button', { name: 'Xoá lọc' })).toBeNull()

  rerender(bar('', { ...EMPTY, den: '2026-09-19' }, { onClear }))
  await user.click(screen.getByRole('button', { name: 'Xoá lọc' }))
  expect(onClear).toHaveBeenCalledOnce()
  expect(screen.getByRole('searchbox')).toHaveFocus()
})

test('a select reports its option, and its "all" row reports an empty value', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  const { rerender } = render(bar('', EMPTY, { onValueChange }))
  const vehicle = screen.getByRole('combobox', { name: 'Xe' })
  expect(vehicle).toHaveTextContent('Mọi xe')

  await user.click(vehicle)
  await user.click(await screen.findByRole('option', { name: 'Hyundai HD210 · 60C-446.32' }))
  expect(onValueChange).toHaveBeenLastCalledWith('xe', 'VEHICLE-001')

  rerender(bar('', { ...EMPTY, xe: 'VEHICLE-001' }, { onValueChange }))
  expect(vehicle).toHaveTextContent('Hyundai HD210 · 60C-446.32')
  await user.click(vehicle)
  await user.click(await screen.findByRole('option', { name: 'Mọi xe' }))
  expect(onValueChange).toHaveBeenLastCalledWith('xe', '')
})

test('a date range is one labelled group whose ends cannot cross', () => {
  const onValueChange = vi.fn()
  render(bar('', { ...EMPTY, tu: '2026-09-10', den: '2026-09-19' }, { onValueChange }))
  expect(screen.getByRole('group', { name: 'Ngày chạy' })).toBeInTheDocument()
  const from = screen.getByLabelText('Từ ngày')
  const to = screen.getByLabelText('Đến ngày')
  expect(from).toHaveAttribute('max', '2026-09-19')
  expect(to).toHaveAttribute('min', '2026-09-10')

  fireEvent.change(to, { target: { value: '2026-09-25' } })
  expect(onValueChange).toHaveBeenLastCalledWith('den', '2026-09-25')
  expect(to).toHaveValue('2026-09-25')
  expect(from).toHaveAttribute('max', '2026-09-25')
})
