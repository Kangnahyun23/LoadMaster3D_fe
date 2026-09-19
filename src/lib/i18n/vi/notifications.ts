/**
 * Chuông thông báo ở nav rail (LM-098, D-55): sự kiện nhật ký liên quan vai trò. Nhãn từng thông báo là nhãn hành động của nhật ký
 * (`audit.actions.*`), không lặp ở đây.
 */
export const notifications = {
  label: 'Thông báo',
  /** Nhãn đọc của nút chuông khi có thông báo chưa đọc; bắt đầu bằng nhãn nhìn thấy. */
  labelUnread: { one: 'Thông báo, {count} chưa đọc', other: 'Thông báo, {count} chưa đọc' },
  title: 'Thông báo',
  markAllRead: 'Đánh dấu đã đọc',
  unread: 'Chưa đọc',
  loading: 'Đang tải thông báo…',
  error: 'Không tải được thông báo.',
  retry: 'Thử lại',
  empty: 'Không có thông báo nào trong {days} ngày qua.',
  /** Chân danh sách: nói rõ phạm vi, để người đọc không tưởng mất thông báo cũ hay việc chính mình làm. */
  scope: 'Sự kiện {days} ngày gần nhất, không gồm việc bạn làm.',
  /** Giờ kèm ngày khi thông báo không phải của hôm nay. */
  dateTime: '{time} · {date}',
  /** Đối tượng: tên hiện tại kèm mã. */
  target: '{label} · {id}',
} as const
