import { expect, test } from 'vitest'
import { ROLES } from '@/types/user'
import { can, PERMISSIONS, ROLE_PERMISSIONS } from './permissions'

test('the admin has every permission; nobody else has users or audit (D-41)', () => {
  expect(PERMISSIONS.every((permission) => can('admin', permission))).toBe(true)
  for (const role of ROLES.filter((item) => item !== 'admin')) {
    expect(can(role, 'users.manage'), role).toBe(false)
    expect(can(role, 'audit.view'), role).toBe(false)
  }
})

test('the manager reads and exports but writes nothing', () => {
  expect(ROLE_PERMISSIONS.manager.filter((permission) => /\.(edit|run|approve|operate)$/.test(permission))).toStrictEqual([])
  expect(can('manager', 'reports.export')).toBe(true)
  expect(can('manager', 'trips.view')).toBe(true)
})

test('warehouse staff and drivers only operate their own screen', () => {
  expect(ROLE_PERMISSIONS.warehouse).toStrictEqual(['warehouse.operate'])
  expect(ROLE_PERMISSIONS.driver).toStrictEqual(['driver.operate'])
  expect(can(undefined, 'trips.view')).toBe(false)
})
