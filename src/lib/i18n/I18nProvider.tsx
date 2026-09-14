import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createFormatter, type Formatter } from '@/lib/format'
import { INTL_LOCALES, readInitialLocale, storeLocale, type Locale } from './locale'
import { createTranslator } from './translate'
import type { TFunction } from './types'

type I18nValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TFunction
  format: Formatter
}

const I18nContext = createContext<I18nValue | null>(null)

/**
 * Bọc toàn app (trong `Providers`). Ngôn ngữ đầu tiên lấy theo `readInitialLocale`.
 * Đổi ngôn ngữ chỉ render lại chữ và số: không tải lại trang, không remount route,
 * form đang nhập giữ nguyên. Mỗi lần đổi, kể cả lựa chọn đến từ `?lang`, được ghi
 * vào `sessionStorage` và `<html lang>`.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readInitialLocale)

  useEffect(() => {
    document.documentElement.lang = locale
    storeLocale(locale)
  }, [locale])

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: createTranslator(locale),
      format: createFormatter(INTL_LOCALES[locale]),
    }),
    [locale],
  )

  return <I18nContext value={value}>{children}</I18nContext>
}

function useI18n(hook: string): I18nValue {
  const value = use(I18nContext)
  if (!value) throw new Error(`${hook} phải nằm trong <I18nProvider>`)
  return value
}

export function useT(): TFunction {
  return useI18n('useT').t
}

export function useFormat(): Formatter {
  return useI18n('useFormat').format
}

export function useLocale(): Pick<I18nValue, 'locale' | 'setLocale'> {
  const { locale, setLocale } = useI18n('useLocale')
  return { locale, setLocale }
}
