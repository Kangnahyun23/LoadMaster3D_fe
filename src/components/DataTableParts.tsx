import { ArrowDown, ArrowUp, ChevronsUpDown, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** Các mảnh trình bày của `DataTable` (LM-085): tiêu đề cột sắp xếp được và hàng "không có kết quả khớp". */

/**
 * Tiêu đề cột sắp xếp được: nút gốc (Enter/Space bấm được), `aria-sort` đặt ở `th` bao ngoài.
 * Nút cao 24px để vòng focus 2px cách 2px vẫn nằm trong hàng tiêu đề 32px, không bị khung `overflow-hidden` cắt.
 * Cột căn phải để mũi tên bên trái chữ, giữ mép chữ thẳng hàng với số bên dưới.
 */
export function SortHeader({ direction, align, onToggle, children }: {
  direction: false | 'asc' | 'desc'
  align: 'left' | 'right' | 'center'
  onToggle: ((event: unknown) => void) | undefined
  children: ReactNode
}) {
  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ChevronsUpDown
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        '-mx-1 inline-flex h-6 max-w-full items-center gap-1 rounded-sm px-1 font-medium',
        'transition-colors duration-(--dur-fast) ease-standard hover:text-text',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        align === 'right' && 'flex-row-reverse',
        direction && 'text-text',
      )}
    >
      <span className="truncate">{children}</span>
      <Icon aria-hidden className="size-4 flex-none" strokeWidth={1.5} />
    </button>
  )
}

/**
 * Hàng duy nhất khi bộ lọc không khớp dòng nào: tiêu đề cột và thứ tự sắp xếp vẫn đứng yên, câu nói rõ rỗng vì lọc
 * (khác "Chưa có dữ liệu"), kèm nút xoá lọc khi màn truyền `onClear`.
 */
export function NoMatchRow({ columnCount, message, onClear }: {
  columnCount: number
  message?: string
  onClear?: () => void
}) {
  const t = useT()
  return (
    <tr>
      <td colSpan={columnCount} className="py-10">
        <div role="status" className="flex flex-col items-center gap-3 text-center">
          <span className="text-body text-text-2">{message ?? t('common.table.noMatch')}</span>
          {onClear ? (
            <Button variant="secondary" onClick={onClear}>
              <X strokeWidth={1.5} />
              {t('common.filters.clear')}
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  )
}
