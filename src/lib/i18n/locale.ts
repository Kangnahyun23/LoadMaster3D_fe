import type { FormatLocale } from '@/lib/format'

/**
 * Ngôn ngữ giao diện (PRD D-07). Thêm một ngôn ngữ: thêm mã vào đây rồi để
 * TypeScript chỉ ra các bảng còn thiếu (`INTL_LOCALES`, `LOCALE_NAMES`, từ điển).
 */
export const LOCALES = ['vi', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'vi'

/** Locale của `Intl` cho số và ngày theo từng ngôn ngữ giao diện. */
export const INTL_LOCALES: Record<Locale, FormatLocale> = { vi: 'vi-VN', en: 'en-US' }

/** Tên ngôn ngữ viết bằng chính ngôn ngữ đó, không dịch. */
export const LOCALE_NAMES: Record<Locale, string> = { vi: 'Tiếng Việt', en: 'English' }

/** Cùng tiền tố với khoá phiên đăng nhập. Không dùng `localStorage` (AGENTS mục 9). */
const STORAGE_KEY = 'loadmaster.ngon-ngu'

export function isLocale(value: string | null): value is Locale {
  return LOCALES.some((locale) => locale === value)
}

/** Thứ tự: `?lang=vi|en` → lựa chọn đã lưu trong phiên → `vi`. Giá trị lạ bị bỏ qua. */
export function readInitialLocale(): Locale {
  const fromQuery = new URLSearchParams(window.location.search).get('lang')
  if (isLocale(fromQuery)) return fromQuery

  const stored = readStoredLocale()
  if (isLocale(stored)) return stored

  return DEFAULT_LOCALE
}

function readStoredLocale(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    // Trình duyệt chặn storage — coi như chưa chọn.
    return null
  }
}

export function storeLocale(locale: Locale): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // Không lưu được thì lựa chọn chỉ sống tới lần tải lại trang.
  }
}
