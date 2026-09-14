/**
 * i18n vi/en tự viết (PRD D-07, LM-027). Màn chỉ import từ đây:
 * `useT()` cho chữ, `useFormat()` cho số và ngày, `useLocale()` khi cần biết
 * hoặc đổi ngôn ngữ. Nút chuyển dùng chung là `@/components/LanguageSwitch`.
 */
export { I18nProvider, useFormat, useLocale, useT } from './I18nProvider'
export { LOCALE_NAMES, LOCALES, type Locale } from './locale'
export type { MessageKey, TFunction } from './types'
