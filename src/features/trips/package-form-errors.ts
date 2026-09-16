import type { ModelIssueCode } from '@/domain/models'
import type { MessageKey, TFunction } from '@/lib/i18n'

/** Mã lỗi của `cargoPackageSchema` → câu trong từ điển. zod dùng mã làm message (D-28); form kiện dịch tại đây. */
const MESSAGES = {
  'common.number.invalid': 'trips.form.errors.numberInvalid',
  'package.dimension.positive': 'trips.form.errors.dimensionPositive',
  'package.weightKg.nonNegative': 'trips.form.errors.weightNonNegative',
  'package.quantity.integer': 'trips.form.errors.quantityInteger',
  'package.quantity.min': 'trips.form.errors.quantityMin',
  'package.allowedOrientations.empty': 'trips.form.errors.orientationsEmpty',
  'package.maxTopLoadKg.nonNegative': 'trips.form.errors.maxTopLoadNonNegative',
  'package.maxTopLoadKg.notStackable': 'trips.form.errors.maxTopLoadNotStackable',
  'package.maxStackCount.integer': 'trips.form.errors.maxStackCountInteger',
  'package.maxStackCount.min': 'trips.form.errors.maxStackCountMin',
  'package.minSupportRatio.range': 'trips.form.errors.minSupportRatioRange',
} as const satisfies Partial<Record<ModelIssueCode, MessageKey>>

type ErrorKey = (typeof MESSAGES)[keyof typeof MESSAGES] | 'trips.form.errors.invalid'

/** Câu hiển thị cho message lỗi của một ô form kiện; không có lỗi thì `undefined`, mã lạ thì câu chung. */
export function packageFieldError(message: string | undefined, t: TFunction): string | undefined {
  if (message === undefined || message === '') return undefined
  const key: ErrorKey = (MESSAGES as Readonly<Record<string, ErrorKey>>)[message] ?? 'trips.form.errors.invalid'
  return t(key)
}
