/** Màn 404 và trang lỗi chung của router. */
export const notFound = {
  errorCode: 'Lỗi',
  title: 'Không tìm thấy trang',
  description:
    'Đường dẫn không tồn tại hoặc đã bị đổi. Kiểm tra lại liên kết hoặc quay về danh sách chuyến.',
  errorTitle: 'Đã xảy ra lỗi',
  errorDescription:
    'Màn hình gặp sự cố khi tải. Thử tải lại trang; nếu vẫn lỗi, báo cho quản trị hệ thống.',
  backToTrips: 'Về danh sách chuyến',
  reload: 'Tải lại trang',
} as const
