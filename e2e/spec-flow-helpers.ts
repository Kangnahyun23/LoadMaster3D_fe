import type { Locator, Page } from '@playwright/test'
import { expect } from './fixtures'

/**
 * Bước dùng chung của E2E luồng Spec (LM-054). Kho dữ liệu nằm trong bộ nhớ trang: tải lại là mất, nên
 * mọi bước đi bằng thao tác UI; chỗ không có liên kết thì đổi route phía client (`navigateInApp`).
 */
export const MOCK_DB = '/src/lib/mock-db/index.ts'
export const SEED_TRIP = 'TRIP-2026-0914'

/** Đổi route không tải lại trang — giữ kho in-memory và phiên. */
export async function navigateInApp(page: Page, route: string) {
  await page.evaluate((to) => {
    history.pushState({}, '', to)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, route)
}

export type PackageInput = {
  name: string
  lengthCm: number
  widthCm: number
  heightCm: number
  weightKg: number
  quantity?: number
}

/** Mở panel "Kiện mới" ở Chi tiết chuyến, điền và lưu. Trả panel để test đọc thêm nếu cần. */
export async function addPackage(page: Page, input: PackageInput): Promise<Locator> {
  await page.getByRole('button', { name: 'Thêm kiện', exact: true }).first().click()
  const panel = page.getByRole('complementary', { name: 'Kiện mới' })
  await panel.getByLabel('Tên kiện').fill(input.name)
  await panel.getByLabel('Dài', { exact: true }).fill(String(input.lengthCm))
  await panel.getByLabel('Rộng', { exact: true }).fill(String(input.widthCm))
  await panel.getByLabel('Cao', { exact: true }).fill(String(input.heightCm))
  await panel.getByLabel('Khối lượng', { exact: true }).fill(String(input.weightKg))
  await panel.getByLabel('Số lượng', { exact: true }).fill(String(input.quantity ?? 1))
  await panel.getByRole('button', { name: 'Lưu kiện', exact: true }).click()
  return panel
}

/** Bấm Tối ưu ở Thiết lập tối ưu và chờ Planner mở revision mới cùng canvas. */
export async function optimizeAndOpenPlanner(page: Page) {
  const optimize = page.getByRole('button', { name: 'Tối ưu', exact: true })
  await expect(optimize).toBeEnabled()
  await optimize.click()
  await page.waitForURL(/\/phuong-an\?revision=MOCK-/, { timeout: 60_000 })
  await page.locator('canvas').waitFor()
}

/** Chiều cao hiển thị của một phần tử, px. */
export async function heightOf(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('element is not visible')
  return box.height
}
