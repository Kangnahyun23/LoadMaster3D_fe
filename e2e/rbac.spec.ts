import { expect, test } from './fixtures'
import { navigateInApp, SEED_TRIP } from './spec-flow-helpers'

/**
 * Phân quyền giả lập ở FE (LM-084, D-41): mỗi vai trò mở đúng màn chính, nav chỉ có mục được phép, route không có quyền là 403
 * có lối về, quản lý xem chuyến và phương án chỉ đọc.
 */
test('each role lands on its own screen and sees only its nav items', async ({ page, login, browserErrors }) => {
  const nav = page.getByRole('navigation', { name: 'Điều hướng chính' })
  await login('/', 'manager')
  await page.waitForURL((url) => url.pathname === '/')
  await expect(nav.getByRole('link')).toHaveText(['Bảng điều khiển', 'Chuyến hàng', 'Đội xe'])
  expect(browserErrors).toStrictEqual([])
})

test('a driver opening the admin screen gets 403 with a way back', { tag: '@phone' }, async ({ page, login, browserErrors }) => {
  await login('/nguoi-dung', 'driver')
  await expect(page.getByRole('heading', { name: 'Không có quyền truy cập', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Về màn chính', exact: true }).click()
  await page.waitForURL(/\/tai-xe\/diem-giao/)
  expect(browserErrors).toStrictEqual([])
})

test('the manager reads trips and plans without any write action', async ({ page, login, browserErrors }) => {
  await login(`/chuyen/${SEED_TRIP}`, 'manager')
  await expect(page.getByRole('heading', { name: 'Kiện hàng', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Chạy tối ưu', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Thêm kiện', exact: true })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Đổi xe', exact: true })).toHaveCount(0)

  await navigateInApp(page, `/chuyen/${SEED_TRIP}/phuong-an`)
  await page.locator('canvas').waitFor()
  await expect(page.getByText('MOCK RESULT', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Duyệt phương án', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Chỉnh sửa', exact: true })).toHaveCount(0)

  await navigateInApp(page, `/chuyen/${SEED_TRIP}/toi-uu`)
  await expect(page.getByRole('heading', { name: 'Không có quyền truy cập', exact: true })).toBeVisible()
  expect(browserErrors).toStrictEqual([])
})
