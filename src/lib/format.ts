/**
 * Định dạng tiếng Việt tập trung ở đây (CLAUDE.md mục 6).
 * Không tự nối chuỗi số ở nơi khác — luôn gọi qua các hàm này.
 */

const VI = 'vi-VN'

const integerFormatter = new Intl.NumberFormat(VI, { maximumFractionDigits: 0 })

const decimalFormatter = new Intl.NumberFormat(VI, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat(VI, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat(VI, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** 8240 → "8.240" */
export function formatInteger(value: number): string {
  return integerFormatter.format(value)
}

/** 18.44 → "18,4" */
export function formatDecimal(value: number): string {
  return decimalFormatter.format(value)
}

/** 8240 → "8.240 kg" */
export function formatWeight(kilograms: number): string {
  return `${integerFormatter.format(kilograms)} kg`
}

/** 18.44 → "18,4 m³" */
export function formatVolume(cubicMeters: number): string {
  return `${decimalFormatter.format(cubicMeters)} m³`
}

/** 87.42 → "87,4%" */
export function formatPercent(value: number): string {
  return `${decimalFormatter.format(value)}%`
}

/** 0.874 → "87,4%" — dùng khi nguồn dữ liệu là tỉ lệ 0–1 */
export function formatRatioAsPercent(ratio: number): string {
  return formatPercent(ratio * 100)
}

/** (7200, 2350, 2400) → "7.200 × 2.350 × 2.400 mm" */
export function formatDimensions(
  lengthMm: number,
  widthMm: number,
  heightMm: number,
): string {
  const parts = [lengthMm, widthMm, heightMm].map((mm) =>
    integerFormatter.format(mm),
  )
  return `${parts.join(' × ')} mm`
}

/** Date → "14/09/2026" */
export function formatDate(value: Date | string): string {
  return dateFormatter.format(toDate(value))
}

/** Date → "14:30" */
export function formatTime(value: Date | string): string {
  return timeFormatter.format(toDate(value))
}

/** Date → "14:30 14/09/2026" */
export function formatDateTime(value: Date | string): string {
  const date = toDate(value)
  return `${timeFormatter.format(date)} ${dateFormatter.format(date)}`
}

/** 5400 (giây) → "1 giờ 30 phút" */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes} phút`
  if (minutes === 0) return `${hours} giờ`
  return `${hours} giờ ${minutes} phút`
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}
