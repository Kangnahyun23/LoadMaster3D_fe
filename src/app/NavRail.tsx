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
import { QuickSearch } from '@/features/search/QuickSearch'
import { useT, type MessageKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { initialsOf } from '@/types/user'
import { useGlassFollow } from './useGlassFollow'

type NavItem = {
  to: string
  labelKey: MessageKey
  icon: LucideIcon
  /** Mục chỉ hiện khi người đăng nhập có quyền mở màn đích (D-41). */
  permission: Permission
}

/** Thứ tự và nhãn lấy từ thanh điều hướng trong bản design V2. */
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
 * Thanh điều hướng ngang 56px: logo trái, nhóm mục giữa trên một mặt kính, chuông và
 * menu tài khoản phải. Mục đang mở có chữ xanh và weight 600; nền là chỉ báo kính trượt
 * theo con trỏ (`useGlassFollow`) — mục đang mở không có nền riêng, nếu không sẽ thành
 * hai lớp chồng nhau. Kính chỉ ở lớp chrome này, bề mặt đọc bên dưới giữ nền đặc.
 */
export function NavRail() {
  const t = useT()
  const { user, signOut } = useAuth()
  const can = useCan()
  const navigate = useNavigate()
  const { navRef, followRef } = useGlassFollow<HTMLElement>()

  async function handleSignOut() {
    await signOut()
    void navigate('/dang-nhap', { replace: true })
  }

  return (
    <header className="flex h-14 flex-none items-center gap-5 border-b border-border bg-chrome px-4 xl:gap-7 xl:px-shell">
      <Link to="/" aria-label={t('nav.home')} className="flex flex-none items-center gap-2.5 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <span aria-hidden className="grid size-9 place-items-center rounded-md bg-primary">
          <span className="h-2.5 w-4 rounded-xs border-2 border-t-4 border-white" />
        </span>
        <span className="hidden text-h3 font-semibold tracking-tight text-ink-strong lg:inline">LoadMaster</span>
      </Link>

      <nav
        ref={navRef}
        aria-label={t('nav.label')}
        className={cn(
          'glass-nav relative flex min-w-0 flex-1 gap-0.5 overflow-x-auto rounded-lg p-1 min-[1400px]:flex-none',
          'border border-white bg-linear-(--nav-glass) shadow-(--nav-glass-shadow) backdrop-blur-[18px] backdrop-saturate-150',
        )}
      >
        <span ref={followRef} aria-hidden className="glass-follow" />
        {NAV_ITEMS.filter((item) => can(item.permission)).map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            aria-label={t(labelKey)}
            className={({ isActive }) =>
              cn(
                'relative z-1 flex min-h-9 items-center gap-2 rounded-md px-2.5 text-body whitespace-nowrap xl:px-3.5',
                'outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
                isActive ? 'font-semibold text-primary-hover' : 'font-medium text-ink-2 hover:text-primary-hover',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="size-4.5 flex-none" strokeWidth={isActive ? 2 : 1.5} aria-hidden />
                <span className="hidden min-[1340px]:inline">{t(labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex flex-none items-center gap-1">
        <QuickSearch />
        <NotificationBell />
        <LanguageSwitch className="mx-1" />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={t('nav.account', { name: user.fullName })}
              className="grid size-9 place-items-center rounded-full bg-tint-blue text-caption font-semibold leading-none text-tint-blue-fg outline-none hover:bg-primary-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {initialsOf(user.fullName)}
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
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
      </div>
    </header>
  )
}
