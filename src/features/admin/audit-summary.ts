import { vnDate, type AuditEvent } from '@/lib/mock-db'

/** Ba số trên đầu `/nhat-ky` (V2). Mọi số đếm từ sự kiện kho trả về — không có sự kiện thì không có ngày, không có giờ. */
export type AuditSummary = {
  readonly total: number
  /** Ngày gần nhất có ghi nhận, `YYYY-MM-DD` theo giờ Việt Nam — cùng cách bộ lọc khoảng ngày của kho tính ngày. */
  readonly latestDay: { readonly date: string; readonly count: number } | null
  /** ISO 8601 của sự kiện mới nhất. */
  readonly latestAt: string | null
}

/**
 * Tóm tắt nhật ký: tổng sự kiện, số sự kiện của ngày gần nhất có ghi nhận, thời điểm ghi gần nhất. Không dựa vào thứ tự kho trả
 * (mới nhất trước) để hàm đúng cả khi backend thật đổi thứ tự.
 */
export function summarizeAuditLog(events: readonly AuditEvent[]): AuditSummary {
  let latest: AuditEvent | undefined
  for (const event of events) {
    if (latest === undefined || Date.parse(event.at) > Date.parse(latest.at)) latest = event
  }
  if (latest === undefined) return { total: 0, latestDay: null, latestAt: null }

  const date = vnDate(new Date(latest.at))
  const count = events.filter((event) => vnDate(new Date(event.at)) === date).length
  return { total: events.length, latestDay: { date, count }, latestAt: latest.at }
}
