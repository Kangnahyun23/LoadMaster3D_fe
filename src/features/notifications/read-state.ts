import { useSyncExternalStore } from 'react'

/**
 * Thông báo đã đọc (LM-098), theo người dùng, giữ trong bộ nhớ của tab suốt phiên làm việc: đổi màn (kể cả sang màn kho rồi quay lại)
 * không mất; tải lại trang thì mất cùng kho in-memory. Không `localStorage` (mục 9). Là trạng thái giao diện, không phải dữ liệu
 * nghiệp vụ — khi có backend, "đã đọc" về server.
 */
const readByUser = new Map<string, ReadonlySet<string>>()
const listeners = new Set<() => void>()
const NONE: ReadonlySet<string> = new Set()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function markNotificationsRead(userId: string, eventIds: readonly string[]) {
  const current = readByUser.get(userId) ?? NONE
  if (eventIds.every((id) => current.has(id))) return
  readByUser.set(userId, new Set([...current, ...eventIds]))
  for (const listener of listeners) listener()
}

/** Mã sự kiện `userId` đã đọc; đổi tham chiếu mỗi lần đánh dấu để React vẽ lại. */
export function useReadNotifications(userId: string): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, () => readByUser.get(userId) ?? NONE)
}
