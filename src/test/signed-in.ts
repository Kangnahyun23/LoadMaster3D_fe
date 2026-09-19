import { DEMO_ACCOUNTS, SEED_ANCHOR_DATE } from '@/lib/mock-db'
import { seedUsers } from '@/lib/mock-db/seed-users'
import type { Role } from '@/types/user'

/**
 * Ghi phiên của tài khoản demo theo vai trò vào `sessionStorage`, như sau khi đăng nhập; `AuthProvider` đọc khi mount và kho
 * xác nhận lại phiên.
 */
export function signedInAs(role: Role) {
  const account = DEMO_ACCOUNTS.find((item) => item.role === role)
  const user = seedUsers(SEED_ANCHOR_DATE).find((item) => item.id === account?.id)
  if (!user) throw new Error(`Không có tài khoản demo cho vai trò ${role}`)
  sessionStorage.setItem('loadmaster.phien', JSON.stringify(user))
  return user
}
