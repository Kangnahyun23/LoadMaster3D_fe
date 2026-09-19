/** Tìm nhanh Ctrl+K ở nav rail (LM-099, D-55): chuyến, kiện, xe, người dùng — chỉ nhóm người dùng được xem. */
export const search = {
  button: 'Tìm nhanh',
  title: 'Tìm nhanh',
  inputLabel: 'Từ khoá tìm nhanh',
  placeholder: 'Gõ mã, tên hoặc điểm giao…',
  /** Gợi ý khi chưa gõ: ghép các phạm vi người dùng được tìm. */
  hint: 'Tìm {scope}.',
  scope: {
    trips: 'chuyến (mã, tên, điểm giao)',
    packages: 'kiện (mã)',
    vehicles: 'xe (tên, biển số)',
    users: 'người dùng (tên, email)',
  },
  groups: { trips: 'Chuyến', packages: 'Kiện', vehicles: 'Xe', users: 'Người dùng' },
  results: 'Kết quả tìm nhanh',
  /** Đọc cho trình đọc màn hình mỗi lần kết quả đổi. */
  count: { one: '{count} kết quả', other: '{count} kết quả' },
  /** Dòng phụ của kiện: chuyến chứa kiện. */
  inTrip: '{trip} · {name}',
  loading: 'Đang tải dữ liệu để tìm…',
  error: 'Không tải được dữ liệu để tìm.',
  retry: 'Thử lại',
  noResults: 'Không tìm thấy kết quả cho “{query}”.',
  keys: { move: 'chọn', open: 'mở', close: 'đóng' },
  shortcut: 'Mở nhanh bằng {keys}',
} as const
