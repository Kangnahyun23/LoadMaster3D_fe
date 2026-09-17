import { DEMO_USERS } from '@/features/auth/auth.mock'
import type { Role } from '@/types/user'

/** Ghi phiên của tài khoản demo theo vai trò vào `sessionStorage`, như sau khi đăng nhập; `AuthProvider` đọc khi mount. */
export function signedInAs(role: Role) {
  const user = DEMO_USERS.find((item) => item.role === role)
  if (!user) throw new Error(`Không có tài khoản demo cho vai trò ${role}`)
  sessionStorage.setItem('loadmaster.phien', JSON.stringify(user))
  return user
}
