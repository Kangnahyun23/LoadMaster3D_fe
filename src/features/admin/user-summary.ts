import type { User } from '@/types/user'

export type UserSummary = {
  readonly total: number
  readonly active: number
  readonly suspended: number
}

/**
 * Số của ba ô trên đầu màn Người dùng (V2): đếm trên **toàn bộ** danh sách từ kho, không theo ô tìm hay bộ lọc — ô số liệu nói
 * về hệ thống, bảng mới nói về kết quả lọc.
 */
export function userSummary(users: readonly Pick<User, 'status'>[]): UserSummary {
  const active = users.filter((user) => user.status === 'active').length
  return { total: users.length, active, suspended: users.length - active }
}
