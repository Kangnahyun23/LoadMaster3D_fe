import type { Page } from '@playwright/test'
import { DEMO_EMAILS, DEMO_PASSWORD, expect, test } from './fixtures'

/**
 * Quản trị người dùng (LM-092, D-42): tài khoản quản trị tạo đăng nhập được bằng mật khẩu tạm hiện một lần và mở đúng màn của vai
 * trò; khoá rồi thì đăng nhập báo khoá. Kho in-memory: đổi người dùng bằng đăng xuất/đăng nhập trong app, không `page.goto`.
 */
const NEW_DRIVER = { name: 'Mai Văn Phúc', email: 'phuc.mai@loadmaster.vn' }

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

test('a driver account the admin creates signs in with its one-time password; locked, it is refused', async ({ page, login, browserErrors }) => {
  await login('/nguoi-dung', 'admin')
  await page.getByRole('button', { name: 'Thêm người dùng', exact: true }).click()
  const form = page.getByRole('dialog', { name: 'Thêm người dùng', exact: true })
  await form.getByLabel('Họ và tên', { exact: true }).fill(NEW_DRIVER.name)
  await form.getByLabel('Số điện thoại', { exact: true }).fill('0915111222')
  await form.getByLabel('Email', { exact: true }).fill(NEW_DRIVER.email)
  await form.getByLabel('Kho / chi nhánh', { exact: true }).fill('Kho Long Bình')
  await form.getByRole('combobox', { name: 'Vai trò', exact: true }).click()
  await page.getByRole('option', { name: 'Tài xế', exact: true }).click()
  await form.getByRole('button', { name: 'Thêm người dùng', exact: true }).click()

  // Mật khẩu tạm chỉ hiện một lần, trong hộp thoại
  const result = page.getByRole('dialog', { name: `Đã tạo tài khoản ${NEW_DRIVER.name}`, exact: true })
  const password = await result.getByLabel('Mật khẩu tạm', { exact: true }).inputValue()
  expect(password).toMatch(/^[A-Za-z2-9]{10}$/)
  await result.getByRole('button', { name: 'Xong', exact: true }).click()
  await expect(page.getByRole('row', { name: new RegExp(NEW_DRIVER.name) })).toContainText('Đang hoạt động')

  await signOutFromMenu(page, 'Võ Minh Khoa')
  await signIn(page, NEW_DRIVER.email, password)
  // Tài xế đăng nhập mở "Chuyến của tôi" (LM-087) — màn chính của vai trò: nút thoát là đăng xuất
  await page.waitForURL(/\/tai-xe$/)
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).first().click()
  await page.waitForURL(/\/dang-nhap$/)

  await signIn(page, DEMO_EMAILS.admin, DEMO_PASSWORD)
  await page.waitForURL(/\/nguoi-dung$/)
  await page.getByRole('searchbox', { name: 'Tìm theo tên, email, số điện thoại, mã', exact: true }).fill('phuc.mai')
  await page.getByRole('button', { name: `Thao tác cho ${NEW_DRIVER.name}`, exact: true }).click()
  await page.getByRole('menuitem', { name: 'Khoá tài khoản', exact: true }).click()
  await expect(page.getByText(`Đã khoá tài khoản ${NEW_DRIVER.name}`, { exact: true })).toBeVisible()
  await expect(page.getByRole('row', { name: new RegExp(NEW_DRIVER.name) })).toContainText('Đã khoá')

  await signOutFromMenu(page, 'Võ Minh Khoa')
  await signIn(page, NEW_DRIVER.email, password)
  await expect(page.getByRole('alert')).toHaveText('Tài khoản đã bị khoá. Liên hệ quản trị hệ thống.')
  await expect(page).toHaveURL(/\/dang-nhap$/)
  expect(browserErrors).toStrictEqual([])
})
