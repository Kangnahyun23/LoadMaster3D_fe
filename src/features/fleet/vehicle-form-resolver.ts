import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldError, FieldErrors, Resolver } from 'react-hook-form'
import { validateVehicle, type ConstraintIssue } from '@/domain/constraints'
import type { Formatter } from '@/lib/format'
import { formatIssue, type TFunction } from '@/lib/i18n'
import { toVehicleConfig, type VehicleFormSchema, type VehicleFormValues } from './vehicle-form'

/**
 * Resolver hai chặng của form xe (LM-041):
 *
 * 1. schema zod của form — từng ô phải nhập đủ và đúng kiểu;
 * 2. `validateVehicle` của domain — quy tắc Spec 9.2 nhiều trường, câu dựng bằng `formatIssue` (D-28).
 *
 * Chặng 2 chỉ chạy khi chặng 1 sạch, đúng nếp `abort` của schema domain: ô còn trống thì chưa so cửa với lòng thùng.
 *
 * `issue.field` đã là đường dẫn react-hook-form (`doorWidthCm`, `obstacles.0.lengthCm`, hoặc cả dòng `obstacles.0`),
 * nên lỗi rơi đúng ô và `setFocus` dùng thẳng được.
 */
export function createVehicleResolver(
  schema: VehicleFormSchema,
  t: TFunction,
  format: Formatter,
): Resolver<VehicleFormValues> {
  const fields = zodResolver(schema)
  return (values, context, options) => {
    const parsed = schema.safeParse(values)
    // Chặng 1 hỏng: để zodResolver dựng cây lỗi theo đúng đường dẫn của từng ô
    if (!parsed.success) return fields(values, context, options)

    const issues = validateVehicle(toVehicleConfig(parsed.data))
    if (issues.length === 0) return { values: parsed.data, errors: {} }
    return { values: {}, errors: toFieldErrors(issues, t, format) }
  }
}

function toFieldErrors(issues: readonly ConstraintIssue[], t: TFunction, format: Formatter): FieldErrors<VehicleFormValues> {
  const errors: Branch = {}
  for (const issue of issues) {
    if (issue.field === undefined) continue
    assign(errors, issue.field.split('.'), { type: issue.code, message: formatIssue(issue, t, format) })
  }
  // Cây lỗi dựng theo đường dẫn của issue; hình dạng đúng như RHF sinh ra cho cùng đường dẫn.
  return errors as FieldErrors<VehicleFormValues>
}

type Branch = Record<string, unknown>

function assign(target: Branch, path: readonly string[], error: FieldError): void {
  const [head, ...rest] = path
  if (head === undefined) return
  if (rest.length === 0) {
    // Lỗi cả dòng nằm cạnh lỗi của các ô trong dòng, không đè lên chúng
    target[head] = { ...branchAt(target, head, rest[0]), ...error }
    return
  }
  const child = branchAt(target, head, rest[0])
  target[head] = child
  assign(child, rest, error)
}

/**
 * Nhánh con tại `key`, tạo mới nếu chưa có. Đoạn tiếp theo là số (`obstacles.0`) thì nhánh là **mảng**,
 * đúng hình dạng RHF sinh ra cho cùng đường dẫn — bảng vật cản duyệt `errors.obstacles` như một mảng.
 */
function branchAt(target: Branch, key: string, nextSegment: string | undefined): Branch {
  const current = target[key]
  if (typeof current === 'object' && current !== null) return current as Branch
  return nextSegment !== undefined && /^\d+$/.test(nextSegment) ? ([] as unknown as Branch) : {}
}

/** Một dòng của bảng tóm tắt lỗi: đường dẫn để `setFocus` và câu đã dịch. */
export type FormIssue = { path: string; message: string }

/**
 * Dàn phẳng `formState.errors` theo thứ tự khai báo của form, để hộp tóm tắt đọc được cả lỗi ô lẫn lỗi dòng.
 * Một nút vừa có `message` vừa có nhánh con (lỗi cả dòng vật cản) cho ra dòng riêng rồi đi tiếp xuống các ô.
 */
export function flattenFormErrors(errors: unknown, prefix = ''): FormIssue[] {
  if (typeof errors !== 'object' || errors === null) return []
  const node = errors as Branch
  const found: FormIssue[] = []
  const message = node['message']
  if (prefix !== '' && typeof message === 'string' && message !== '') found.push({ path: prefix, message })
  for (const [key, value] of Object.entries(node)) {
    if (key === 'message' || key === 'type' || key === 'ref' || key === 'types') continue
    found.push(...flattenFormErrors(value, prefix === '' ? key : `${prefix}.${key}`))
  }
  return found
}
