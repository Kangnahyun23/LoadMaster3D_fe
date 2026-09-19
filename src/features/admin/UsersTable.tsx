import { useMemo } from 'react'
import { DataTable } from '@/components/DataTable'
import { FilterBar } from '@/components/FilterBar'
import { useListUrlState } from '@/components/useListUrlState'
import { useFormat, useT } from '@/lib/i18n'
import { matchesQuery } from '@/lib/list-filter'
import { ROLES, USER_STATUSES, type User } from '@/types/user'
import { userColumns } from './user-columns'
import type { UserAction } from './UserRowMenu'

/** Bộ lọc trên URL (D-52), tiếng Việt không dấu. */
const FILTERS = ['vai-tro', 'trang-thai'] as const

/**
 * Tab "Tài khoản" (LM-092): tìm theo tên, email, số điện thoại (có hay không có khoảng trắng), mã; lọc vai trò và trạng thái; sắp xếp,
 * phân trang — trạng thái nằm trên URL. Mặc định sắp theo tên.
 */
export function UsersTable({ users, currentUserId, onAction }: {
  users: readonly User[]
  currentUserId: string | null
  onAction: (action: UserAction, user: User) => void
}) {
  const t = useT()
  const format = useFormat()
  const list = useListUrlState({ filters: FILTERS, defaultSort: { id: 'fullName', desc: false } })
  const { 'vai-tro': role, 'trang-thai': status } = list.filters

  const columns = useMemo(
    () => userColumns(t, format, { users, currentUserId, onAction }),
    [t, format, users, currentUserId, onAction],
  )
  const rows = useMemo(() => users.filter((user) =>
    matchesQuery([user.fullName, user.email, user.phone, user.phone.replace(/\s/g, ''), user.id, user.depot], list.query)
    && (role === '' || user.role === role)
    && (status === '' || user.status === status)), [users, list.query, role, status])

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        query={list.query}
        onQueryChange={list.setQuery}
        searchLabel={t('admin.users.search')}
        fields={[
          {
            kind: 'select', name: 'vai-tro', label: t('admin.users.filters.role'), allLabel: t('admin.users.filters.allRoles'),
            options: ROLES.map((value) => ({ value, label: t(`roles.${value}`) })),
          },
          {
            kind: 'select', name: 'trang-thai', label: t('admin.users.filters.status'), allLabel: t('admin.users.filters.allStatuses'),
            options: USER_STATUSES.map((value) => ({ value, label: t(`admin.users.status.${value}`) })),
          },
        ]}
        values={list.filters}
        onValueChange={list.setFilter}
        onClear={list.clearAll}
      />
      <div className="overflow-hidden rounded-md border border-border bg-bg">
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(user) => user.id}
          density="comfortable"
          sorting={list.sorting}
          onSortingChange={list.setSorting}
          pagination={{ pageIndex: list.pageIndex, pageSize: list.pageSize, onPageChange: list.setPage, onPageSizeChange: list.setPageSize }}
          emptyMessage={t('admin.users.empty')}
          isFiltering={list.isFiltering}
          onClearFilters={list.clearAll}
          noMatchMessage={t('admin.users.noMatch')}
        />
      </div>
    </div>
  )
}
