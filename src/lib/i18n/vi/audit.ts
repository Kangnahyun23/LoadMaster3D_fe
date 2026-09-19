import type { AuditActionLabels, AuditGroup } from '@/lib/mock-db/audit'

/**
 * Nhật ký hệ thống (D-43): nhãn cho mã hành động của kho (`AUDIT_ACTIONS`) và nhóm lọc. Màn `/nhat-ky` (LM-091) và chuông thông
 * báo (LM-098) tra `audit.actions.<mã>`; tham số của sự kiện hiện riêng, không ghép vào câu.
 */
export const audit = {
  actions: {
    auth: { signedIn: 'Đăng nhập', signedOut: 'Đăng xuất', signInFailed: 'Đăng nhập không thành công' },
    vehicle: { created: 'Thêm xe', updated: 'Sửa cấu hình xe', deleted: 'Xoá xe', maintenanceOn: 'Đưa xe vào bảo dưỡng', maintenanceOff: 'Kết thúc bảo dưỡng xe' },
    trip: { created: 'Tạo chuyến', updated: 'Sửa chuyến', cancelled: 'Huỷ chuyến' },
    optimization: { saved: 'Lưu kết quả tối ưu' },
    revision: { approved: 'Duyệt phương án' },
    loading: { started: 'Bắt đầu xếp hàng', missing: 'Báo thiếu kiện ở kho', completed: 'Xếp xong' },
    delivery: { started: 'Xuất phát giao hàng', issue: 'Báo sự cố giao hàng', stopCompleted: 'Hoàn tất điểm giao', completed: 'Hoàn thành chuyến' },
    user: {
      created: 'Tạo tài khoản', updated: 'Sửa tài khoản', locked: 'Khoá tài khoản', unlocked: 'Mở khoá tài khoản', deleted: 'Xoá tài khoản',
      passwordReset: 'Đặt lại mật khẩu', passwordChanged: 'Đổi mật khẩu', profileUpdated: 'Sửa hồ sơ cá nhân',
    },
  } satisfies AuditActionLabels,
  groups: {
    auth: 'Đăng nhập',
    vehicle: 'Đội xe',
    trip: 'Chuyến',
    optimization: 'Tối ưu',
    revision: 'Duyệt',
    loading: 'Kho',
    delivery: 'Giao hàng',
    user: 'Người dùng',
  } satisfies Record<AuditGroup, string>,
  /** Màn `/nhat-ky` (LM-091): bảng, bộ lọc và cách đọc tham số của sự kiện. */
  log: {
    title: 'Nhật ký hệ thống',
    count: { one: '{count} sự kiện', other: '{count} sự kiện' },
    loading: 'Đang tải nhật ký…',
    errorTitle: 'Không tải được nhật ký',
    errorDescription: 'Kho dữ liệu không trả lời. Thử lại sau giây lát.',
    retry: 'Thử lại',
    empty: 'Chưa có sự kiện nào.',
    noMatch: 'Không có sự kiện khớp bộ lọc.',
    search: 'Tìm theo mã chuyến, xe, người dùng',
    dateRange: 'Khoảng ngày',
    actor: 'Người làm',
    allActors: 'Mọi người',
    group: 'Nhóm hành động',
    allGroups: 'Mọi nhóm',
    columns: { at: 'Thời điểm', actor: 'Người làm', action: 'Hành động', target: 'Đối tượng', details: 'Chi tiết' },
    /** Ngày giờ ghép từ hai phần đã format theo ngôn ngữ. */
    dateTime: '{time} {date}',
    /** Sự kiện không có phiên: hệ thống tự ghi, hoặc đăng nhập sai khi chưa có ai đăng nhập. */
    system: 'Hệ thống',
    anonymous: 'Chưa đăng nhập',
    deletedUser: 'Tài khoản đã xoá ({id})',
    /** Một cặp tham số trong cột Chi tiết; các cặp nối bằng dấu chấm giữa. */
    detail: '{label}: {value}',
    /** Nhãn tham số của sự kiện, key trùng tên tham số kho ghi. */
    params: {
      name: 'Tên',
      fullName: 'Họ tên',
      role: 'Vai trò',
      email: 'Email',
      fields: 'Trường đã sửa',
      reason: 'Lý do',
      note: 'Ghi chú',
      revisionId: 'Phương án',
      sourceRevisionId: 'Duyệt từ',
      placed: 'Xếp được',
      unplaced: 'Không xếp được',
      edits: 'Kiện chỉnh tay',
      loaded: 'Đã lên xe',
      missing: 'Thiếu ở kho',
      packageInstanceId: 'Kiện',
      stopNumber: 'Điểm giao',
      kind: 'Loại sự cố',
      stops: 'Số điểm giao',
      issues: 'Sự cố',
    },
    /** Giá trị của tham số `fields`: tên trường chuyến hoặc tài khoản đã sửa. */
    fieldNames: {
      name: 'Tên chuyến',
      vehicleId: 'Xe',
      stops: 'Điểm giao',
      packages: 'Kiện hàng',
      scheduledDate: 'Ngày chạy',
      driverId: 'Tài xế',
      fullName: 'Họ tên',
      email: 'Email',
      phone: 'Số điện thoại',
      role: 'Vai trò',
      depot: 'Kho / chi nhánh',
    },
    /** Giá trị của tham số `kind` (sự cố giao hàng, D-47). */
    issueKinds: { damaged: 'Hàng hỏng', missing: 'Thiếu hàng', refused: 'Khách từ chối nhận', other: 'Khác' },
    /** Mã lý do đăng nhập không thành công. */
    reasons: { suspended: 'Tài khoản đã bị khoá' },
  },
} as const
