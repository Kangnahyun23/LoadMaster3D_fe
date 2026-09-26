import { FileUp, Plus, Search } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { CargoPackage, VehicleConfig } from '@/domain/models'
import { useFormat, useT } from '@/lib/i18n'
import { matchesQuery } from '@/lib/list-filter'
import { cn } from '@/lib/utils'
import { EmptyTripsIllustration } from './EmptyTripsIllustration'
import { createPackageColumns, type PackageRow } from './package-columns'
import { packageIssues } from './package-issues'
import { isFragile } from './package-requirements'
import type { StopRow } from './trip-summary'

/**
 * Bảng kiện của chuyến (LM-044, V2): một thẻ gồm tiêu đề, thanh công cụ (tìm mã/tên, lọc điểm giao, chip "Chỉ hàng dễ vỡ" và "Chỉ
 * kiện có lỗi", thêm/nhập kiện) và bảng. Lọc điểm giao do trang giữ để cột điểm giao bên trái lọc cùng một chỗ.
 * Phân trang 50 dòng thay vì ảo hoá: giữ số node DOM nhỏ ở 500 kiện mà không thêm `@tanstack/react-virtual` (AGENTS mục 2).
 * "Nhập từ file" (LM-093) chỉ hiện khi được sửa chuyến — nút hoạt động thật (Spec 9.3, D-20).
 */
const PAGE_SIZE = 50

export function PackagesTable({ packages, vehicle, stops, selectedId, onSelect, onAdd, onImport, stopFilter, onStopFilterChange }: {
  packages: readonly CargoPackage[]
  vehicle: VehicleConfig
  stops: readonly StopRow[]
  selectedId: string | null
  onSelect: (pkg: CargoPackage) => void
  /** Vắng khi không được thêm kiện (chỉ xem, chuyến đã khoá): ẩn nút Thêm kiện. */
  onAdd?: () => void
  /** Mở hộp thoại nhập kiện từ file (LM-093); vắng như `onAdd`. */
  onImport?: () => void
  stopFilter: number | null
  onStopFilterChange: (stop: number | null) => void
}) {
  const t = useT()
  const format = useFormat()
  const [query, setQuery] = useState('')
  const [onlyFragile, setOnlyFragile] = useState(false)
  const [onlyIssues, setOnlyIssues] = useState(false)
  const [page, setPage] = useState(0)

  const issues = useMemo(() => packageIssues(packages, vehicle), [packages, vehicle])
  const rows = useMemo<PackageRow[]>(() => packages.map((pkg) => {
    const own = issues.byPackageId.get(pkg.id) ?? []
    return {
      ...pkg,
      errorCount: own.filter(({ severity }) => severity === 'error').length,
      warningCount: own.filter(({ severity }) => severity === 'warning').length,
      stopName: stops[pkg.deliveryStop - 1]?.name ?? '',
    }
  }), [packages, issues, stops])

  const filtered = useMemo(() => rows.filter((row) =>
    (stopFilter === null || row.deliveryStop === stopFilter)
    && (!onlyFragile || isFragile(row))
    && (!onlyIssues || row.errorCount > 0)
    && matchesQuery([row.id, row.name], query)), [rows, stopFilter, onlyFragile, onlyIssues, query])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const visible = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)
  const columns = useMemo(() => createPackageColumns(t, format), [t, format])

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

  const resetPage = <T,>(set: (value: T) => void) => (value: T) => { set(value); setPage(0) }

  return (
    // flex-none: con overflow-hidden của cột flex bị co về 0 (AGENTS mục 5, "Cuộn trong khung ứng dụng")
    <section aria-labelledby="packages-title" className="relative flex min-w-0 flex-none flex-col overflow-hidden rounded-lg border border-border bg-bg">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 pt-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <h2 id="packages-title" className="text-h3 font-semibold text-ink-strong">{t('trips.packages.title')}</h2>
            <span className="font-mono text-caption text-ink-3">{t('trips.packages.lineCount', { count: packages.length })}</span>
          </div>
          <p className="text-caption text-ink-2">{t('trips.packages.hint')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onAdd ? <Button variant="secondary" className="h-9 px-3" onClick={onAdd}><Plus strokeWidth={1.5} />{t('trips.packages.add')}</Button> : null}
          {onImport ? <Button variant="secondary" className="h-9 px-3" onClick={onImport}><FileUp strokeWidth={1.5} />{t('trips.import.open')}</Button> : null}
        </div>
      </div>

      <div role="search" aria-label={t('common.filters.region')} className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <div className="relative min-w-52 flex-1">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" strokeWidth={1.5} />
          <Input type="search" aria-label={t('trips.packages.search')} placeholder={t('trips.packages.search')} value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(0) }} className="h-9 pl-9" />
        </div>
        <select
          aria-label={t('trips.packages.filterStop')}
          value={stopFilter ?? ''}
          onChange={(event) => { onStopFilterChange(event.target.value === '' ? null : Number(event.target.value)); setPage(0) }}
          className="h-9 max-w-56 rounded-md border border-border bg-bg px-2 text-body focus-visible:outline-2 focus-visible:outline-primary"
        >
          <option value="">{t('trips.packages.allStops')}</option>
          {stops.map((stop) => <option key={stop.id} value={stop.number}>{stop.number} · {stop.name}</option>)}
        </select>
        <FilterChip pressed={onlyFragile} onToggle={resetPage(setOnlyFragile)}>{t('trips.packages.onlyFragile')}</FilterChip>
        <FilterChip pressed={onlyIssues} onToggle={resetPage(setOnlyIssues)}>{t('trips.packages.onlyIssues')}</FilterChip>
      </div>

      {/* Khung cuộn ngang khi cột giữa hẹp hơn tổng cột cố định; relative vì ô ẩn định vị tuyệt đối (AGENTS mục 5) */}
      <div className="relative overflow-x-auto">
        <div className="min-w-165">
          <DataTable data={visible} columns={columns} density="roomy" appearance="paper" onRowClick={onSelect}
            isRowSelected={(row) => row.id === selectedId} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-caption text-ink-3">
        <span>
          {t('trips.packages.shown', {
            shown: format.integer(filtered.length),
            total: format.integer(rows.length),
            instances: format.integer(filtered.reduce((sum, row) => sum + row.quantity, 0)),
          })}
        </span>
        {pages > 1 ? (
          <span className="flex items-center gap-2">
            <Button variant="ghost" className="h-9 px-3" disabled={current === 0} onClick={() => setPage(current - 1)}>{t('trips.packages.previousPage')}</Button>
            <span className="font-mono">{t('trips.packages.page', { page: current + 1, pages })}</span>
            <Button variant="ghost" className="h-9 px-3" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>{t('trips.packages.nextPage')}</Button>
          </span>
        ) : <span>{t('trips.packages.units')}</span>}
      </div>
    </section>
  )
}

/** Chip lọc bật/tắt dạng viên thuốc (AGENTS mục 5: viên thuốc chỉ cho badge, chip lọc, thanh tiến độ). */
function FilterChip({ pressed, onToggle, children }: { pressed: boolean; onToggle: (next: boolean) => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onToggle(!pressed)}
      className={cn(
        'h-9 rounded-full border px-3.5 text-body font-medium transition-colors duration-(--dur-fast) ease-standard',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        pressed ? 'border-primary bg-primary-bg text-primary' : 'border-border bg-bg text-ink-1 hover:bg-surface',
      )}
    >
      {children}
    </button>
  )
}
