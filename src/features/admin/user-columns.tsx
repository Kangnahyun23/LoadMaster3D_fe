import { createColumnHelper } from '@tanstack/react-table'
import type { BaseTableFeatures, ColumnMeta } from '@/components/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { Formatter } from '@/lib/format'
import type { TFunction } from '@/lib/i18n'
import { initialsOf, type User, type UserStatus } from '@/types/user'
import { accountGuards } from './account-guards'
import { UserRowMenu, type UserAction } from './UserRowMenu'

const helper = createColumnHelper<BaseTableFeatures, User>()
const mono = 'font-mono text-caption text-ink-1'

/** Tint của ô chữ viết tắt đầu dòng — cùng nghĩa với ô số liệu của trạng thái đó (AGENTS mục 4, V2). */
const THUMB: Record<UserStatus, string> = {
  active: 'bg-tint-blue text-tint-blue-fg',
  suspended: 'bg-tint-amber text-tint-amber-fg',
}

/** Badge trạng thái (V2): đang hoạt động là trạng thái đang diễn ra nên có chấm; đã khoá là cần chú ý — cùng tông hổ phách với ô số liệu. */
const STATUS_BADGE: Record<UserStatus, { tone: 'success' | 'warning'; dot: boolean }> = {
  active: { tone: 'success', dot: true },
  suspended: { tone: 'warning', dot: false },
}

/**
 * Cột bảng người dùng (LM-092, V2): Người dùng (chữ viết tắt, tên, email) · Điện thoại · Vai trò · Kho / chi nhánh · Hoạt động gần
 * nhất · Trạng thái · menu. Vai trò sắp theo tên hiển thị của ngôn ngữ đang chọn; hoạt động gần nhất bấm lần đầu là mới nhất trước.
 * Cột cuối là menu thao tác, chặn trước thao tác kho sẽ từ chối (`accountGuards`).
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
        <span className="flex min-w-0 items-center gap-2.5">
          {/* Trang trí: tên đầy đủ nằm ngay bên cạnh */}
          <span
            aria-hidden
            className={`grid size-9 flex-none place-items-center rounded-lg text-caption font-semibold leading-none ${THUMB[info.row.original.status]}`}
          >
            {initialsOf(info.getValue())}
          </span>
          <span className="flex min-w-0 flex-col whitespace-normal">
            <span className="line-clamp-2 font-medium text-ink-strong">{info.getValue()}</span>
            {/* Khoảng trắng không hiện trong flex nhưng tách tên và email trong tên truy cập của dòng */}
            {' '}
            <span className="font-mono text-caption text-ink-3 wrap-anywhere">{info.row.original.email}</span>
          </span>
        </span>
      ),
    }),
    helper.accessor('phone', {
      header: t('admin.users.columns.phone'),
      meta: { width: '136px' } satisfies ColumnMeta,
      cell: (info) => <span className={mono}>{info.getValue()}</span>,
    }),
    helper.accessor((user) => t(`roles.${user.role}`), {
      id: 'role',
      header: t('admin.users.columns.role'),
      enableSorting: true,
      meta: { width: '172px' } satisfies ColumnMeta,
      // Nhãn ngữ cảnh, không phải trạng thái: nền slate, bo 6 px (không phải viên thuốc — không bấm được, không phải badge)
      cell: (info) => (
        <span className="inline-flex min-h-5.5 items-center rounded-sm bg-tint-slate px-2 text-caption font-medium text-tint-slate-fg">
          {info.getValue()}
        </span>
      ),
    }),
    helper.accessor('depot', {
      header: t('admin.users.columns.depot'),
      enableSorting: true,
      meta: { width: '196px' } satisfies ColumnMeta,
      cell: (info) => <span className="line-clamp-2 whitespace-normal text-ink-1">{info.getValue()}</span>,
    }),
    helper.accessor('lastActiveAt', {
      header: t('admin.users.columns.lastActive'),
      enableSorting: true,
      sortDescFirst: true,
      meta: { align: 'right', width: '176px' } satisfies ColumnMeta,
      cell: (info) => {
        const value = info.getValue()
        return value ? (
          <span className={mono}>{`${format.time(value)} ${format.date(value)}`}</span>
        ) : (
          <span className="text-caption text-ink-3">{t('admin.users.neverSignedIn')}</span>
        )
      },
    }),
    helper.accessor('status', {
      header: t('admin.users.columns.status'),
      meta: { width: '144px' } satisfies ColumnMeta,
      cell: (info) => {
        const badge = STATUS_BADGE[info.getValue()]
        return <Badge tone={badge.tone} dot={badge.dot}>{t(`admin.users.status.${info.getValue()}`)}</Badge>
      },
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
