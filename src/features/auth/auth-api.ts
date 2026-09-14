import type { User } from '@/types/user'
import { DEMO_PASSWORD, findDemoUser } from './auth.mock'

/**
 * Lớp gọi API xác thực. Backend Spring Boot chưa có nên ở đây đối chiếu với
 * danh sách tài khoản mẫu; khi nối thật chỉ thay thân hàm, phần còn lại của
 * app không đổi.
 */

const NETWORK_DELAY_MS = 600

/** Lỗi trả về dạng mã; màn đăng nhập dịch mã sang câu theo ngôn ngữ đang chọn. */
export type AuthErrorCode = 'invalid-credentials' | 'account-suspended'

export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode) {
    super(code)
    this.name = 'AuthError'
    this.code = code
  }
}

export async function login(email: string, password: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  const user = findDemoUser(email)
  // Một mã chung cho cả hai trường hợp, không tiết lộ email nào có thật.
  if (!user || password !== DEMO_PASSWORD) {
    throw new AuthError('invalid-credentials')
  }
  if (user.status === 'suspended') {
    throw new AuthError('account-suspended')
  }
  return user
}

export async function logout(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150))
}
