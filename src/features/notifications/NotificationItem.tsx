import { Link } from 'react-router'
import { DropdownMenuItem } from '@/components/ui/DropdownMenu'
import type { AuditRow } from '@/features/admin/audit-log'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const ITEM = 'h-auto items-start gap-2.5 px-3 py-2.5'

/**
 * Một thông báo (LM-098): nhãn hành động của nhật ký, đối tượng (tên hiện tại kèm mã), giờ. Chưa đọc thì có chấm primary, chữ đậm và
 * chữ ẩn "Chưa đọc" — không chỉ dựa vào màu. Bấm (hoặc Enter) mở đối tượng và đánh dấu đã đọc; đối tượng không còn trang để mở
 * (tài khoản đã xoá, email lạ khi đăng nhập sai) thì chỉ đánh dấu đã đọc.
 */
export function NotificationItem({ row, unread, when, onSelect }: {
  row: AuditRow
  unread: boolean
  /** Giờ đã format: "14:30", hoặc kèm ngày nếu không phải hôm nay. */
  when: string
  onSelect: () => void
}) {
  const t = useT()
  const target = row.target.label ? t('notifications.target', { label: row.target.label, id: row.target.id }) : row.target.id
  const body = (
    <>
      <span aria-hidden className={cn('mt-1.5 size-2 flex-none rounded-full', unread ? 'bg-primary' : 'bg-transparent')} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-3">
          <span className={cn('min-w-0 text-body text-text', unread ? 'font-semibold' : 'font-medium')}>{row.action}</span>
          <time dateTime={row.at} className="flex-none font-mono text-caption text-text-3">{when}</time>
        </span>
        <span className="truncate text-caption text-text-2">{target}</span>
      </span>
      {unread ? <span className="sr-only">{t('notifications.unread')}</span> : null}
    </>
  )
  if (!row.target.href) {
    return <DropdownMenuItem className={ITEM} onSelect={onSelect}>{body}</DropdownMenuItem>
  }
  return (
    <DropdownMenuItem asChild className={ITEM} onSelect={onSelect}>
      <Link to={row.target.href}>{body}</Link>
    </DropdownMenuItem>
  )
}
