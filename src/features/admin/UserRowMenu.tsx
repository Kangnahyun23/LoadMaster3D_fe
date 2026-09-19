import { KeyRound, Lock, LockOpen, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { User } from '@/types/user'
import type { AccountBlock, AccountGuards } from './account-guards'

export type UserAction = 'edit' | 'toggleLock' | 'resetPassword' | 'delete'

/**
 * Menu thao tác ở cuối mỗi dòng người dùng (LM-092): Sửa, Khoá/Mở khoá, Đặt lại mật khẩu, Xoá. Thao tác kho sẽ từ chối (tự khoá/xoá
 * mình, quản trị viên cuối) hiện mờ, không bấm được, kèm lý do ngay dưới — không để người dùng bấm rồi mới báo lỗi.
 */
export function UserRowMenu({ user, guards, onAction }: {
  user: User
  guards: AccountGuards
  onAction: (action: UserAction, user: User) => void
}) {
  const t = useT()
  const suspended = user.status === 'suspended'
  // Mở khoá chỉ bị chặn với chính mình; khoá thì theo cả luật quản trị viên cuối
  const lockBlock = suspended ? (guards.lock === 'self' ? 'self' : null) : guards.lock

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('admin.users.menu.open', { name: user.fullName })}>
          <MoreHorizontal strokeWidth={1.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuItem onSelect={() => onAction('edit', user)}>
          <Pencil strokeWidth={1.5} aria-hidden />
          {t('admin.users.menu.edit')}
        </DropdownMenuItem>
        <MenuAction
          icon={suspended ? <LockOpen strokeWidth={1.5} aria-hidden /> : <Lock strokeWidth={1.5} aria-hidden />}
          label={suspended ? t('admin.users.menu.unlock') : t('admin.users.menu.lock')}
          block={lockBlock}
          onSelect={() => onAction('toggleLock', user)}
        />
        <DropdownMenuItem onSelect={() => onAction('resetPassword', user)}>
          <KeyRound strokeWidth={1.5} aria-hidden />
          {t('admin.users.menu.resetPassword')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <MenuAction
          icon={<Trash2 strokeWidth={1.5} aria-hidden />}
          label={t('admin.users.menu.delete')}
          block={guards.remove}
          danger
          onSelect={() => onAction('delete', user)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Mục có thể bị chặn: chặn thì mờ đi (Radix `disabled`, bàn phím bỏ qua) và dòng lý do nằm ngay dưới nhãn. */
function MenuAction({ icon, label, block, danger = false, onSelect }: {
  icon: ReactNode
  label: string
  block: AccountBlock | null
  danger?: boolean
  onSelect: () => void
}) {
  const t = useT()
  return (
    <DropdownMenuItem
      disabled={block !== null}
      onSelect={onSelect}
      className={cn(block !== null && 'h-auto items-start py-1.5', danger && block === null && 'text-danger [&_svg]:text-danger')}
    >
      {icon}
      <span className="flex min-w-0 flex-col">
        <span>{label}</span>
        {block !== null ? <span className="text-caption text-text-3">{t(`admin.users.blocked.${block}`)}</span> : null}
      </span>
    </DropdownMenuItem>
  )
}
