import { createColumnHelper } from '@tanstack/react-table'
import type { BaseTableFeatures, ColumnMeta } from '@/components/DataTable'
import type { TFunction } from '@/lib/i18n'
import type { User } from '@/types/user'
import { accountGuards } from './account-guards'
import { LastActive, RoleLabel, UserAvatar, UserStatusBadge } from './user-look'
import { UserRowMenu, type UserAction } from './UserRowMenu'

const helper = createColumnHelper<BaseTableFeatures, User>()
const mono = 'font-mono text-caption text-ink-1'

/** Mã phần tử của nút mở panel ở tên người dùng: đóng panel thì trả con trỏ về đây. */
export function userOpenButtonId(userId: string) {
  return `user-open-${userId}`
}

/**
 * Cột bảng người dùng (LM-092, V2): Người dùng (chữ viết tắt, tên, email) · Điện thoại · Vai trò · Kho / chi nhánh · Hoạt động gần
 * nhất · Trạng thái · menu. Vai trò sắp theo tên hiển thị của ngôn ngữ đang chọn; hoạt động gần nhất bấm lần đầu là mới nhất trước.
 * Cột cuối là menu thao tác, chặn trước thao tác kho sẽ từ chối (`accountGuards`).
 * Panel chi tiết (V2): bấm dòng để mở; tên là nút bật/tắt cho bàn phím (`aria-pressed`). Panel đang mở thì bỏ cột Điện thoại —
 * số điện thoại đã nằm trong panel, bảng giữ đủ chỗ cho tên ở 1.366 px.
 */
export function userColumns(t: TFunction, context: {
  users: readonly User[]
  currentUserId: string | null
  onAction: (action: UserAction, user: User) => void
  selectedId: string | null
  onSelect: (user: User) => void
  panelId: string
}) {
  const phone = helper.accessor('phone', {
    header: t('admin.users.columns.phone'),
    meta: { width: '136px' } satisfies ColumnMeta,
    cell: (info) => <span className={mono}>{info.getValue()}</span>,
  })

  return helper.columns([
    helper.accessor('fullName', {
      header: t('admin.users.columns.user'),
      enableSorting: true,
      cell: (info) => {
        const user = info.row.original
        const selected = user.id === context.selectedId
        return (
          <span className="flex min-w-0 items-center gap-2.5">
            <UserAvatar fullName={user.fullName} status={user.status} />
            <span className="flex min-w-0 flex-col items-start whitespace-normal">
              {/* Dòng mở panel bằng chuột; nút ở tên cho bàn phím (AGENTS mục 10). Chặn nổi bọt để dòng không bật/tắt lần hai. */}
              <button
                type="button"
                id={userOpenButtonId(user.id)}
                aria-pressed={selected}
                aria-controls={selected ? context.panelId : undefined}
                onClick={(event) => { event.stopPropagation(); context.onSelect(user) }}
                className="cursor-pointer rounded-sm text-left font-medium text-ink-strong hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="line-clamp-2">{info.getValue()}</span>
              </button>
              {/* Khoảng trắng không hiện trong flex nhưng tách tên và email trong tên truy cập của dòng */}
              {' '}
              <span className="max-w-full font-mono text-caption text-ink-3 wrap-anywhere">{user.email}</span>
            </span>
          </span>
        )
      },
    }),
    ...(context.selectedId === null ? [phone] : []),
    helper.accessor((user) => t(`roles.${user.role}`), {
      id: 'role',
      header: t('admin.users.columns.role'),
      enableSorting: true,
      meta: { width: '172px' } satisfies ColumnMeta,
      cell: (info) => <RoleLabel role={info.row.original.role} />,
    }),
    helper.accessor('depot', {
      header: t('admin.users.columns.depot'),
      enableSorting: true,
      // Panel mở thì hẹp lại (kho dài xuống hai dòng) để email ở cột đầu không bị bẻ giữa chừng ở 1.366 px
      meta: { width: context.selectedId === null ? '196px' : '172px' } satisfies ColumnMeta,
      cell: (info) => <span className="line-clamp-2 whitespace-normal text-ink-1">{info.getValue()}</span>,
    }),
    helper.accessor('lastActiveAt', {
      header: t('admin.users.columns.lastActive'),
      enableSorting: true,
      sortDescFirst: true,
      meta: { align: 'right', width: '176px' } satisfies ColumnMeta,
      cell: (info) => <LastActive value={info.getValue()} />,
    }),
    helper.accessor('status', {
      header: t('admin.users.columns.status'),
      meta: { width: '144px' } satisfies ColumnMeta,
      cell: (info) => <UserStatusBadge status={info.getValue()} />,
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
