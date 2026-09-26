import { Bell } from 'lucide-react'
import { useMemo } from 'react'
import { NavRailButton } from '@/components/NavRailButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Spinner } from '@/components/ui/Spinner'
import { describeEvent } from '@/features/admin/audit-log'
import { useAuth } from '@/features/auth/AuthProvider'
import { useFormat, useT } from '@/lib/i18n'
import { hasNotifications, NOTIFICATION_WINDOW_DAYS } from './notifications'
import { NotificationItem } from './NotificationItem'
import { markNotificationsRead, useReadNotifications } from './read-state'
import { useNotificationsQuery } from './useNotificationsQuery'

/**
 * Chuông thông báo trên nav rail (LM-098, D-55): số chưa đọc trên icon, mở danh sách sự kiện nhật ký liên quan vai trò — mới nhất
 * trước, 7 ngày, tối đa 20, không gồm việc chính mình làm. Mở chuông là đọc lại kho; "Đánh dấu đã đọc" giữ trong phiên. Vai trò không có
 * loại thông báo nào (kho, tài xế) thì không có chuông: không hiện nút không làm gì (D-20).
 */
export function NotificationBell() {
  const t = useT()
  const format = useFormat()
  const { user } = useAuth()
  const query = useNotificationsQuery()
  const read = useReadNotifications(user?.id ?? '')
  const feed = query.data
  const rows = useMemo(
    () => (feed ? feed.events.map((event) => describeEvent(event, feed.directory, t, format)) : []),
    [feed, t, format],
  )
  if (!user || !hasNotifications(user.role)) return null

  const userId = user.id
  const unreadCount = rows.filter((row) => !read.has(row.id)).length
  // "Hôm nay" theo lần đọc kho gần nhất, không theo đồng hồ lúc vẽ
  const today = format.date(new Date(query.dataUpdatedAt))
  const whenOf = (at: string) =>
    format.date(at) === today ? format.time(at) : t('notifications.dateTime', { time: format.time(at), date: format.dayMonth(at) })

  function handleOpenChange(open: boolean) {
    if (open) void query.refetch()
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <NavRailButton
          icon={Bell}
          label={t('notifications.label')}
          aria-label={unreadCount > 0 ? t('notifications.labelUnread', { count: unreadCount }) : undefined}
          badge={
            unreadCount > 0 ? (
              <span
                aria-hidden
                className="absolute -top-1.5 right-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 font-mono text-[11px] leading-none font-semibold text-white"
              >
                {unreadCount > 9 ? `${format.integer(9)}+` : format.integer(unreadCount)}
              </span>
            ) : null
          }
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="flex w-96 max-w-[calc(100vw-112px)] flex-col p-0">
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border py-1.5 pr-1.5 pl-4">
          <DropdownMenuLabel className="p-0 text-h3 font-semibold text-text">{t('notifications.title')}</DropdownMenuLabel>
          {unreadCount > 0 ? (
            <DropdownMenuItem
              className="px-3 font-medium text-primary-hover"
              onSelect={(event) => {
                // Giữ danh sách mở để thấy mọi dòng đã chuyển sang đã đọc
                event.preventDefault()
                markNotificationsRead(userId, rows.map((row) => row.id))
              }}
            >
              {t('notifications.markAllRead')}
            </DropdownMenuItem>
          ) : null}
        </div>

        <div className="max-h-[min(28rem,60vh)] overflow-y-auto p-1">
          {query.isPending ? (
            <p className="flex items-center gap-2 px-3 py-6 text-body text-text-2">
              <Spinner />
              {t('notifications.loading')}
            </p>
          ) : query.isError ? (
            <>
              <p className="px-3 pt-4 pb-2 text-body text-text-2">{t('notifications.error')}</p>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  void query.refetch()
                }}
              >
                {t('notifications.retry')}
              </DropdownMenuItem>
            </>
          ) : rows.length === 0 ? (
            <p className="px-3 py-6 text-center text-body text-text-2">{t('notifications.empty', { days: NOTIFICATION_WINDOW_DAYS })}</p>
          ) : (
            rows.map((row) => (
              <NotificationItem
                key={row.id}
                row={row}
                unread={!read.has(row.id)}
                when={whenOf(row.at)}
                onSelect={() => markNotificationsRead(userId, [row.id])}
              />
            ))
          )}
        </div>

        <p className="border-t border-border px-4 py-2.5 text-caption text-text-3">
          {t('notifications.scope', { days: NOTIFICATION_WINDOW_DAYS })}
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
