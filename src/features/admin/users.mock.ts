import { DEMO_USERS } from '@/features/auth/auth.mock'
import type { User } from '@/types/user'

/**
 * Danh sách người dùng cho màn quản trị: 5 tài khoản demo cộng thêm vài tài
 * khoản để thấy đủ trạng thái và vai trò trùng nhau.
 */
export const USERS: User[] = [
  ...DEMO_USERS,
  {
    id: 'US-0006',
    fullName: 'Ngô Văn Bảo',
    email: 'bao.ngo@loadmaster.vn',
    phone: '0906 789 012',
    role: 'driver',
    status: 'active',
    depot: 'Kho Long Bình',
    lastActiveAt: '2026-09-13T16:05:00+07:00',
  },
  {
    id: 'US-0007',
    fullName: 'Đặng Hoài Nam',
    email: 'nam.dang@loadmaster.vn',
    phone: '0907 890 123',
    role: 'driver',
    status: 'active',
    depot: 'Kho Sóng Thần',
    lastActiveAt: '2026-09-12T09:40:00+07:00',
  },
  {
    id: 'US-0008',
    fullName: 'Bùi Thị Lan',
    email: 'lan.bui@loadmaster.vn',
    phone: '0908 901 234',
    role: 'warehouse',
    status: 'suspended',
    depot: 'Kho Sóng Thần',
    lastActiveAt: '2026-08-28T11:15:00+07:00',
  },
  {
    id: 'US-0009',
    fullName: 'Hoàng Đức Anh',
    email: 'anh.hoang@loadmaster.vn',
    phone: '0909 012 345',
    role: 'dispatcher',
    status: 'active',
    depot: 'Kho Sóng Thần',
    lastActiveAt: null,
  },
]
