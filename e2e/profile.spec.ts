import type { Page } from '@playwright/test'
import { DEMO_EMAILS, DEMO_PASSWORD, expect, test } from './fixtures'

/**
 * Hồ sơ cá nhân (LM-096, D-42): đổi mật khẩu ở `/ho-so`, đăng xuất bằng menu tài khoản; mật khẩu cũ bị từ chối, mật khẩu mới vào
 * được. Không `page.goto` sau khi ghi: kho nằm trong bộ nhớ trang, tải lại là mất.
 */

async function signIn(page: Page, email: string, password: string) {
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
}

test('after changing the password the old one is refused and the new one signs in', async ({ page, login, browserErrors }) => {
  const nextPassword = 'long-binh-2026'
  await login('/chuyen', 'dispatcher')
  const account = page.getByRole('button', { name: 'Tài khoản Nguyễn Thanh Tùng', exact: true })
  await account.click()
  await page.getByRole('menuitem', { name: 'Hồ sơ cá nhân', exact: true }).click()
  await page.waitForURL(/\/ho-so$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Hồ sơ cá nhân', exact: true })).toBeVisible()
  await expect(page.getByText('dieuphoi@loadmaster.vn', { exact: true })).toBeVisible()

  const form = page.getByRole('region', { name: 'Đổi mật khẩu', exact: true })
  await form.getByLabel('Mật khẩu hiện tại', { exact: true }).fill(DEMO_PASSWORD)
  await form.getByLabel('Mật khẩu mới', { exact: true }).fill(nextPassword)
  await form.getByLabel('Nhập lại mật khẩu mới', { exact: true }).fill(nextPassword)
  await form.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click()
  await expect(page.getByText('Đã đổi mật khẩu', { exact: true })).toBeVisible()
  await expect(form.getByLabel('Mật khẩu hiện tại', { exact: true })).toHaveValue('')

  await account.click()
  await page.getByRole('menuitem', { name: 'Đăng xuất', exact: true }).click()
  await page.waitForURL(/\/dang-nhap$/)

  await signIn(page, DEMO_EMAILS.dispatcher, DEMO_PASSWORD)
  await expect(page.getByText('Email hoặc mật khẩu không đúng', { exact: true })).toBeVisible()
  await expect(page).toHaveURL(/\/dang-nhap$/)

  await signIn(page, DEMO_EMAILS.dispatcher, nextPassword)
  await page.waitForURL((url) => url.pathname === '/chuyen')
  await expect(account).toBeVisible()
  expect(browserErrors).toStrictEqual([])
})
