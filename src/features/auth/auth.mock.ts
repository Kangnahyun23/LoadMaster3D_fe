import type { Role, User } from '@/types/user'

/**
 * Tài khoản mẫu, mỗi vai trò một người — dùng để thử luồng phân quyền khi
 * chưa có backend. Mọi tài khoản dùng chung mật khẩu bên dưới.
 */
export const DEMO_PASSWORD = 'loadmaster'

export const DEMO_USERS: User[] = [
  {
    id: 'US-0001',
    fullName: 'Nguyễn Thanh Tùng',
    email: 'dieuphoi@loadmaster.vn',
    phone: '0901 234 567',
    role: 'dispatcher',
    status: 'active',
    depot: 'Kho Long Bình',
    lastActiveAt: '2026-09-14T08:12:00+07:00',
  },
  {
    id: 'US-0002',
    fullName: 'Trần Thị Mai',
    email: 'quanly@loadmaster.vn',
    phone: '0902 345 678',
    role: 'manager',
    status: 'active',
    depot: 'Trụ sở TP. Hồ Chí Minh',
    lastActiveAt: '2026-09-14T07:45:00+07:00',
  },
  {
    id: 'US-0003',
    fullName: 'Lê Văn Hải',
    email: 'kho@loadmaster.vn',
    phone: '0903 456 789',
    role: 'warehouse',
    status: 'active',
    depot: 'Kho Long Bình',
    lastActiveAt: '2026-09-14T06:30:00+07:00',
  },
  {
    id: 'US-0004',
    fullName: 'Phạm Quốc Dũng',
    email: 'taixe@loadmaster.vn',
    phone: '0904 567 890',
    role: 'driver',
    status: 'active',
    depot: 'Kho Long Bình',
    lastActiveAt: '2026-09-14T05:50:00+07:00',
  },
  {
    id: 'US-0005',
    fullName: 'Võ Minh Khoa',
    email: 'quantri@loadmaster.vn',
    phone: '0905 678 901',
    role: 'admin',
    status: 'active',
    depot: 'Trụ sở TP. Hồ Chí Minh',
    lastActiveAt: '2026-09-13T17:20:00+07:00',
  },
]

/** Gợi ý hiển thị dưới form đăng nhập khi còn chạy dữ liệu mẫu. */
export const DEMO_HINTS: Array<{ role: Role; email: string }> = DEMO_USERS.map(
  (user) => ({ role: user.role, email: user.email }),
)

export function findDemoUser(email: string): User | undefined {
  const normalised = email.trim().toLowerCase()
  return DEMO_USERS.find((user) => user.email.toLowerCase() === normalised)
}
