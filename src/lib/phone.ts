/**
 * Số điện thoại của người dùng — form tài khoản của quản trị (LM-092) và hồ sơ cá nhân (LM-096) dùng chung.
 * 10 chữ số bắt đầu bằng 0; người nhập được gõ kèm khoảng trắng. Kho lưu dạng hiển thị "0901 234 567", nên mở form rồi lưu
 * không đổi gì thì kho không thấy thay đổi.
 */
export const PHONE_PATTERN = /^0\d{9}$/

/** Bỏ khoảng trắng: "0901 234 567" → "0901234567". */
export function phoneDigits(value: string): string {
  return value.replace(/\s/g, '')
}

/** Dạng hiển thị của kho: "0901234567" → "0901 234 567". Đầu vào đã khớp `PHONE_PATTERN`. */
export function formatPhone(digits: string): string {
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
}
