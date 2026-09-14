/**
 * Kiểm tra ở mức kiểu, chạy bằng `tsc -b` (tức `pnpm build`), không chạy trong Vitest.
 * Mỗi `@ts-expect-error` phải gặp đúng một lỗi; nếu kiểu bị nới lỏng thì directive
 * thừa và build đỏ.
 */
import { en } from './en'
import type { Dictionary, TFunction } from './types'
import type { vi } from './vi'

type Source = typeof vi

// Bản dịch hiện có đầy đủ nên hợp lệ.
void (en satisfies Dictionary<Source>)

declare const navWithoutAccount: Omit<(typeof en)['nav'], 'account'>
// @ts-expect-error — bản dịch thiếu key nav.account
void ({ ...en, nav: navWithoutAccount } satisfies Dictionary<Source>)

// @ts-expect-error — key nav.extra không có trong từ điển nguồn tiếng Việt
void ({ ...en, nav: { ...en.nav, extra: 'Extra' } } satisfies Dictionary<Source>)

// @ts-expect-error — bản dịch làm mất tham số {name} của câu nguồn
void ({ ...en, nav: { ...en.nav, account: 'Account' } } satisfies Dictionary<Source>)

declare const t: TFunction

t('nav.account', { name: 'Nguyễn Thanh Tùng' })
t('common.packageCount', { count: 3 })

// @ts-expect-error — key không có trong từ điển
t('nav.acount')

// @ts-expect-error — câu có {name} nên phải truyền tham số
t('nav.account')

// @ts-expect-error — sai tên tham số
t('nav.account', { fullName: 'Nguyễn Thanh Tùng' })

// @ts-expect-error — count của câu số nhiều phải là số
t('common.packageCount', { count: '3' })
