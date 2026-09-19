import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { FilterBar } from '@/components/FilterBar'
import { StopLabel } from '@/components/StopLabel'
import { Spinner } from '@/components/ui/Spinner'
import { useListUrlState } from '@/components/useListUrlState'
import type { Formatter } from '@/lib/format'
import { useFormat, useT, type TFunction } from '@/lib/i18n'
import { isWithinDateRange, matchesQuery } from '@/lib/list-filter'
import { stopColor } from '@/lib/stops'
import type { SamplePackageRow } from '../design-system-api'
import { useSamplePackagesQuery } from '../useSamplePackagesQuery'

const helper = createColumnHelper<BaseTableFeatures, SamplePackageRow>()
const mono = 'font-mono text-caption'
const NO_ROWS: SamplePackageRow[] = []

/** Tiêu đề và số theo ngôn ngữ đang chọn, nên dựng trong component. */
function createColumns(t: TFunction, format: Formatter) {
  return helper.columns([
    helper.accessor('scheduledDate', {
      header: t('designSystem.components.data.table.date'),
      enableSorting: true,
      sortDescFirst: true,
      meta: { width: '120px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.date(info.getValue())}</span>,
    }),
    helper.accessor('tripName', {
      header: t('designSystem.components.data.table.trip'),
      cell: (info) => <span className="block truncate">{info.getValue()}</span>,
    }),
    helper.accessor('packageId', {
      header: t('designSystem.components.data.table.packageId'),
      enableSorting: true,
      meta: { width: '128px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{info.getValue()}</span>,
    }),
    helper.accessor('goods', {
      header: t('designSystem.components.data.table.goods'),
      cell: (info) => <span className="block truncate">{info.getValue()}</span>,
    }),
    helper.accessor('stop', {
      header: t('designSystem.components.data.table.stop'),
      meta: { width: '96px' } satisfies ColumnMeta,
      cell: (info) => (
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2 rounded-xs" style={{ background: stopColor(info.getValue()) }} />
          <StopLabel number={info.getValue()} />
        </span>
      ),
    }),
    helper.accessor('weightKg', {
      header: t('designSystem.components.data.table.weight'),
      enableSorting: true,
      // Tiêu đề sắp xếp được cần thêm chỗ cho mũi tên 16px.
      meta: { align: 'right', width: '128px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{format.weight(info.getValue())}</span>,
    }),
  ])
}

/**
 * Mẫu ghép đủ ba phần của LM-085 như một màn danh sách thật: `FilterBar` → màn tự lọc bằng `@/lib/list-filter`
 * → `DataTable` sắp xếp và phân trang, trạng thái giữ trên URL của trang tài liệu (`?q=…&chuyen=…&sap-xep=…`).
 */
export function DataTableSample() {
  const t = useT()
  const format = useFormat()
  const query = useSamplePackagesQuery()
  const list = useListUrlState({ filters: ['chuyen', 'tu', 'den'], defaultSort: { id: 'scheduledDate', desc: true } })
  const { chuyen: tripId, tu: from, den: to } = list.filters
  const all = query.data ?? NO_ROWS

  const columns = useMemo(() => createColumns(t, format), [t, format])
  const tripOptions = useMemo(() => {
    const names = new Map(all.map((row) => [row.tripId, row.tripName]))
    return [...names].map(([value, name]) => ({ value, label: `${value} · ${name}` }))
  }, [all])
  const rows = useMemo(() => all.filter((row) =>
    matchesQuery([row.packageId, row.goods, row.tripId, row.tripName], list.query)
    && (tripId === '' || row.tripId === tripId)
    && isWithinDateRange(row.scheduledDate, from, to)), [all, list.query, tripId, from, to])

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <FilterBar
        query={list.query}
        onQueryChange={list.setQuery}
        searchLabel={t('designSystem.components.data.table.search')}
        fields={[
          { kind: 'select', name: 'chuyen', label: t('designSystem.components.data.table.trip'), options: tripOptions },
          { kind: 'dateRange', label: t('designSystem.components.data.table.date'), from: 'tu', to: 'den' },
        ]}
        values={list.filters}
        onValueChange={list.setFilter}
        onClear={list.clearAll}
      />
      <div className="overflow-hidden rounded-md border border-border">
        {query.isPending ? (
          <div className="flex h-24 items-center justify-center"><Spinner /></div>
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            sorting={list.sorting}
            onSortingChange={list.setSorting}
            pagination={{ pageIndex: list.pageIndex, pageSize: list.pageSize, onPageChange: list.setPage, onPageSizeChange: list.setPageSize }}
            isFiltering={list.isFiltering}
            onClearFilters={list.clearAll}
          />
        )}
      </div>
    </div>
  )
}
