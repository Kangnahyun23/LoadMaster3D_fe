/** Năm vai trò trong hệ thống (CLAUDE.md mục 1). */
export type Role = 'dispatcher' | 'warehouse' | 'driver' | 'manager' | 'admin'

export const ROLE_LABELS: Record<Role, string> = {
  dispatcher: 'Điều phối viên',
  warehouse: 'Nhân viên kho',
  driver: 'Tài xế',
  manager: 'Quản lý',
  admin: 'Quản trị hệ thống',
}

/** Thiết bị chính của từng vai trò — quyết định màn hình mặc định sau đăng nhập. */
export const ROLE_DEVICES: Record<Role, string> = {
  dispatcher: 'Máy tính',
  warehouse: 'Máy tính bảng tại kho',
  driver: 'Điện thoại',
  manager: 'Máy tính / máy tính bảng',
  admin: 'Máy tính',
}

export type UserStatus = 'active' | 'suspended'

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Đang hoạt động',
  suspended: 'Đã khoá',
}

export type User = {
  id: string
  fullName: string
  email: string
  phone: string
  role: Role
  status: UserStatus
  /** Kho hoặc chi nhánh người dùng trực thuộc */
  depot: string
  /** ISO 8601; null khi chưa đăng nhập lần nào */
  lastActiveAt: string | null
}

/** Chữ viết tắt hiển thị trên nav rail: lấy chữ cái đầu của hai từ cuối. */
export function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const picked = parts.slice(-2)
  return picked.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?'
}
