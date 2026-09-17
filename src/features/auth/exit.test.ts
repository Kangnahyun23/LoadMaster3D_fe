import { expect, test } from 'vitest'
import { exitAction } from './exit'

test('a warehouse worker leaving the warehouse screen signs out instead of landing on dispatcher pages', () => {
  expect(exitAction('warehouse', '/kho', '/chuyen/TRIP-2026-0914')).toStrictEqual({ kind: 'signOut' })
})

test('a driver leaving the driver screen signs out', () => {
  expect(exitAction('driver', '/tai-xe/diem-giao')).toStrictEqual({ kind: 'signOut' })
})

test('a dispatcher returns to the trip the screen was opened from, or to the trip list', () => {
  expect(exitAction('dispatcher', '/kho', '/chuyen/TRIP-2026-0914')).toStrictEqual({ kind: 'link', to: '/chuyen/TRIP-2026-0914' })
  expect(exitAction('dispatcher', '/tai-xe/diem-giao')).toStrictEqual({ kind: 'link', to: '/chuyen' })
})

test('other roles return to their own screen', () => {
  expect(exitAction('manager', '/kho', '/chuyen/TRIP-2026-0914')).toStrictEqual({ kind: 'link', to: '/' })
  expect(exitAction('admin', '/tai-xe/diem-giao')).toStrictEqual({ kind: 'link', to: '/nguoi-dung' })
  expect(exitAction('warehouse', '/tai-xe/diem-giao')).toStrictEqual({ kind: 'link', to: '/kho' })
})
