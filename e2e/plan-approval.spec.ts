import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { closeInspector, openInspector } from './viewer-helpers'

/**
 * Planner đọc revision thật và Duyệt (LM-049, LM-050): chỉ số, Duyệt tạo revision approved mới, kết quả lỗi thời chặn Duyệt.
 * Kho sửa trong trình duyệt qua đúng module app đang dùng; chuyển route phía client để không mất kho trong bộ nhớ.
 */
const TRIP_ID = 'TRIP-2026-0914'
const PLANNER = `/chuyen/${TRIP_ID}/phuong-an`
const MOCK_DB = '/src/lib/mock-db/index.ts'

function revisionCount(page: Page) {
  return page.evaluate(async ({ url, tripId }) => {
    const { getMockDb } = (await import(url)) as typeof import('@/lib/mock-db')
    return (await getMockDb().listRevisions(tripId)).length
  }, { url: MOCK_DB, tripId: TRIP_ID })
}

test('approving the seed plan creates a new approved revision and reopens it', async ({ page, login, browserErrors }) => {
  await login(PLANNER)
  await page.locator('canvas').waitFor()
  const header = page.locator('header').first()
  await expect(header).toContainText('MOCK RESULT')
  await expect(header).toContainText('Đã duyệt')

  // Tab Chỉ số: số lấy thẳng từ `result.metrics` của revision seed
  const inspector = await openInspector(page, 'metrics')
  await expect(inspector).toContainText('Chỉ số phương án')
  await expect(inspector).toContainText('Kiện đã xếp132')
  await closeInspector(page)

  const before = await revisionCount(page)
  await page.getByRole('button', { name: 'Duyệt phương án', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Duyệt phương án này?' })
  await expect(dialog).toContainText('Không có chỉnh tay.')
  await dialog.getByRole('button', { name: 'Duyệt', exact: true }).click()
  await expect(page.getByText('Đã duyệt phương án.')).toBeVisible()
  await page.waitForURL(/\/phuong-an\?revision=/)
  expect(await revisionCount(page)).toBe(before + 1)
  expect(browserErrors).toStrictEqual([])
})

test('changing cargo after optimisation marks the plan stale and blocks approval', async ({ page, login }) => {
  // Sửa kho trước khi Planner đọc (Query giữ dữ liệu 30 s).
  await login('/doi-xe')
  await page.evaluate(async ({ url, tripId }) => {
    const { getMockDb } = (await import(url)) as typeof import('@/lib/mock-db')
    const db = getMockDb()
    const trip = await db.getTrip(tripId)
    await db.updateTrip(tripId, { packages: trip.packages.map((pkg, i) => i === 0 ? { ...pkg, weightKg: pkg.weightKg + 1 } : pkg) })
  }, { url: MOCK_DB, tripId: TRIP_ID })
  await page.evaluate((route) => { history.pushState({}, '', route); window.dispatchEvent(new PopStateEvent('popstate')) }, PLANNER)

  await expect(page.getByRole('alert').filter({ hasText: 'Kết quả đã lỗi thời' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Tới Thiết lập tối ưu' })).toHaveAttribute('href', `/chuyen/${TRIP_ID}/toi-uu`)
  await page.getByRole('button', { name: 'Duyệt phương án', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Duyệt phương án này?' })
  await expect(dialog).toContainText('Kết quả lỗi thời — chạy tối ưu lại trước khi duyệt.')
  await expect(dialog.getByRole('button', { name: 'Duyệt', exact: true })).toBeDisabled()
})
