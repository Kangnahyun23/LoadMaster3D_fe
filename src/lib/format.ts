/**
 * Định dạng số, đơn vị, ngày giờ theo ngôn ngữ giao diện (AGENTS mục 6, PRD D-07).
 * Luôn đi qua `Intl`, không tự nối chuỗi số hay đổi dấu chấm/phẩy bằng tay.
 *
 * - Trong component: `useFormat()` của `@/lib/i18n`, tự đổi theo ngôn ngữ đang chọn.
 * - Trong hàm thuần (câu thông báo, nhãn tính sẵn): nhận `Formatter` làm tham số,
 *   tạo bằng `createFormatter(locale)`.
 *
 * Đầu vào luôn là đơn vị nghiệp vụ của Spec: cm, kg, cm³.
 */

export type FormatLocale = 'vi-VN' | 'en-US'

export type Formatter = {
  /** 8240 → "8.240" · "8,240" */
  integer(value: number): string
  /** Luôn một chữ số thập phân: 18.44 → "18,4" · "18.4" */
  decimal(value: number): string
  /** Bước 0,1 cm, bỏ phần thập phân khi tròn: 1250.55 → "1.250,6 cm" · 240 → "240 cm" */
  length(centimeters: number): string
  /** Dài × rộng × cao, một đơn vị ở cuối: "1.203,5 × 235 × 239,2 cm" */
  dimensions(lengthCm: number, widthCm: number, heightCm: number): string
  /** Bước 0,01 kg: 5320 → "5.320 kg" · "5,320 kg" */
  weight(kilograms: number): string
  /** Nguyên cm³, đơn vị của Spec: 324000 → "324.000 cm³" */
  volume(cubicCentimeters: number): string
  /** Nhận cm³, hiện m³ một chữ số thập phân cho tổng lớn: 18400000 → "18,4 m³" */
  volumeM3(cubicCentimeters: number): string
  /** Giá trị 0–100, một chữ số thập phân: 87.42 → "87,4%" · "87.4%" */
  percent(value: number): string
  /** Tỷ lệ 0–1, hai chữ số thập phân: 0.62 → "0,62" · "0.62" */
  ratio(value: number): string
  /** "14/09/2026" · "Sep 14, 2026" */
  date(value: Date | string): string
  /** Đồng hồ 24 giờ ở mọi ngôn ngữ: "14:30" */
  time(value: Date | string): string
}

const CUBIC_CENTIMETERS_PER_CUBIC_METER = 1_000_000

/**
 * Tiếng Việt ghi ngày trước tháng. Tiếng Anh ghi tên tháng thay vì 09/14/2026:
 * người dùng chuyển qua lại hai ngôn ngữ không thể đọc 03/04 thành một ngày khác.
 */
const DATE_OPTIONS: Record<FormatLocale, Intl.DateTimeFormatOptions> = {
  'vi-VN': { day: '2-digit', month: '2-digit', year: 'numeric' },
  'en-US': { day: 'numeric', month: 'short', year: 'numeric' },
}

/**
 * 24 giờ cho mọi ngôn ngữ (en-US mặc định là "02:30 PM"): điều phối, kho và tài xế
 * có thể dùng hai ngôn ngữ khác nhau mà vẫn phải đọc cùng một giờ xuất phát.
 */
const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
}

export function createFormatter(locale: FormatLocale): Formatter {
  const numbers = (options: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, options)

  const whole = numbers({ maximumFractionDigits: 0 })
  const oneDecimal = numbers({ minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const upToOneDecimal = numbers({ maximumFractionDigits: 1 })
  const twoDecimals = numbers({ minimumFractionDigits: 2, maximumFractionDigits: 2 })
  // kg, cm, % có trong danh sách unit của ECMA-402 nên để Intl ghép đơn vị;
  // m³ và cm³ thì không có, đành nối ký hiệu sau con số đã format.
  const centimeters = numbers({ style: 'unit', unit: 'centimeter', maximumFractionDigits: 1 })
  const kilograms = numbers({ style: 'unit', unit: 'kilogram', maximumFractionDigits: 2 })
  const percent = numbers({
    style: 'unit',
    unit: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  const date = new Intl.DateTimeFormat(locale, DATE_OPTIONS[locale])
  const time = new Intl.DateTimeFormat(locale, TIME_OPTIONS)

  return {
    integer: (value) => whole.format(value),
    decimal: (value) => oneDecimal.format(value),
    length: (value) => centimeters.format(value),
    dimensions: (lengthCm, widthCm, heightCm) =>
      `${upToOneDecimal.format(lengthCm)} × ${upToOneDecimal.format(widthCm)} × ${centimeters.format(heightCm)}`,
    weight: (value) => kilograms.format(value),
    volume: (value) => `${whole.format(value)} cm³`,
    volumeM3: (value) => `${oneDecimal.format(value / CUBIC_CENTIMETERS_PER_CUBIC_METER)} m³`,
    percent: (value) => percent.format(value),
    ratio: (value) => twoDecimals.format(value),
    date: (value) => date.format(toDate(value)),
    time: (value) => time.format(toDate(value)),
  }
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}

/* ---------------------------------------------------------------------------
   Lớp cũ cho các màn chưa dịch: cố định vi-VN và giữ đơn vị cũ (mm của LoadPlan).
   Chỉ còn những hàm đang có nơi gọi; code mới dùng `useFormat()` / `createFormatter`.
   LM-031 (mm → cm), LM-070 và LM-071 chuyển dần các nơi gọi rồi xoá phần này.
   --------------------------------------------------------------------------- */

const VI = createFormatter('vi-VN')

/** 8240 → "8.240" */
export function formatInteger(value: number): string {
  return VI.integer(value)
}

/** 18.44 → "18,4" */
export function formatDecimal(value: number): string {
  return VI.decimal(value)
}

/** 0.874 → "87,4%" — dùng khi nguồn dữ liệu là tỉ lệ 0–1 */
export function formatRatioAsPercent(ratio: number): string {
  return VI.percent(ratio * 100)
}

/** (7200, 2350, 2400) → "7.200 × 2.350 × 2.400 mm" — dữ liệu mm cũ, bỏ ở LM-031 */
export function formatDimensions(lengthMm: number, widthMm: number, heightMm: number): string {
  return `${[lengthMm, widthMm, heightMm].map((mm) => VI.integer(mm)).join(' × ')} mm`
}

/** Date → "14:30 14/09/2026" */
export function formatDateTime(value: Date | string): string {
  return `${VI.time(value)} ${VI.date(value)}`
}
