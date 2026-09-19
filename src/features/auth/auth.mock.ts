import { DEMO_ACCOUNTS, SEED_PASSWORD } from '@/lib/mock-db'
import type { Role } from '@/types/user'

/**
 * Tài khoản dùng thử hiện ở màn đăng nhập khi còn chạy kho mock: mỗi vai trò một tài khoản seed, chung một mật khẩu.
 * Người dùng và mật khẩu thật nằm trong kho (`@/lib/mock-db`, D-42) — tài khoản quản trị tạo mới cũng đăng nhập được.
 */
export const DEMO_PASSWORD = SEED_PASSWORD

export const DEMO_HINTS: ReadonlyArray<{ role: Role; email: string }> = DEMO_ACCOUNTS.map(({ role, email }) => ({ role, email }))
