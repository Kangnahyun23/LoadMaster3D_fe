import type { MockDbErrorCode } from '@/lib/mock-db/errors'

/**
 * Câu cho mã lỗi của kho dữ liệu (`MockDbError`, LM-081, LM-082), key trùng mã, tham số trùng tên tham số của mã (mảng nối bằng
 * dấu phẩy). Chỉ gọi qua `dataErrorMessage`. Thêm mã vào kho mà chưa có câu thì `tsc -b` báo lỗi ở đây.
 */
export const dataErrors = {
  NOT_FOUND: 'Không tìm thấy {id}.',
  VEHICLE_IN_USE: 'Xe {vehicleId} còn gắn với chuyến {tripIds} nên không xoá được.',
  VEHICLE_LOCKED: 'Xe {vehicleId} đang chạy chuyến {tripId} nên chưa sửa được.',
  VEHICLE_IN_MAINTENANCE: 'Xe {vehicleId} đang bảo dưỡng, hãy chọn xe khác.',
  REVISION_STALE: 'Phương án {revisionId} đã lỗi thời: xe hoặc kiện đã đổi sau lần tối ưu.',
  REVISION_NOT_COMPLETED: 'Phương án {revisionId} chưa hoàn tất nên không duyệt được.',
  PATCH_UNKNOWN_INSTANCE: 'Kiện {packageInstanceId} không có trong phương án.',
  TRIP_LOCKED: 'Chuyến {tripId} đã sang giai đoạn vận hành nên không sửa được.',
  TRIP_PHASE_INVALID: 'Thao tác này không làm được ở trạng thái hiện tại của chuyến {tripId}.',
  NO_APPROVED_REVISION: 'Chuyến {tripId} chưa có phương án đã duyệt.',
  INSTANCE_NOT_IN_PLAN: 'Kiện {packageInstanceId} không thuộc phương án hoặc điểm giao này.',
  INSTANCE_NOT_LOADED: 'Kiện {packageInstanceId} đã báo thiếu ở kho, không có trên xe.',
  LOADING_INCOMPLETE: 'Còn {remaining} kiện chưa có kết quả xếp.',
  STOP_INCOMPLETE: 'Điểm {stopNumber} còn {remaining} kiện chưa dỡ hoặc chưa báo sự cố.',
  STOP_NOT_CURRENT: 'Điểm {stopNumber} chưa phải điểm giao hiện tại.',
  REASON_REQUIRED: 'Cần ghi lý do.',
  DRIVER_INVALID: 'Người được chọn không phải tài xế đang hoạt động.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  ACCOUNT_SUSPENDED: 'Tài khoản đã bị khoá.',
  NOT_SIGNED_IN: 'Phiên đăng nhập đã hết, hãy đăng nhập lại.',
  EMAIL_TAKEN: 'Email {email} đã có người dùng.',
  SELF_CHANGE_FORBIDDEN: 'Không thể tự khoá, tự xoá hoặc tự đổi vai trò của chính mình.',
  LAST_ADMIN: 'Hệ thống cần ít nhất một quản trị viên đang hoạt động.',
  USER_IN_USE: 'Tài xế này đang được gán cho chuyến {tripIds}.',
  PASSWORD_INCORRECT: 'Mật khẩu hiện tại không đúng.',
  PASSWORD_TOO_SHORT: 'Mật khẩu mới cần ít nhất {min} ký tự.',
  /** Lỗi không phải của kho (mất mạng, lỗi lập trình). */
  UNKNOWN: 'Có lỗi xảy ra. Thử lại sau.',
} as const satisfies Record<MockDbErrorCode | 'UNKNOWN', string>
