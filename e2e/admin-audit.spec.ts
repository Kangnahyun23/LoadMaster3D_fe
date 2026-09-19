import type { Page } from '@playwright/test'
import { DEMO_EMAILS, DEMO_PASSWORD, expect, test } from './fixtures'
import { MOCK_DB } from './spec-flow-helpers'

/**
 * Nhật ký hệ thống (LM-091, D-43): điều phối viên huỷ một chuyến, quản trị viên đăng nhập trong cùng trang (kho in-memory) và thấy
 * sự kiện ở đầu nhật ký, lọc theo người làm ra đúng. Không `page.goto` sau khi ghi: tải lại là mất kho.
 */

/** Chữ các ô của hàng dữ liệu thứ `index` (0 là hàng đầu dưới tiêu đề), bỏ cột thời điểm. */
async function rowCells(page: Page, index: number) {
  const cells = await page.locator('tbody tr').nth(index).locator('td').allInnerTexts()
  return cells.slice(1).map((cell) => cell.replace(/\s+/g, ' ').trim())
}

async function signOutFromMenu(page: Page, name: string) {
  await page.getByRole('button', { name: `Tài khoản ${name}`, exact: true }).click()
  await page.getByRole('menuitem', { name: 'Đăng xuất', exact: true }).click()
  await page.waitForURL(/\/dang-nhap$/)
}

async function signIn(page: Page, email: string, password: string) {
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
}

test('a trip the dispatcher cancels tops the admin log, and filtering by who did it keeps it', async ({ page, login, browserErrors }) => {
  await login('/chuyen', 'dispatcher')
  await page.evaluate(async ({ db }) => {
    const { getMockDb } = (await import(db)) as typeof import('@/lib/mock-db')
    await getMockDb().cancelTrip('TRIP-012', 'Khách đổi lịch nhận hàng')
  }, { db: MOCK_DB })

  await signOutFromMenu(page, 'Nguyễn Thanh Tùng')
  await signIn(page, DEMO_EMAILS.admin, DEMO_PASSWORD)
  await page.waitForURL(/\/nguoi-dung$/)
  await page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Nhật ký', exact: true }).click()
  await page.waitForURL(/\/nhat-ky$/)
  await expect(page.getByRole('heading', { name: 'Nhật ký hệ thống', exact: true })).toBeVisible()

  // Mới nhất trước: quản trị đăng nhập, điều phối đăng xuất, rồi lần huỷ chuyến
  const cancelled = ['Nguyễn Thanh Tùng', 'Huỷ chuyến', 'Tuyến Bình Chánh – Biên Hoà TRIP-012', 'Lý do: Khách đổi lịch nhận hàng']
  await expect(page.locator('tbody tr').first()).toContainText('Võ Minh Khoa')
  expect(await rowCells(page, 0)).toStrictEqual(['Võ Minh Khoa', 'Đăng nhập', 'Võ Minh Khoa US-0005', ''])
  expect(await rowCells(page, 1)).toStrictEqual(['Nguyễn Thanh Tùng', 'Đăng xuất', 'Nguyễn Thanh Tùng US-0001', ''])
  expect(await rowCells(page, 2)).toStrictEqual(cancelled)

  await page.getByRole('combobox', { name: 'Người làm', exact: true }).click()
  await page.getByRole('option', { name: 'Nguyễn Thanh Tùng', exact: true }).click()
  await expect(page).toHaveURL(/\/nhat-ky\?nguoi-lam=US-0001$/)
  await expect(page.locator('tbody tr').first()).toContainText('Đăng xuất')
  const actors = await page.locator('tbody tr td:nth-child(2)').allInnerTexts()
  expect(new Set(actors)).toStrictEqual(new Set(['Nguyễn Thanh Tùng']))
  expect(await rowCells(page, 1)).toStrictEqual(cancelled)

  // Nhóm "Chuyến": lần huỷ đứng đầu, bấm đối tượng mở đúng chuyến
  await page.getByRole('combobox', { name: 'Nhóm hành động', exact: true }).click()
  await page.getByRole('option', { name: 'Chuyến', exact: true }).click()
  await expect(page.locator('tbody tr').first()).toContainText('Huỷ chuyến')
  expect(await rowCells(page, 0)).toStrictEqual(cancelled)
  await page.locator('tbody tr').first().getByRole('link', { name: 'Tuyến Bình Chánh – Biên Hoà', exact: true }).click()
  await page.waitForURL(/\/chuyen\/TRIP-012$/)
  expect(browserErrors).toStrictEqual([])
})
