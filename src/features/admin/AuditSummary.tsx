import { CalendarDays, Clock, ScrollText } from 'lucide-react'
import { KpiTile } from '@/components/KpiTile'
import { useFormat, useT } from '@/lib/i18n'
import type { AuditSummary as Summary } from './audit-summary'

/**
 * Ba ô số liệu trên đầu Nhật ký (V2): tổng sự kiện, số sự kiện của ngày gần nhất có ghi nhận, giờ ghi gần nhất — đếm trên **cả**
 * nhật ký của kho (`summarizeAuditLog`), không theo bộ lọc hay ô tìm, nên con số không nhảy khi lọc bảng. Số sự kiện đang khớp
 * bộ lọc nằm cạnh tiêu đề màn. Ô ngày gần nhất là công tắc lọc: bấm thì khoảng ngày về đúng ngày đó, bấm lại thì bỏ.
 * Tint theo nghĩa cố định: xanh dương cho số sự kiện (vận hành), xám cho ngày giờ (ngữ cảnh, không phải số đo).
 */
export function AuditSummary({ summary, dayFiltered, onDayFilterChange }: {
  summary: Summary
  /** Bộ lọc khoảng ngày đang đúng bằng ngày gần nhất. */
  dayFiltered: boolean
  onDayFilterChange: (date: string | null) => void
}) {
  const t = useT()
  const format = useFormat()
  const { latestDay, latestAt } = summary
  const noValue = t('audit.log.summary.noValue')

  return (
    <section aria-label={t('audit.log.summary.region')} className="grid flex-none grid-cols-1 gap-3 md:grid-cols-3">
      <KpiTile
        icon={ScrollText}
        tone="blue"
        label={t('audit.log.summary.total')}
        value={format.integer(summary.total)}
        note={t('audit.log.summary.totalNote')}
      />
      {latestDay === null ? (
        <KpiTile
          icon={CalendarDays}
          tone="slate"
          label={t('audit.log.summary.latestDayNone')}
          value={noValue}
          note={t('audit.log.summary.noEvents')}
        />
      ) : (
        <KpiTile
          icon={CalendarDays}
          tone="slate"
          // Ngày `YYYY-MM-DD` là nửa đêm giờ máy để `format.date` in đúng ngày ở mọi múi giờ
          label={t('audit.log.summary.latestDay', { date: format.date(new Date(`${latestDay.date}T00:00:00`)) })}
          value={format.integer(latestDay.count)}
          note={t('audit.log.summary.latestDayNote')}
          pressed={dayFiltered}
          onPress={() => onDayFilterChange(dayFiltered ? null : latestDay.date)}
        />
      )}
      <KpiTile
        icon={Clock}
        tone="slate"
        label={t('audit.log.summary.latestAt')}
        value={latestAt === null ? noValue : format.time(latestAt)}
        note={latestAt === null ? t('audit.log.summary.noEvents') : t('audit.log.summary.latestAtNote', { date: format.date(latestAt) })}
      />
    </section>
  )
}
