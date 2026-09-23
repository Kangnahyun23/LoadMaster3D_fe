import { ScrollText } from 'lucide-react'
import { useMemo } from 'react'
import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { FilterBar } from '@/components/FilterBar'
import { PageHero } from '@/components/PageHero'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useListUrlState } from '@/components/useListUrlState'
import { useFormat, useT } from '@/lib/i18n'
import { compareText } from '@/lib/list-filter'
import { AUDIT_GROUPS, type AuditGroup } from '@/lib/mock-db'
import { cn } from '@/lib/utils'
import type { AuditLogFilter } from './audit-api'
import { auditColumns } from './audit-columns'
import { describeEvent, type AuditDirectory } from './audit-log'
import { useAuditDirectoryQuery, useAuditEventsQuery } from './useAuditLogQuery'

/** Bộ lọc trên URL (D-52): khoảng ngày, người làm, nhóm hành động; ô tìm (`q`) là mã đối tượng. */
const FILTERS = ['tu', 'den', 'nguoi-lam', 'nhom'] as const

/** Nhật ký dày: mặc định 50 dòng một trang (`so-dong` vắng là 50; người dùng vẫn chọn 25/100 ở chân bảng). */
const AUDIT_PAGE_SIZE = 50

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function isAuditGroup(value: string): value is AuditGroup {
  return AUDIT_GROUPS.some((group) => group === value)
}

/**
 * Nhật ký hệ thống `/nhat-ky` (LM-091, D-43) cho quản trị viên: mọi thao tác ghi của kho, mới nhất trước, lọc theo kỳ, người làm,
 * nhóm hành động và mã đối tượng, phân trang. Màn chỉ đọc nên không có nút primary.
 */
export function AuditLogPage() {
  const t = useT()
  const format = useFormat()
  const list = useListUrlState({ filters: FILTERS, defaultSort: { id: 'at', desc: true }, defaultPageSize: AUDIT_PAGE_SIZE })
  const { tu: from, den: to, 'nguoi-lam': actorId, nhom: group } = list.filters
  const targetId = list.query.trim()

  const filter = useMemo<AuditLogFilter>(() => ({
    ...(ISO_DATE.test(from) ? { from } : {}),
    ...(ISO_DATE.test(to) ? { to } : {}),
    ...(actorId ? { actorId } : {}),
    ...(targetId ? { targetId } : {}),
    ...(isAuditGroup(group) ? { group } : {}),
  }), [from, to, actorId, targetId, group])
  const events = useAuditEventsQuery(filter)
  const directoryQuery = useAuditDirectoryQuery()

  const directory = useMemo<AuditDirectory | undefined>(() => directoryQuery.data && {
    users: new Map(directoryQuery.data.users.map((user) => [user.id, user.fullName])),
    trips: new Map(directoryQuery.data.trips.map((trip) => [trip.id, trip.name])),
    vehicles: new Map(directoryQuery.data.vehicles.map((vehicle) => [vehicle.id, vehicle.name])),
  }, [directoryQuery.data])
  const rows = useMemo(
    () => (events.data && directory ? events.data.map((event) => describeEvent(event, directory, t, format)) : []),
    [events.data, directory, t, format],
  )
  const columns = useMemo(() => auditColumns(t, format), [t, format])
  const actorOptions = useMemo(() => (directoryQuery.data?.users ?? [])
    .map((user) => ({ value: user.id, label: user.fullName }))
    .toSorted((a, b) => compareText(a.label, b.label)), [directoryQuery.data])
  const groupOptions = AUDIT_GROUPS.map((value) => ({ value, label: t(`audit.groups.${value}`) }))

  const failed = events.isError || directoryQuery.isError
  const loading = !failed && (events.isPending || directoryQuery.isPending)

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHero
        icon={ScrollText}
        title={t('audit.log.title')}
        meta={events.data ? t('audit.log.count', { count: rows.length }) : undefined}
        description={t('pageHero.audit')}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-shell py-6">
        <FilterBar
          query={list.query}
          onQueryChange={list.setQuery}
          searchLabel={t('audit.log.search')}
          fields={[
            { kind: 'dateRange', label: t('audit.log.dateRange'), from: 'tu', to: 'den' },
            { kind: 'select', name: 'nguoi-lam', label: t('audit.log.actor'), options: actorOptions, allLabel: t('audit.log.allActors') },
            { kind: 'select', name: 'nhom', label: t('audit.log.group'), options: groupOptions, allLabel: t('audit.log.allGroups') },
          ]}
          values={list.filters}
          onValueChange={list.setFilter}
          onClear={list.clearAll}
        />

        {failed ? (
          <EmptyState
            title={t('audit.log.errorTitle')}
            description={t('audit.log.errorDescription')}
            action={
              <Button variant="secondary" onClick={() => void Promise.all([events.refetch(), directoryQuery.refetch()])}>
                {t('audit.log.retry')}
              </Button>
            }
          />
        ) : loading ? (
          <div role="status" aria-label={t('audit.log.loading')} className="flex h-24 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div
            aria-busy={events.isFetching || undefined}
            // flex-none: con `overflow-hidden` của cột flex được co về 0 — thiếu nó bảng bị cắt còn chiều cao khung, vùng cuộn không có gì để cuộn
            className={cn('flex-none overflow-hidden rounded-md border border-border bg-bg', events.isPlaceholderData && 'opacity-60')}
          >
            <DataTable
              data={rows}
              columns={columns}
              getRowId={(event) => event.id}
              density="comfortable"
              sorting={list.sorting}
              onSortingChange={list.setSorting}
              pagination={{ pageIndex: list.pageIndex, pageSize: list.pageSize, onPageChange: list.setPage, onPageSizeChange: list.setPageSize }}
              emptyMessage={t('audit.log.empty')}
              isFiltering={list.isFiltering}
              onClearFilters={list.clearAll}
              noMatchMessage={t('audit.log.noMatch')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
