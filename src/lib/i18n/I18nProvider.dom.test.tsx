import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { beforeEach, expect, test } from 'vitest'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { Input } from '@/components/ui/Input'
import { I18nProvider, useFormat, useT } from '@/lib/i18n'

/** Khoá phiên đã lưu trong trình duyệt người dùng: đổi tên là họ mất lựa chọn. */
const STORAGE_KEY = 'loadmaster.ngon-ngu'

/** Một màn nhỏ dùng từ điển và format đúng như màn thật. */
function TripSummary() {
  const t = useT()
  const format = useFormat()
  return (
    <section>
      <h1>{t('nav.trips')}</h1>
      <p>{format.weight(5320)}</p>
    </section>
  )
}

/** Form đăng nhập thu gọn: react-hook-form giữ giá trị như form thật. */
function PasswordForm() {
  const t = useT()
  const form = useForm({ defaultValues: { password: '' } })
  return (
    <form>
      <Input label={t('auth.login.password')} type="password" {...form.register('password')} />
    </form>
  )
}

function AccountName({ fullName }: { fullName: string }) {
  const t = useT()
  return <p>{t('nav.account', { name: fullName })}</p>
}

function PackageCounts() {
  const t = useT()
  return (
    <ul>
      <li>{t('common.packageCount', { count: 1 })}</li>
      <li>{t('common.packageCount', { count: 1320 })}</li>
    </ul>
  )
}

function renderApp(screenContent: ReactNode = <TripSummary />) {
  render(
    <I18nProvider>
      <LanguageSwitch />
      {screenContent}
    </I18nProvider>,
  )
  return { user: userEvent.setup() }
}

beforeEach(() => {
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
  document.documentElement.removeAttribute('lang')
})

test('without any choice the interface is Vietnamese', () => {
  renderApp()

  expect(screen.getByRole('heading', { name: 'Chuyến hàng' })).toBeInTheDocument()
  expect(document.documentElement).toHaveAttribute('lang', 'vi')
})

test('?lang=en opens the interface in English', () => {
  window.history.replaceState(null, '', '/dang-nhap?lang=en')

  renderApp()

  expect(screen.getByRole('heading', { name: 'Trips' })).toBeInTheDocument()
  expect(document.documentElement).toHaveAttribute('lang', 'en')
})

test('a language chosen earlier in this browser session is used when the URL has no ?lang', () => {
  sessionStorage.setItem(STORAGE_KEY, 'en')

  renderApp()

  expect(screen.getByRole('heading', { name: 'Trips' })).toBeInTheDocument()
})

test('?lang in the URL wins over the language stored for the session', () => {
  sessionStorage.setItem(STORAGE_KEY, 'en')
  window.history.replaceState(null, '', '/?lang=vi')

  renderApp()

  expect(screen.getByRole('heading', { name: 'Chuyến hàng' })).toBeInTheDocument()
})

test('an unsupported ?lang is ignored instead of breaking the screen', () => {
  sessionStorage.setItem(STORAGE_KEY, 'en')
  window.history.replaceState(null, '', '/?lang=fr')

  renderApp()

  expect(screen.getByRole('heading', { name: 'Trips' })).toBeInTheDocument()
})

test('choosing English in the switch translates text, numbers and the page language in place', async () => {
  const { user } = renderApp()
  expect(screen.getByText('5.320 kg')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'EN English' }))

  expect(screen.getByRole('heading', { name: 'Trips' })).toBeInTheDocument()
  expect(screen.getByText('5,320 kg')).toBeInTheDocument()
  expect(document.documentElement).toHaveAttribute('lang', 'en')
})

test('the switch is labelled in the current language and shows which language is on', () => {
  window.history.replaceState(null, '', '/?lang=en')

  renderApp()

  const languageSwitch = screen.getByRole('group', { name: 'Interface language' })
  expect(within(languageSwitch).getByRole('button', { name: 'EN English' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(languageSwitch).getByRole('button', { name: 'VI Tiếng Việt' })).toHaveAttribute('aria-pressed', 'false')
})

test('the language picked in the switch is kept for the rest of the browser session', async () => {
  const { user } = renderApp()

  await user.click(screen.getByRole('button', { name: 'EN English' }))

  expect(sessionStorage.getItem(STORAGE_KEY)).toBe('en')
})

test('switching language keeps what the user has already typed into a form', async () => {
  const { user } = renderApp(<PasswordForm />)
  await user.type(screen.getByLabelText('Mật khẩu'), 'loadmaster')

  await user.click(screen.getByRole('button', { name: 'EN English' }))

  expect(screen.getByLabelText('Password')).toHaveValue('loadmaster')
})

test('messages fill in named values such as the signed-in user', () => {
  window.history.replaceState(null, '', '/?lang=en')

  renderApp(<AccountName fullName="Nguyễn Thanh Tùng" />)

  expect(screen.getByText('Account Nguyễn Thanh Tùng')).toBeInTheDocument()
})

test('counts pick the singular or plural sentence and group digits the way the language does', async () => {
  const { user } = renderApp(<PackageCounts />)
  expect(screen.getByText('1.320 kiện')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'EN English' }))

  expect(screen.getByText('1 package')).toBeInTheDocument()
  expect(screen.getByText('1,320 packages')).toBeInTheDocument()
})
