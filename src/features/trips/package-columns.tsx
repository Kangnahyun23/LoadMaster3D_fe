import { createColumnHelper } from '@tanstack/react-table'
import { AlertCircle } from 'lucide-react'
import type { BaseTableFeatures, ColumnMeta } from '@/components/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { CargoPackage } from '@/domain/models'
import type { Formatter } from '@/lib/format'
import type { TFunction } from '@/lib/i18n'
import { useT } from '@/lib/i18n'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import { packageRequirements, type PackageRequirement } from './package-requirements'

const mono = 'font-mono text-caption'
/** Tên điểm giao xuống tối đa hai dòng thay vì cắt bằng dấu ba chấm (LM-095). */
const WRAP_2 = 'line-clamp-2 whitespace-normal'
/** Hai chip đầu hiện, còn lại gom thành "+n" — ô 56 px chứa vừa hai chip xếp chồng. */
const MAX_CHIPS = 2

export type PackageRow = CargoPackage & { readonly errorCount: number; readonly warningCount: number; readonly stopName: string }

/**
 * Cột bảng kiện (LM-044, V2): Kiện hàng (tên / mã · D × R × C) · Khối lượng · Số lượng · Điểm giao · Yêu cầu · Lỗi. Mã và kích thước
 * gộp dưới tên như V2; cột Yêu cầu thay cột số hướng đặt bằng chip đọc được ngay (dễ vỡ, giữ đứng, không xếp chồng, được xoay).
 */
export function createPackageColumns(t: TFunction, format: Formatter) {
  const helper = createColumnHelper<BaseTableFeatures, PackageRow>()
  return helper.columns([
    helper.accessor('name', {
      header: t('trips.packages.columns.package'),
      cell: ({ row }) => (
        <span className="flex min-w-0 flex-col whitespace-normal">
          <span className="line-clamp-1 text-body font-medium text-ink-strong" title={row.original.name}>{row.original.name}</span>
          {/* Khoảng trắng không hiện trong flex nhưng tách tên và mã trong tên truy cập của dòng */}
          {' '}
          <span className={cn(mono, 'text-ink-3')}>
            {row.original.id} · {format.dimensions(row.original.lengthCm, row.original.widthCm, row.original.heightCm)}
          </span>
        </span>
      ),
    }),
    helper.accessor('weightKg', {
      header: t('trips.packages.columns.weight'),
      meta: { align: 'right', width: '100px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.weight(info.getValue())}</span>,
    }),
    helper.accessor('quantity', {
      header: t('trips.packages.columns.quantity'),
      meta: { align: 'right', width: '88px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.integer(info.getValue())}</span>,
    }),
    helper.display({
      id: 'stop',
      header: t('trips.packages.columns.stop'),
      // Theo tỷ lệ bảng, tên điểm giao tối đa hai dòng; cột Kiện hàng nhận phần còn lại
      meta: { width: '24%' } satisfies ColumnMeta,
      cell: ({ row }) => <span className="flex min-w-0 items-center gap-2">
        <span aria-hidden className="grid size-5 flex-none place-items-center rounded-sm font-mono text-micro font-semibold"
          style={{ background: stopColor(row.original.deliveryStop), color: stopForeground(row.original.deliveryStop) }}>
          {row.original.deliveryStop}
        </span>
        <span className={WRAP_2}><span className="sr-only">{t('trips.packages.columns.stop')} {row.original.deliveryStop}: </span>{row.original.stopName}</span>
      </span>,
    }),
    helper.display({
      id: 'requirements',
      header: t('trips.packages.columns.requirements'),
      meta: { width: '132px' } satisfies ColumnMeta,
      cell: ({ row }) => <RequirementChips requirements={packageRequirements(row.original)} />,
    }),
    helper.display({
      id: 'issues',
      header: t('trips.packages.columns.issues'),
      meta: { width: '96px' } satisfies ColumnMeta,
      cell: ({ row }) => <PackageIssueCell errorCount={row.original.errorCount} warningCount={row.original.warningCount} />,
    }),
  ])
}

function RequirementChips({ requirements }: { requirements: readonly PackageRequirement[] }) {
  const t = useT()
  const shown = requirements.slice(0, MAX_CHIPS)
  const hidden = requirements.slice(MAX_CHIPS)
  return (
    <span className="flex flex-wrap items-center gap-1">
      {shown.map((requirement) => (
        <Badge key={requirement} tone={requirement === 'fragile' ? 'warning' : 'neutral'}>{t(`trips.packages.req.${requirement}`)}</Badge>
      ))}
      {hidden.length > 0 ? (
        <span className="text-caption text-ink-3" title={hidden.map((requirement) => t(`trips.packages.req.${requirement}`)).join(', ')}>
          {t('trips.packages.req.more', { count: hidden.length })}
        </span>
      ) : null}
    </span>
  )
}

function PackageIssueCell({ errorCount, warningCount }: { errorCount: number; warningCount: number }) {
  const t = useT()
  if (errorCount === 0 && warningCount === 0) return <span className="text-caption text-ink-3">{t('trips.packages.noIssues')}</span>
  const danger = errorCount > 0
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-caption', danger ? 'text-badge-danger-fg' : 'text-badge-warning-fg')}>
      <AlertCircle className="size-3.5 flex-none" strokeWidth={2} aria-hidden />
      {danger
        ? t('trips.packages.issueCount', { count: errorCount })
        : t('trips.packages.warningCount', { count: warningCount })}
    </span>
  )
}
