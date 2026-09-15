/**
 * i18n vi/en tự viết (PRD D-07, LM-027). Màn chỉ import từ đây:
 * `useT()` cho chữ, `useFormat()` cho số và ngày, `useLocale()` khi cần biết
 * hoặc đổi ngôn ngữ. Nút chuyển dùng chung là `@/components/LanguageSwitch`.
 * Ngoài React (hàm thuần, test): `createTranslator(locale)` và `formatIssue` (LM-028).
 */
export { I18nProvider, useFormat, useLocale, useT } from './I18nProvider'
export { formatIssue } from './issue-message'
export { LOCALE_NAMES, LOCALES, type Locale } from './locale'
export { createTranslator } from './translate'
export type { MessageKey, TFunction } from './types'
