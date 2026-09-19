import { getMockDb, type NewUser, type TemporaryPassword, type UserChanges } from '@/lib/mock-db'
import type { User, UserStatus } from '@/types/user'

/**
 * Lớp gọi API của màn Người dùng (LM-092, D-42) — nơi duy nhất trong màn biết về kho. Kho kiểm luật (email trùng, tự khoá/xoá mình,
 * quản trị viên cuối, tài xế còn chuyến) và từ chối bằng `MockDbError`; màn hiện lỗi qua `dataErrorMessage`. Mọi hàm ghi thêm một
 * sự kiện nhật ký. Nối backend thật chỉ thay thân hàm.
 */

export function fetchUsers(): Promise<User[]> {
  return getMockDb().listUsers()
}

/** Kho cấp mã, trạng thái hoạt động và mật khẩu tạm — mật khẩu chỉ có trong kết quả này. */
export function createUser(input: NewUser): Promise<TemporaryPassword> {
  return getMockDb().createUser(input)
}

export function updateUser(id: string, changes: UserChanges): Promise<User> {
  return getMockDb().updateUser(id, changes)
}

export function setUserStatus(id: string, status: UserStatus): Promise<User> {
  return getMockDb().setUserStatus(id, status)
}

export function deleteUser(id: string): Promise<void> {
  return getMockDb().deleteUser(id)
}

/** Mật khẩu cũ hết hiệu lực ngay; mật khẩu tạm mới chỉ trả về một lần. */
export function resetPassword(id: string): Promise<TemporaryPassword> {
  return getMockDb().resetPassword(id)
}
