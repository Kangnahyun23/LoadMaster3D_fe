import { ChevronLeft, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useAuth } from './AuthProvider'
import { exitAction } from './exit'

type ExitTarget = {
  /**
   * Đường dẫn màn nút này nằm trên (`/kho`, `/kho?chuyen=TRIP-…`). Trùng màn chính của vai trò thì thoát là đăng xuất; khác thì
   * về màn chính (`exitAction`).
   */
  screenHome: string
  /** Trang của điều phối viên đã mở màn này, ví dụ chi tiết chuyến. */
  contextual?: string
}

/** Thoát theo vai trò đang đăng nhập (`exitAction`): đăng xuất ở màn chính của vai trò, còn lại quay về trang phù hợp. */
function useExit({ screenHome, contextual }: ExitTarget) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const action = user ? exitAction(user.role, screenHome, contextual) : { kind: 'link' as const, to: '/dang-nhap' }
  async function handleSignOut() {
    await signOut()
    void navigate('/dang-nhap', { replace: true })
  }
  return { action, handleSignOut, isContextual: action.kind === 'link' && (action.to === contextual || user?.role === 'dispatcher') }
}

/** Nút thoát cỡ cảm ứng ở thanh trên của màn toàn màn hình. */
export function ExitIconButton({ label, className, iconClassName, ...target }: ExitTarget & {
  /** Nhãn khi thoát là quay về trang khác, ví dụ "Thoát phiên xếp hàng". */
  label: string
  className?: string
  iconClassName?: string
}) {
  const t = useT()
  const { action, handleSignOut } = useExit(target)
  const classes = cn(
    'grid size-14 flex-none place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    className,
  )
  if (action.kind === 'signOut') {
    return (
      <button type="button" aria-label={t('nav.signOut')} onClick={() => void handleSignOut()} className={classes}>
        <LogOut className={iconClassName} strokeWidth={2} aria-hidden />
      </button>
    )
  }
  return (
    <Link to={action.to} aria-label={label} className={classes}>
      <ChevronLeft className={iconClassName} strokeWidth={2} aria-hidden />
    </Link>
  )
}

/** Nút hành động cỡ cảm ứng (trạng thái rỗng, xếp xong): cùng quy tắc thoát, chữ nói đúng việc sẽ xảy ra. */
export function ExitActionButton({ label, variant = 'primary', ...target }: ExitTarget & {
  /** Chữ khi điều phối viên quay về trang chuyến, ví dụ "Về chi tiết chuyến". */
  label: string
  variant?: 'primary' | 'secondary'
}) {
  const t = useT()
  const { action, handleSignOut, isContextual } = useExit(target)
  if (action.kind === 'signOut') {
    return (
      <Button variant={variant} size="touch" onClick={() => void handleSignOut()}>
        <LogOut strokeWidth={1.5} aria-hidden />
        {t('nav.signOut')}
      </Button>
    )
  }
  return (
    <Button variant={variant} size="touch" asChild>
      <Link to={action.to}>{isContextual ? label : t('nav.backHome')}</Link>
    </Button>
  )
}
