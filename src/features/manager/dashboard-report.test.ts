import { expect, test } from 'vitest'
import { createFormatter } from '@/lib/format'
import { createTranslator } from '@/lib/i18n'
import { DASHBOARD_PERIOD, dashboardData } from '@/test/dashboard-data'
import { reportSheets, type ReportSheet } from './dashboard-report'
import { summarizeDashboard } from './dashboard-summary'

/** Báo cáo .xlsx của bảng điều khiển (LM-090): ba sheet dựng từ đúng số của màn. Kho thu nhỏ: `src/test/dashboard-data.ts`. */
const EXPORTED_AT = new Date('2026-09-14T07:30:00.000Z')

function build(locale: 'vi' | 'en') {
  const summary = summarizeDashboard(dashboardData(), DASHBOARD_PERIOD)
  return reportSheets(summary, createTranslator(locale), createFormatter(locale === 'vi' ? 'vi-VN' : 'en-US'), EXPORTED_AT)
}

/** Giá trị của từng ô, bỏ định dạng. */
function values(sheet: ReportSheet | undefined) {
  return (sheet?.data ?? []).map((row) =>
    row.map((cell) => (cell !== null && typeof cell === 'object' && !(cell instanceof Date) && 'value' in cell ? cell.value : cell)))
}

test('ba sheet Tổng quan, Chuyến, Theo xe theo ngôn ngữ đang chọn', () => {
  expect(build('vi').map((sheet) => sheet.sheet)).toStrictEqual(['Tổng quan', 'Chuyến', 'Theo xe'])
  expect(build('en').map((sheet) => sheet.sheet)).toStrictEqual(['Overview', 'Trips', 'By vehicle'])
})

test('Tổng quan có kỳ, giờ xuất và đúng số KPI của màn, kèm ghi chú MOCK RESULT', () => {
  const rows = values(build('vi')[0])
  expect(rows[1]).toStrictEqual(['Kỳ', '08/09/2026 – 14/09/2026'])
  // 07:30 UTC là 14:30 giờ Việt Nam; test chạy với TZ của máy nên chỉ so ngày
  expect(rows[2]?.[0]).toBe('Xuất lúc')
  const metric = (label: string) => rows.find((row) => row[0] === label)?.slice(1, 3)
  expect(metric('Chuyến trong kỳ')).toStrictEqual([7, 'chuyến'])
  expect(metric('Chuyến hoàn thành')).toStrictEqual([2, 'chuyến'])
  expect(metric('Lấp đầy thể tích trung bình')).toStrictEqual([45, '%'])
  expect(metric('Khối lượng đã giao')).toStrictEqual([96, 'kg'])
  expect(metric('Kiện giao không sự cố')).toStrictEqual([70, '%'])
  expect(metric('Xe đang phục vụ chuyến')).toStrictEqual([1, 'xe'])
  expect(rows.some((row) => row[0] === 'MOCK RESULT')).toBe(true)
})

test('sheet Chuyến: một dòng mỗi chuyến trong kỳ, ngày chạy mới nhất trước', () => {
  const rows = values(build('vi')[1])
  expect(rows[0]).toStrictEqual([
    'Mã chuyến', 'Tên chuyến', 'Ngày chạy', 'Xe', 'Tài xế', 'Trạng thái', 'Số kiện', 'Khối lượng hàng (kg)',
    'Lấp đầy thể tích bản duyệt (%)', 'Khối lượng đã giao (kg)', 'Sự cố giao',
  ])
  expect(rows.slice(1).map((row) => row[0])).toStrictEqual(['TRIP-104', 'TRIP-105', 'TRIP-107', 'TRIP-102', 'TRIP-108', 'TRIP-101', 'TRIP-103'])
  expect(rows.find((row) => row[0] === 'TRIP-101')).toStrictEqual([
    'TRIP-101', 'Tuyến TRIP-101', new Date('2026-09-10T00:00:00.000Z'), 'Xe A', 'Phạm Quốc Dũng', 'Hoàn thành', 5, 70, 40, 50, 1,
  ])
  // Nháp: chưa có tài xế, chưa có tỷ lệ lấp đầy
  expect(rows.find((row) => row[0] === 'TRIP-105')).toStrictEqual([
    'TRIP-105', 'Tuyến TRIP-105', new Date('2026-09-14T00:00:00.000Z'), 'Xe C', null, 'Nháp', 1, 12, null, 0, 0,
  ])
})

test('sheet Theo xe: xe có chuyến trong kỳ, khối lượng đã giao giảm dần', () => {
  expect(values(build('vi')[2])).toStrictEqual([
    ['Mã xe', 'Tên xe', 'Số chuyến', 'Khối lượng đã giao (kg)', 'Lấp đầy trung bình (%)'],
    ['VEHICLE-A', 'Xe A', 3, 80, 50],
    ['VEHICLE-B', 'Xe B', 3, 16, 40],
    ['VEHICLE-C', 'Xe C', 1, 0, null],
  ])
})
