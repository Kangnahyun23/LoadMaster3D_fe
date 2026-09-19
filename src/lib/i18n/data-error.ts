import { isMockDbError } from '@/lib/mock-db/errors'
import type { TFunction } from './types'

/**
 * Câu cho lỗi của một lượt gọi kho (`MockDbError`, D-28): chọn câu `dataErrors.<mã>` theo ngôn ngữ của `t`, điền tham số của mã
 * (mảng nối bằng dấu phẩy). Lỗi khác mã kho → câu chung `dataErrors.UNKNOWN`.
 */
export function dataErrorMessage(error: unknown, t: TFunction): string {
  if (!isMockDbError(error)) return t('dataErrors.UNKNOWN')
  const params = Object.fromEntries(
    Object.entries(error.params).map(([name, value]) => [name, Array.isArray(value) ? value.join(', ') : value]),
  ) as Record<string, string | number>
  // Tham số của từng mã trùng placeholder của câu cùng mã (kiểm ở data-error.test.ts); TFunction không suy được từ mã động.
  const translate = t as unknown as (key: string, values: Record<string, string | number>) => string
  return translate(`dataErrors.${error.code}`, params)
}
