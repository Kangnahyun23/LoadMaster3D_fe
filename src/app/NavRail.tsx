import {
  Box,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Tablet,
  Truck,
  UserRound,
  Users,
  Warehouse,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useAuth } from '@/features/auth/AuthProvider'
import type { Permission } from '@/features/auth/permissions'
import { useCan } from '@/features/auth/useCan'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import { useT, type MessageKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { initialsOf } from '@/types/user'

type NavItem = {
  to: string
  labelKey: MessageKey
  icon: LucideIcon
  /** Mục chỉ hiện khi người đăng nhập có quyền mở màn đích (D-41). */
  permission: Permission
}

/** Thứ tự và nhãn lấy từ nav rail trong bản design. */
const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
  { to: '/chuyen', labelKey: 'nav.trips', icon: Truck, permission: 'trips.view' },
  { to: '/kho', labelKey: 'nav.warehouse', icon: Tablet, permission: 'warehouse.operate' },
  { to: '/tai-xe', labelKey: 'nav.driver', icon: Box, permission: 'driver.operate' },
  { to: '/doi-xe', labelKey: 'nav.fleet', icon: Warehouse, permission: 'fleet.view' },
  { to: '/nguoi-dung', labelKey: 'nav.users', icon: Users, permission: 'users.manage' },
  { to: '/nhat-ky', labelKey: 'nav.audit', icon: ScrollText, permission: 'audit.view' },
] as const satisfies readonly NavItem[]

/**
 * Nav rail 96px: mỗi mục là icon 24px kèm nhãn chữ, vùng bấm ≥ 56px. Mục đang mở có nền `--primary-bg`,
 * chữ đậm màu primary và vạch 4px ở mép trái — không chỉ dựa vào màu nhạt để phân biệt.
 */
export function NavRail() {
  const t = useT()
  const { user, signOut } = useAuth()
  const can = useCan()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    void navigate('/dang-nhap', { replace: true })
  }

  return (
    <nav
      aria-label={t('nav.label')}
      className="flex w-24 flex-none flex-col items-center gap-1 overflow-y-auto border-r border-border bg-surface py-3"
    >
      <div className="mb-3 grid size-10 place-items-center rounded-md bg-primary">
        <div className="h-3 w-4.5 rounded-xs border-2 border-t-4 border-white" />
      </div>

      {NAV_ITEMS.filter((item) => can(item.permission)).map(({ to, labelKey, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'group relative flex min-h-16 w-full flex-col items-center justify-center gap-1 px-2 py-2 text-center',
              'outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
              isActive ? 'text-primary-hover' : 'text-text-2 hover:text-text',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                aria-hidden
                className={cn(
                  'absolute top-1/2 left-0 h-10 w-1 -translate-y-1/2 rounded-r-sm bg-primary transition-opacity duration-(--dur-fast) ease-standard',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
              <span
                className={cn(
                  'grid h-8 w-14 place-items-center rounded-md transition-colors duration-(--dur-fast) ease-standard',
                  isActive ? 'bg-primary-bg' : 'group-hover:bg-border',
                )}
              >
                <Icon className="size-6" strokeWidth={isActive ? 2 : 1.5} aria-hidden />
              </span>
              <span className={cn('text-caption leading-4', isActive ? 'font-semibold' : 'font-medium')}>{t(labelKey)}</span>
            </>
          )}
        </NavLink>
      ))}

      <div className="flex-1" />

      <NotificationBell />

      <LanguageSwitch orientation="vertical" className="mb-2" />

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={t('nav.account', { name: user.fullName })}
            className="mt-2 grid size-11 place-items-center rounded-full bg-primary-bg text-body font-semibold leading-none text-primary-hover outline-none hover:bg-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {initialsOf(user.fullName)}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end">
            <DropdownMenuLabel>
              <span className="text-body font-medium text-text">{user.fullName}</span>
              <span className="text-caption text-text-3">{user.email}</span>
              <span className="text-caption text-text-3">
                {t(`roles.${user.role}`)} · {user.depot}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/ho-so">
                <UserRound strokeWidth={1.5} aria-hidden />
                {t('nav.profile')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void handleSignOut()}>
              <LogOut strokeWidth={1.5} aria-hidden />
              {t('nav.signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </nav>
  )
}
