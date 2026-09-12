/**
 * 8 màu định danh điểm giao — bảng Okabe–Ito, an toàn cho người mù màu.
 * Chỉ dùng để định danh điểm giao, không dùng trang trí (CLAUDE.md mục 5).
 * Màu luôn đi kèm nhãn hoặc số, không bao giờ chỉ dựa vào màu (mục 10).
 */

export const STOP_COLORS = [
  '#E69F00',
  '#56B4E9',
  '#009E73',
  '#F0E442',
  '#0072B2',
  '#D55E00',
  '#CC79A7',
  '#555555',
] as const

export const STOP_COUNT = STOP_COLORS.length

/** Ba màu sáng cần chữ tối đè lên; còn lại dùng chữ trắng. */
const DARK_TEXT_ON = new Set<string>(['#E69F00', '#56B4E9', '#F0E442'])

/** Chỉ số điểm giao (1-based) → mã màu nền. Vượt quá 8 thì quay vòng. */
export function stopColor(stopNumber: number): string {
  const index = (stopNumber - 1) % STOP_COUNT
  return STOP_COLORS[index] ?? STOP_COLORS[0]
}

/** Chỉ số điểm giao (1-based) → màu chữ tương phản trên nền màu đó. */
export function stopForeground(stopNumber: number): string {
  return DARK_TEXT_ON.has(stopColor(stopNumber)) ? '#111827' : '#FFFFFF'
}

/** Nhãn mặc định cho điểm giao. */
export function stopLabel(stopNumber: number): string {
  return `Điểm ${stopNumber}`
}
