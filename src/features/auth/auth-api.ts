import type { User } from '@/types/user'
import { DEMO_PASSWORD, findDemoUser } from './auth.mock'

/**
 * Lớp gọi API xác thực. Backend Spring Boot chưa có nên ở đây đối chiếu với
 * danh sách tài khoản mẫu; khi nối thật chỉ thay thân hàm, phần còn lại của
 * app không đổi.
 */

const NETWORK_DELAY_MS = 600

export class AuthError extends Error {}

export async function login(email: string, password: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  const user = findDemoUser(email)
  // Thông báo chung cho cả hai trường hợp, không tiết lộ email nào có thật.
  if (!user || password !== DEMO_PASSWORD) {
    throw new AuthError('Email hoặc mật khẩu không đúng')
  }
  if (user.status === 'suspended') {
    throw new AuthError('Tài khoản đã bị khoá. Liên hệ quản trị hệ thống.')
  }
  return user
}

export async function logout(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150))
}
