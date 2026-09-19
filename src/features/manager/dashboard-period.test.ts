import { expect, test } from 'vitest'
import { daysOf, readPeriodSelection, resolvePeriod } from './dashboard-period'

/** Mốc: 14/09/2026 (ngày neo của seed). Khoảng ngày kỳ vọng đếm tay trên lịch. */
const TODAY = '2026-09-14'

test('7 ngày và 30 ngày tính lùi từ hôm nay, gồm cả hôm nay', () => {
  expect(resolvePeriod({ preset: '7-ngay', from: '', to: '' }, TODAY)).toStrictEqual({ from: '2026-09-08', to: '2026-09-14' })
  // 14 − 29 ngày: 13 ngày về 01/09, thêm 16 ngày về 16/08
  expect(resolvePeriod({ preset: '30-ngay', from: '', to: '' }, TODAY)).toStrictEqual({ from: '2026-08-16', to: '2026-09-14' })
})

test('tháng này là trọn tháng lịch, kể cả ngày chưa tới', () => {
  expect(resolvePeriod({ preset: 'thang-nay', from: '', to: '' }, TODAY)).toStrictEqual({ from: '2026-09-01', to: '2026-09-30' })
  expect(resolvePeriod({ preset: 'thang-nay', from: '', to: '' }, '2026-02-10')).toStrictEqual({ from: '2026-02-01', to: '2026-02-28' })
  expect(resolvePeriod({ preset: 'thang-nay', from: '', to: '' }, '2028-02-29')).toStrictEqual({ from: '2028-02-01', to: '2028-02-29' })
  expect(resolvePeriod({ preset: 'thang-nay', from: '', to: '' }, '2026-12-31')).toStrictEqual({ from: '2026-12-01', to: '2026-12-31' })
})

test('tuỳ chọn: giữ hai đầu hợp lệ, đảo khi ngược, đầu thiếu hoặc sai lấy theo 30 ngày', () => {
  expect(resolvePeriod({ preset: 'tuy-chon', from: '2026-08-01', to: '2026-08-31' }, TODAY)).toStrictEqual({ from: '2026-08-01', to: '2026-08-31' })
  expect(resolvePeriod({ preset: 'tuy-chon', from: '2026-08-31', to: '2026-08-01' }, TODAY)).toStrictEqual({ from: '2026-08-01', to: '2026-08-31' })
  expect(resolvePeriod({ preset: 'tuy-chon', from: '', to: '2026-09-10' }, TODAY)).toStrictEqual({ from: '2026-08-16', to: '2026-09-10' })
  expect(resolvePeriod({ preset: 'tuy-chon', from: '2026-02-30', to: '' }, TODAY)).toStrictEqual({ from: '2026-08-16', to: '2026-09-14' })
  expect(resolvePeriod({ preset: 'tuy-chon', from: '202026-09-01', to: '' }, TODAY)).toStrictEqual({ from: '2026-08-16', to: '2026-09-14' })
})

test('mọi ngày của kỳ, qua ranh giới tháng', () => {
  expect(daysOf({ from: '2026-08-30', to: '2026-09-02' })).toStrictEqual(['2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02'])
  expect(daysOf({ from: '2026-09-14', to: '2026-09-14' })).toStrictEqual(['2026-09-14'])
})

test('đọc kỳ từ URL: vắng hoặc lạ là 30 ngày, giữ hai đầu của tuỳ chọn', () => {
  expect(readPeriodSelection(new URLSearchParams(''))).toStrictEqual({ preset: '30-ngay', from: '', to: '' })
  expect(readPeriodSelection(new URLSearchParams('ky=7-ngay'))).toStrictEqual({ preset: '7-ngay', from: '', to: '' })
  expect(readPeriodSelection(new URLSearchParams('ky=nam-nay'))).toStrictEqual({ preset: '30-ngay', from: '', to: '' })
  expect(readPeriodSelection(new URLSearchParams('ky=tuy-chon&tu=2026-08-01&den=2026-08-31')))
    .toStrictEqual({ preset: 'tuy-chon', from: '2026-08-01', to: '2026-08-31' })
})
