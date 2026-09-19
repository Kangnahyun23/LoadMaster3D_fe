import { createColumnHelper } from '@tanstack/react-table'
import type { BaseTableFeatures, ColumnMeta } from '@/components/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { Formatter } from '@/lib/format'
import type { TFunction } from '@/lib/i18n'
import { initialsOf, type User } from '@/types/user'
import { accountGuards } from './account-guards'
import { UserRowMenu, type UserAction } from './UserRowMenu'

const helper = createColumnHelper<BaseTableFeatures, User>()

/**
 * Cột bảng người dùng (LM-092). Vai trò sắp theo tên hiển thị của ngôn ngữ đang chọn; hoạt động gần nhất bấm lần đầu là mới nhất
 * trước. Cột cuối là menu thao tác, chặn trước thao tác kho sẽ từ chối (`accountGuards`).
 */
export function userColumns(t: TFunction, format: Formatter, context: {
  users: readonly User[]
  currentUserId: string | null
  onAction: (action: UserAction, user: User) => void
}) {
  return helper.columns([
    helper.accessor('fullName', {
      header: t('admin.users.columns.user'),
      enableSorting: true,
      cell: (info) => (
        <span className="flex items-center gap-2.5">
          <span className="grid size-8 flex-none place-items-center rounded-full bg-primary-bg text-caption font-semibold leading-none text-primary-hover">
            {initialsOf(info.getValue())}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{info.getValue()}</span>
            <span className="truncate font-mono text-caption text-text-3">{info.row.original.email}</span>
          </span>
        </span>
      ),
    }),
    helper.accessor('phone', {
      header: t('admin.users.columns.phone'),
      meta: { width: '136px' } satisfies ColumnMeta,
      cell: (info) => <span className="font-mono text-caption">{info.getValue()}</span>,
    }),
    helper.accessor((user) => t(`roles.${user.role}`), {
      id: 'role',
      header: t('admin.users.columns.role'),
      enableSorting: true,
      meta: { width: '172px' } satisfies ColumnMeta,
    }),
    helper.accessor('depot', {
      header: t('admin.users.columns.depot'),
      enableSorting: true,
      meta: { width: '196px' } satisfies ColumnMeta,
      cell: (info) => <span className="block truncate">{info.getValue()}</span>,
    }),
    helper.accessor('lastActiveAt', {
      header: t('admin.users.columns.lastActive'),
      enableSorting: true,
      sortDescFirst: true,
      meta: { align: 'right', width: '176px' } satisfies ColumnMeta,
      cell: (info) => {
        const value = info.getValue()
        return value ? (
          <span className="font-mono text-caption">{`${format.time(value)} ${format.date(value)}`}</span>
        ) : (
          <span className="text-caption text-text-3">{t('admin.users.neverSignedIn')}</span>
        )
      },
    }),
    helper.accessor('status', {
      header: t('admin.users.columns.status'),
      meta: { width: '144px' } satisfies ColumnMeta,
      cell: (info) => (
        <Badge tone={info.getValue() === 'active' ? 'success' : 'danger'}>{t(`admin.users.status.${info.getValue()}`)}</Badge>
      ),
    }),
    helper.display({
      id: 'actions',
      header: () => <span className="sr-only">{t('admin.users.columns.actions')}</span>,
      meta: { align: 'right', width: '64px' } satisfies ColumnMeta,
      cell: (info) => (
        <UserRowMenu
          user={info.row.original}
          guards={accountGuards(info.row.original, context.currentUserId, context.users)}
          onAction={context.onAction}
        />
      ),
    }),
  ])
}
