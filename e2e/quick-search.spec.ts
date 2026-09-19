import { expect, test } from './fixtures'
import { SEED_TRIP } from './spec-flow-helpers'

/**
 * Tìm nhanh (LM-099, D-55): Ctrl+K ở màn có nav rail mở hộp thoại, gõ mã chuyến, Enter mở chi tiết chuyến; mở lại bằng nút trên nav
 * rail, mũi tên chọn kiện rồi Enter mở chuyến đúng kiện đó.
 */
test('Ctrl+K opens a trip, the nav rail button opens a package', async ({ page, login, browserErrors }) => {
  await login('/chuyen', 'dispatcher')
  await expect(page.getByRole('heading', { level: 1, name: 'Chuyến hàng', exact: true })).toBeVisible()

  await page.keyboard.press('Control+K')
  const dialog = page.getByRole('dialog', { name: 'Tìm nhanh', exact: true })
  const input = dialog.getByRole('combobox', { name: 'Từ khoá tìm nhanh', exact: true })
  await expect(input).toBeFocused()
  await input.pressSequentially('0914')
  const option = dialog.getByRole('option').filter({ hasText: SEED_TRIP })
  await expect(option).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Enter')
  await page.waitForURL(new RegExp(`/chuyen/${SEED_TRIP}$`))
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Kiện hàng', exact: true })).toBeVisible()

  await page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('button', { name: 'Tìm nhanh', exact: true }).click()
  await input.pressSequentially('pkg-002')
  const packages = dialog.getByRole('group', { name: 'Kiện', exact: true })
  await expect(packages.getByRole('option').first()).toContainText(SEED_TRIP)
  // Nhóm Chuyến không khớp "pkg-002": dòng đầu của nhóm Kiện đang được chọn
  await expect(packages.getByRole('option').first()).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')
  await page.waitForURL(new RegExp(`/chuyen/${SEED_TRIP}\\?kien=PKG-002$`))
  await expect(page.getByRole('complementary', { name: /PKG-002/ })).toBeVisible()
  expect(browserErrors).toStrictEqual([])
})
