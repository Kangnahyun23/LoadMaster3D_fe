import { expect, test } from 'vitest'
import type { User } from '@/types/user'
import { accountGuards } from './account-guards'

/** Thao tác bị chặn trước khi gửi kho, kèm lý do (LM-092): tự khoá/xoá/đổi vai trò mình, quản trị viên hoạt động cuối cùng. */
type Account = Pick<User, 'id' | 'role' | 'status'>

const admin = (id: string, status: User['status'] = 'active'): Account => ({ id, role: 'admin', status })
const driver: Account = { id: 'US-0004', role: 'driver', status: 'active' }

test('chính mình: không khoá, không xoá, không đổi vai trò', () => {
  expect(accountGuards(driver, 'US-0004', [driver])).toStrictEqual({ lock: 'self', remove: 'self', role: 'self' })
})

test('quản trị viên đang hoạt động cuối cùng không bị khoá, xoá hay hạ vai trò', () => {
  const only = admin('US-0005')
  const locked = admin('US-0020', 'suspended')
  // Người xem là quản trị viên khác đã bị khoá phiên (hàm thuần: chỉ xét dữ liệu)
  expect(accountGuards(only, 'US-0001', [only, locked, driver])).toStrictEqual({ lock: 'lastAdmin', remove: 'lastAdmin', role: 'lastAdmin' })
})

test('còn quản trị viên hoạt động khác, hoặc tài khoản thường: không chặn', () => {
  const first = admin('US-0005')
  const second = admin('US-0013')
  expect(accountGuards(second, 'US-0005', [first, second])).toStrictEqual({ lock: null, remove: null, role: null })
  expect(accountGuards(driver, 'US-0005', [first, driver])).toStrictEqual({ lock: null, remove: null, role: null })
  // Quản trị viên đã khoá không phải "đang hoạt động cuối cùng"
  expect(accountGuards(admin('US-0020', 'suspended'), 'US-0005', [first, admin('US-0020', 'suspended')]))
    .toStrictEqual({ lock: null, remove: null, role: null })
})
