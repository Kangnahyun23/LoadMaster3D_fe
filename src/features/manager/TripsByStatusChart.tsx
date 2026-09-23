import {
  CircleCheck, CircleX, ClipboardCheck, ClipboardList, FilePen, Loader, Package, PackageCheck, SlidersHorizontal, Truck,
  type LucideIcon,
} from 'lucide-react'
import { useFormat, useT } from '@/lib/i18n'
import type { TripStatus } from '@/types/trip'
import { ChartCard, ChartTable } from './ChartCard'
import type { DashboardSummary } from './dashboard-summary'
import { ShareBars } from './ShareBars'

/** Icon theo pha của chuyến (V2), để hàng đọc được mà không cần thêm màu: màu badge trạng thái để dành cho badge. */
const STATUS_ICON: Record<TripStatus, LucideIcon> = {
  nhap: FilePen,
  dang_toi_uu: Loader,
  da_toi_uu: SlidersHorizontal,
  da_duyet: ClipboardCheck,
  can_xem_lai: ClipboardList,
  dang_xep_hang: Package,
  da_xep_xong: PackageCheck,
  dang_giao: Truck,
  hoan_thanh: CircleCheck,
  da_huy: CircleX,
}

/**
 * Chuyến theo trạng thái theo thứ tự vòng đời (nháp → hoàn thành → huỷ), dạng hàng thanh ngang của V2: icon nền tint slate
 * (ngữ cảnh), nhãn, thanh, số chuyến và tỷ lệ trên tổng chuyến của kỳ. Tổng ở góc phải tiêu đề.
 */
export function TripsByStatusChart({ entries, total, className }: {
  entries: DashboardSummary['tripsByStatus']
  /** Tổng chuyến của kỳ — mẫu số của tỷ lệ. */
  total: number
  className?: string
}) {
  const t = useT()
  const format = useFormat()
  const title = t('manager.charts.status.title')
  const rows = entries.map((entry) => {
    const share = total === 0 ? 0 : (entry.count / total) * 100
    return { status: entry.status, label: t(`status.${entry.status}`), value: format.integer(entry.count), share, shareLabel: format.percent(share) }
  })

  return (
    <ChartCard
      className={className}
      title={title}
      note={t('manager.charts.status.note')}
      meta={t('manager.charts.status.total', { count: total })}
      table={
        <ChartTable
          title={title}
          headers={[t('manager.charts.status.status'), t('manager.charts.status.count'), t('manager.charts.status.share')]}
          rows={rows.map((row) => [row.label, row.value, row.shareLabel])}
        />
      }
    >
      <ShareBars
        layout="inline"
        rows={rows.map((row) => {
          const Icon = STATUS_ICON[row.status]
          return {
            ...row,
            key: row.status,
            label: (
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-6.5 flex-none place-items-center rounded-md bg-tint-slate text-tint-slate-fg">
                  <Icon className="size-4" strokeWidth={1.5} />
                </span>
                <span className="truncate">{row.label}</span>
              </span>
            ),
          }
        })}
      />
    </ChartCard>
  )
}
