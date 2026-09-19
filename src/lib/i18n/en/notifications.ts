import type { Dictionary } from '../types'
import type { notifications as source } from '../vi/notifications'

export const notifications = {
  label: 'Notifications',
  labelUnread: { one: 'Notifications, {count} unread', other: 'Notifications, {count} unread' },
  title: 'Notifications',
  markAllRead: 'Mark as read',
  unread: 'Unread',
  loading: 'Loading notifications…',
  error: 'Could not load notifications.',
  retry: 'Try again',
  empty: 'No notifications in the last {days} days.',
  scope: 'Events from the last {days} days, not including your own actions.',
  dateTime: '{time} · {date}',
  target: '{label} · {id}',
} satisfies Dictionary<typeof source>
