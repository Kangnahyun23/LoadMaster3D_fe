/** Màn 404 và trang lỗi chung của router. */
export const notFound = {
  errorCode: 'Lỗi',
  title: 'Không tìm thấy trang',
  description:
    'Đường dẫn không tồn tại hoặc đã bị đổi. Kiểm tra lại liên kết hoặc quay về màn chính.',
  errorTitle: 'Đã xảy ra lỗi',
  errorDescription:
    'Màn hình gặp sự cố khi tải. Thử tải lại trang; nếu vẫn lỗi, báo cho quản trị hệ thống.',
  backHome: 'Về màn chính',
  reload: 'Tải lại trang',
  /** 403 — phân quyền giả lập ở FE (D-41). */
  forbiddenTitle: 'Không có quyền truy cập',
  forbiddenDescription: 'Tài khoản {role} không mở được màn này. Quay về màn chính của bạn hoặc liên hệ quản trị hệ thống.',
} as const
