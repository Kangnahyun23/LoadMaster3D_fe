import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

/**
 * Luồng Thiết lập tối ưu → chạy job (LM-047, LM-048): đang chạy, lỗi service, thành công, kết quả một phần, huỷ.
 * Dữ liệu sửa trong trình duyệt qua đúng module kho app đang dùng (`/src/lib/mock-db/index.ts`), không giả lập mạng.
 */
const TRIP_ID = 'TRIP-2026-0914'
const SETUP = `/chuyen/${TRIP_ID}/toi-uu`
const MOCK_DB = '/src/lib/mock-db/index.ts'

const optimize = (page: Page) => page.getByRole('button', { name: 'Tối ưu', exact: true })

function revisionCount(page: Page) {
  return page.evaluate(async ({ url, tripId }) => {
    const { getMockDb } = (await import(url)) as typeof import('@/lib/mock-db')
    return (await getMockDb().listRevisions(tripId)).length
  }, { url: MOCK_DB, tripId: TRIP_ID })
}

test('running shows real progress, then opens the new revision in the Planner', async ({ page, login, browserErrors }) => {
  await login(SETUP)
  await expect(optimize(page)).toBeEnabled()
  const before = await revisionCount(page)
  await optimize(page).click()
  await expect(page.getByRole('dialog', { name: 'Đang tối ưu phương án xếp hàng' })).toBeVisible()
  await page.waitForURL(/\/phuong-an\?revision=MOCK-/)
  expect(await revisionCount(page)).toBe(before + 1)
  await page.locator('canvas').waitFor()
  expect(browserErrors).toStrictEqual([])
})

test('cancelling returns to the setup screen without creating a revision', async ({ page, login }) => {
  await login(SETUP)
  const before = await revisionCount(page)
  await optimize(page).click()
  await page.getByRole('dialog', { name: 'Đang tối ưu phương án xếp hàng' }).getByRole('button', { name: 'Huỷ' }).click()
  await expect(page.getByText('Đã huỷ tối ưu; không tạo phương án mới.')).toBeVisible()
  await expect(page).toHaveURL(new RegExp(`${SETUP}$`))
  expect(await revisionCount(page)).toBe(before)
})

test('an unavailable service shows the error dialog with a working retry', async ({ page, login }) => {
  await login(`${SETUP}?mo-phong=loi`)
  await optimize(page).click()
  const dialog = page.getByRole('dialog', { name: 'Không chạy được tối ưu' })
  await expect(dialog).toContainText('Dịch vụ tối ưu không phản hồi')
  await dialog.getByRole('button', { name: 'Thử lại' }).click()
  await expect(page.getByRole('dialog', { name: 'Không chạy được tối ưu' })).toBeVisible()
})

test('cargo that does not all fit gives a partial result notice and still opens the plan', async ({ page, login }) => {
  // Sửa kho trước khi màn thiết lập đọc (Query giữ dữ liệu 30 s); app ghi thật thì mutation tự làm mới.
  await login('/doi-xe')
  await page.evaluate(async ({ url, tripId }) => {
    const { getMockDb } = (await import(url)) as typeof import('@/lib/mock-db')
    const db = getMockDb()
    const trip = await db.getTrip(tripId)
    const bulky = { ...trip.packages[0]!, id: 'PKG-950', name: 'Kiện dư', quantity: 60, mustLoad: false, priority: 0 }
    await db.updateTrip(tripId, { packages: [...trip.packages, bulky] })
  }, { url: MOCK_DB, tripId: TRIP_ID })
  // Kho nằm trong bộ nhớ trang: chuyển route phía client, không tải lại.
  await page.evaluate((route) => { history.pushState({}, '', route); window.dispatchEvent(new PopStateEvent('popstate')) }, SETUP)
  // Chờ màn đọc lại kho: 132 kiện seed + 60 kiện thêm
  await expect(page.getByText(/192 kiện/)).toBeVisible()
  await optimize(page).click()
  await expect(page.getByText(/Kết quả một phần: \d+ kiện chưa xếp\./)).toBeVisible({ timeout: 30_000 })
  await page.waitForURL(/\/phuong-an\?revision=MOCK-/)
})
