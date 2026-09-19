import { ORIENTATION_CODES, type OrientationCode } from '@/domain/geometry'
import { normalizeSearchText } from '@/lib/list-filter'

/**
 * Đọc từng ô của file nhập kiện (LM-093): hàm thuần, không biết cột nào — `package-import.ts` chọn hàm theo kiểu của cột.
 * Ô trống, chữ sai dạng trả `null` để dòng báo lỗi đúng cột, không đoán thay người dùng.
 */

/** Ô đọc được: CSV cho chữ; `.xlsx` cho chữ, số, đúng/sai, ngày. */
export type ImportCell = string | number | boolean | Date | null

/** Chữ của ô, đã bỏ khoảng trắng hai đầu. Ngày của `.xlsx` thành `YYYY-MM-DD`. */
export function cellText(cell: ImportCell | undefined): string {
  if (cell === null || cell === undefined) return ''
  if (cell instanceof Date) return cell.toISOString().slice(0, 10)
  return String(cell).trim()
}

/** Dòng không có chữ nào (dòng trống, hoặc Excel xuất `;;;`). */
export function isBlankRow(cells: readonly ImportCell[]): boolean {
  return cells.every((cell) => cellText(cell) === '')
}

/** Một số có tối đa một dấu thập phân `,` hoặc `.`: "12,5" · "12.5" · "1,234" (= 1,234 — một dấu là dấu thập phân). */
const PLAIN = /^\d+(?:[.,]\d+)?$/
/** Nhóm nghìn bằng dấu chấm, thập phân bằng dấu phẩy (vi-VN): "1.234,5" · "1.234.567". */
const DOT_GROUPS = /^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/
/** Nhóm nghìn bằng dấu phẩy, thập phân bằng dấu chấm (en-US): "1,234.5" · "1,234,567". */
const COMMA_GROUPS = /^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/

/**
 * Số viết kiểu Việt hoặc kiểu Anh, bỏ khoảng trắng: "12,5" và "12.5" là 12,5; "1.234,5" và "1,234.5" là 1234,5. Chỉ một dấu thì
 * dấu đó là dấu thập phân ("1,234" là 1,234). Chữ khác, số lẫn chữ, hai dấu thập phân: `null`.
 */
export function parseDecimal(raw: string): number | null {
  const compact = raw.replace(/[\s  ]/g, '')
  const sign = compact.startsWith('-') ? -1 : 1
  const body = compact.replace(/^[+-]/, '')
  let normalized: string | null = null
  if (PLAIN.test(body)) normalized = body.replace(',', '.')
  else if (DOT_GROUPS.test(body)) normalized = body.replaceAll('.', '').replace(',', '.')
  else if (COMMA_GROUPS.test(body)) normalized = body.replaceAll(',', '')
  return normalized === null ? null : sign * Number(normalized)
}

/** Tỷ lệ 0–1, nhận cả phần trăm: "0,8" · "80%" là 0,8. */
export function parseRatio(raw: string): number | null {
  const text = raw.trim()
  if (!text.endsWith('%')) return parseDecimal(text)
  const percent = parseDecimal(text.slice(0, -1))
  return percent === null ? null : percent / 100
}

/** Viết không dấu vì cổng i18n chặn chữ có dấu ngoài từ điển: "có" / "không" / "đúng" bỏ dấu thành "co" / "khong" / "dung". */
const TRUE_WORDS = new Set(['true', '1', 'yes', 'y', 'x', 'co', 'dung'])
const FALSE_WORDS = new Set(['false', '0', 'no', 'n', 'khong', 'sai'])

/** Đúng/sai: `true/false`, `có/không`, `yes/no`, `1/0`, không phân biệt dấu và hoa thường. */
export function parseFlag(raw: string): boolean | null {
  const word = normalizeSearchText(raw)
  if (TRUE_WORDS.has(word)) return true
  if (FALSE_WORDS.has(word)) return false
  return null
}

/**
 * Hướng đặt được phép dạng `LWH|WLH` (Spec 7.2); nhận cả dấu phẩy, chấm phẩy, gạch chéo, khoảng trắng làm dấu ngăn, chữ thường.
 * Mã lạ thì trả chính mã đó để câu lỗi chỉ đúng chỗ sai.
 */
export function parseOrientations(raw: string): { codes: OrientationCode[] } | { invalid: string } {
  const codes = raw.split(/[|,;/\s]+/).filter((code) => code !== '').map((code) => code.toUpperCase())
  const invalid = codes.find((code) => !(ORIENTATION_CODES as readonly string[]).includes(code))
  return invalid === undefined ? { codes: codes as OrientationCode[] } : { invalid }
}
