import { expect, test } from 'vitest'
import { createFormatter } from '@/lib/format'
import { createTranslator } from '@/lib/i18n'
import type { AuditAction, AuditEvent, AuditTargetType } from '@/lib/mock-db'
import { describeEvent, type AuditDirectory } from './audit-log'

/** Cách đọc một sự kiện nhật ký (LM-091, D-43): kho chỉ lưu mã và tham số, màn dịch và format theo ngôn ngữ. */
const vi = { t: createTranslator('vi'), format: createFormatter('vi-VN') }
const en = { t: createTranslator('en'), format: createFormatter('en-US') }

const DIRECTORY: AuditDirectory = {
  users: new Map([['US-0001', 'Nguyễn Thanh Tùng'], ['US-0010', 'Trương Văn Lộc']]),
  trips: new Map([['TRIP-004', 'Tuyến Tân An – Biên Hoà']]),
  vehicles: new Map([['VEHICLE-008', 'Hyundai Mighty EX8 · 50H-118.29']]),
}

function event(
  action: AuditAction,
  target: { type: AuditTargetType; id: string },
  params: Record<string, string | number> = {},
  actorId: string | null = 'US-0001',
): AuditEvent {
  return { id: 'EV-000200', at: '2026-09-13T11:05:00.000Z', actorId, action, target, params }
}

function describe(value: AuditEvent, { t, format } = vi) {
  return describeEvent(value, DIRECTORY, t, format)
}

test('huỷ chuyến: người làm, hành động, chuyến dẫn tới chi tiết và lý do người dùng nhập', () => {
  expect(describe(event('trip.cancelled', { type: 'trip', id: 'TRIP-004' }, { reason: 'Khách hoãn nhận hàng' }))).toStrictEqual({
    id: 'EV-000200',
    at: '2026-09-13T11:05:00.000Z',
    actorId: 'US-0001',
    actor: 'Nguyễn Thanh Tùng',
    action: 'Huỷ chuyến',
    target: { id: 'TRIP-004', label: 'Tuyến Tân An – Biên Hoà', href: '/chuyen/TRIP-004' },
    details: 'Lý do: Khách hoãn nhận hàng',
  })
})

test('số trong tham số theo định dạng của ngôn ngữ', () => {
  const saved = event('optimization.saved', { type: 'trip', id: 'TRIP-004' }, { revisionId: 'REV-031', placed: 1320, unplaced: 0 })
  expect(describe(saved).details).toBe('Phương án: REV-031 · Xếp được: 1.320 · Không xếp được: 0')
  expect(describe(saved, en).details).toBe('Plan: REV-031 · Placed: 1,320 · Not placed: 0')
  expect(describe(saved, en).action).toBe('Saved optimization result')
})

test('mã trong tham số được dịch: tên trường, loại sự cố, vai trò, lý do khoá', () => {
  const edited = event('trip.updated', { type: 'trip', id: 'TRIP-004' }, { fields: 'packages,scheduledDate' })
  expect(describe(edited).details).toBe('Trường đã sửa: Kiện hàng và Ngày chạy')
  expect(describe(edited, en).details).toBe('Fields changed: Packages and Scheduled date')

  const issue = event('delivery.issue', { type: 'trip', id: 'TRIP-004' }, { kind: 'refused', stopNumber: 2, packageInstanceId: 'PKG-003-11' })
  expect(describe(issue).details).toBe('Loại sự cố: Khách từ chối nhận · Điểm giao: 2 · Kiện: PKG-003-11')

  const created = event('user.created', { type: 'user', id: 'US-0010' }, { fullName: 'Trương Văn Lộc', role: 'driver' }, 'US-0005')
  expect(describe(created)).toMatchObject({
    actor: 'Tài khoản đã xoá (US-0005)',
    target: { id: 'US-0010', label: 'Trương Văn Lộc', href: '/nguoi-dung?q=US-0010' },
    details: 'Họ tên: Trương Văn Lộc · Vai trò: Tài xế',
  })

  const locked = event('auth.signInFailed', { type: 'user', id: 'US-0010' }, { email: 'loc.truong@loadmaster.vn', reason: 'suspended' }, null)
  expect(describe(locked).details).toBe('Email: loc.truong@loadmaster.vn · Lý do: Tài khoản đã bị khoá')
})

test('không có phiên: đăng nhập sai là "Chưa đăng nhập", việc khác là "Hệ thống"; email lạ không có liên kết', () => {
  const failed = event('auth.signInFailed', { type: 'user', id: 'khong.co@loadmaster.vn' }, { email: 'khong.co@loadmaster.vn' }, null)
  expect(describe(failed)).toMatchObject({
    actor: 'Chưa đăng nhập',
    action: 'Đăng nhập không thành công',
    target: { id: 'khong.co@loadmaster.vn', label: null, href: null },
  })
  expect(describe(event('vehicle.maintenanceOff', { type: 'vehicle', id: 'VEHICLE-008' }, {}, null))).toMatchObject({
    actor: 'Hệ thống',
    target: { label: 'Hyundai Mighty EX8 · 50H-118.29', href: '/doi-xe/VEHICLE-008' },
    details: '',
  })
})

test('đối tượng đã xoá khỏi kho: giữ tên trong tham số, không dẫn tới trang không còn', () => {
  expect(describe(event('vehicle.deleted', { type: 'vehicle', id: 'VEHICLE-009' }, { name: 'Isuzu QKR · 51C-000.01' })).target)
    .toStrictEqual({ id: 'VEHICLE-009', label: 'Isuzu QKR · 51C-000.01', href: null })
  expect(describe(event('user.deleted', { type: 'user', id: 'US-0013' }, { fullName: 'Mai Văn Phúc' })).target)
    .toStrictEqual({ id: 'US-0013', label: 'Mai Văn Phúc', href: null })
  // Tham số chưa có nhãn vẫn hiện, theo đúng tên kho ghi
  expect(describe(event('trip.created', { type: 'trip', id: 'TRIP-004' }, { source: 'csv' })).details).toBe('source: csv')
})
