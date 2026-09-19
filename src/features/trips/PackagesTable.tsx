import { createColumnHelper } from '@tanstack/react-table'
import { AlertCircle, FileUp, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { effectiveOrientations } from '@/domain/geometry'
import type { CargoPackage, VehicleConfig } from '@/domain/models'
import { useFormat, useT } from '@/lib/i18n'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import { EmptyTripsIllustration } from './EmptyTripsIllustration'
import { packageIssues } from './package-issues'
import type { StopRow } from './trip-summary'

/**
 * Bảng kiện của chuyến (LM-044). Phân trang 50 dòng thay vì ảo hoá: giữ số node DOM nhỏ ở 500 kiện mà không thêm
 * `@tanstack/react-virtual` vào stack (AGENTS mục 2 — chỉ thêm dependency khi có nhu cầu đã chứng minh).
 * "Nhập từ file" (LM-093) chỉ hiện khi được sửa chuyến — nút hoạt động thật (Spec 9.3, D-20).
 */
const PAGE_SIZE = 50
const mono = 'font-mono text-caption'

type Row = CargoPackage & { readonly errorCount: number; readonly warningCount: number; readonly stopName: string }

export function PackagesTable({ packages, vehicle, stops, selectedId, onSelect, onAdd, onImport }: {
  packages: readonly CargoPackage[]
  vehicle: VehicleConfig
  stops: readonly StopRow[]
  selectedId: string | null
  onSelect: (pkg: CargoPackage) => void
  /** Vắng khi không được thêm kiện (chỉ xem, chuyến đã khoá): ẩn nút Thêm kiện. */
  onAdd?: () => void
  /** Mở hộp thoại nhập kiện từ file (LM-093); vắng như `onAdd`. */
  onImport?: () => void
}) {
  const t = useT()
  const format = useFormat()
  const [stopFilter, setStopFilter] = useState<number | null>(null)
  const [onlyIssues, setOnlyIssues] = useState(false)
  const [page, setPage] = useState(0)

  const issues = useMemo(() => packageIssues(packages, vehicle), [packages, vehicle])
  const rows = useMemo<Row[]>(() => packages.map((pkg) => {
    const own = issues.byPackageId.get(pkg.id) ?? []
    return {
      ...pkg,
      errorCount: own.filter(({ severity }) => severity === 'error').length,
      warningCount: own.filter(({ severity }) => severity === 'warning').length,
      stopName: stops[pkg.deliveryStop - 1]?.name ?? '',
    }
  }), [packages, issues, stops])

  const filtered = useMemo(() => rows.filter((row) =>
    (stopFilter === null || row.deliveryStop === stopFilter) && (!onlyIssues || row.errorCount > 0)), [rows, stopFilter, onlyIssues])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const visible = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)

  const columns = useMemo(() => {
    const helper = createColumnHelper<BaseTableFeatures, Row>()
    return helper.columns([
      helper.accessor('id', {
        header: t('trips.packages.columns.id'),
        meta: { width: '110px' } satisfies ColumnMeta,
        cell: (info) => <span className={mono}>{info.getValue()}</span>,
      }),
      helper.accessor('name', {
        header: t('trips.packages.columns.name'),
        cell: (info) => <span className="block truncate">{info.getValue()}</span>,
      }),
      helper.display({
        id: 'size',
        header: t('trips.packages.columns.size'),
        meta: { align: 'right', width: '170px' } satisfies ColumnMeta,
        cell: ({ row }) => <span className={mono}>{format.dimensions(row.original.lengthCm, row.original.widthCm, row.original.heightCm)}</span>,
      }),
      helper.accessor('weightKg', {
        header: t('trips.packages.columns.weight'),
        meta: { align: 'right', width: '92px' } satisfies ColumnMeta,
        cell: (info) => <span className={mono}>{format.weight(info.getValue())}</span>,
      }),
      helper.accessor('quantity', {
        header: t('trips.packages.columns.quantity'),
        meta: { align: 'right', width: '72px' } satisfies ColumnMeta,
        cell: (info) => <span className={mono}>{format.integer(info.getValue())}</span>,
      }),
      helper.display({
        id: 'stop',
        header: t('trips.packages.columns.stop'),
        meta: { width: '150px' } satisfies ColumnMeta,
        cell: ({ row }) => <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden className="grid size-5 flex-none place-items-center rounded-sm font-mono text-[11px] leading-none font-semibold"
            style={{ background: stopColor(row.original.deliveryStop), color: stopForeground(row.original.deliveryStop) }}>
            {row.original.deliveryStop}
          </span>
          <span className="truncate"><span className="sr-only">{t('trips.packages.columns.stop')} {row.original.deliveryStop}: </span>{row.original.stopName}</span>
        </span>,
      }),
      helper.display({
        id: 'orientations',
        header: t('trips.packages.columns.orientations'),
        meta: { align: 'right', width: '72px' } satisfies ColumnMeta,
        cell: ({ row }) => <span className={mono}>{format.integer(effectiveOrientations(row.original).length)}</span>,
      }),
      helper.display({
        id: 'issues',
        header: t('trips.packages.columns.issues'),
        meta: { width: '120px' } satisfies ColumnMeta,
        cell: ({ row }) => <PackageIssueCell errorCount={row.original.errorCount} warningCount={row.original.warningCount} />,
      }),
    ])
  }, [t, format])

  if (packages.length === 0) {
    // Nút phụ: hành động chính của màn là "Chạy tối ưu" ở header (AGENTS mục 5, mỗi màn một nút primary)
    return <EmptyState
      illustration={<EmptyTripsIllustration />}
      title={t('trips.packages.emptyTitle')}
      description={t('trips.packages.emptyDescription')}
      action={onAdd || onImport ? (
        <div className="flex flex-wrap justify-center gap-2">
          {onAdd ? <Button variant="secondary" onClick={onAdd}><Plus strokeWidth={1.5} />{t('trips.packages.add')}</Button> : null}
          {onImport ? <Button variant="secondary" onClick={onImport}><FileUp strokeWidth={1.5} />{t('trips.import.open')}</Button> : null}
        </div>
      ) : undefined}
    />
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {onAdd ? <Button variant="secondary" className="h-9 px-3" onClick={onAdd}><Plus strokeWidth={1.5} />{t('trips.packages.add')}</Button> : null}
        {onImport ? <Button variant="secondary" className="h-9 px-3" onClick={onImport}><FileUp strokeWidth={1.5} />{t('trips.import.open')}</Button> : null}
        <label className="flex items-center gap-2 text-caption text-text-2">
          <span className="sr-only">{t('trips.packages.filterStop')}</span>
          <select
            aria-label={t('trips.packages.filterStop')}
            value={stopFilter ?? ''}
            onChange={(event) => { setStopFilter(event.target.value === '' ? null : Number(event.target.value)); setPage(0) }}
            className="h-9 rounded-md border border-border bg-bg px-2 text-body focus-visible:outline-2 focus-visible:outline-primary"
          >
            <option value="">{t('trips.packages.allStops')}</option>
            {stops.map((stop) => <option key={stop.id} value={stop.number}>{stop.number} · {stop.name}</option>)}
          </select>
        </label>
        <Button variant="secondary" className="h-9 px-3" aria-pressed={onlyIssues}
          onClick={() => { setOnlyIssues(!onlyIssues); setPage(0) }}>{t('trips.packages.onlyIssues')}</Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border">
        <DataTable data={visible} columns={columns} onRowClick={onSelect} isRowSelected={(row) => row.id === selectedId} />
      </div>

      {pages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-caption text-text-2">
          <Button variant="ghost" className="h-9 px-3" disabled={current === 0} onClick={() => setPage(current - 1)}>{t('trips.packages.previousPage')}</Button>
          <span className="font-mono">{t('trips.packages.page', { page: current + 1, pages })}</span>
          <Button variant="ghost" className="h-9 px-3" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>{t('trips.packages.nextPage')}</Button>
        </div>
      ) : null}
    </div>
  )
}

function PackageIssueCell({ errorCount, warningCount }: { errorCount: number; warningCount: number }) {
  const t = useT()
  if (errorCount === 0 && warningCount === 0) return <span className="text-caption text-text-3">{t('trips.packages.noIssues')}</span>
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
