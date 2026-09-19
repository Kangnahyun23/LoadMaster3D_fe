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
} as const
