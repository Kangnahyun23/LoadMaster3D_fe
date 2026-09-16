import {
  Box,
  LayoutDashboard,
  LogOut,
  Tablet,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { useAuth } from '@/features/auth/AuthProvider'
import { useT, type MessageKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { initialsOf } from '@/types/user'

type NavItem = {
  to: string
  labelKey: MessageKey
  icon: LucideIcon
}

/** Thứ tự và nhãn lấy từ nav rail trong bản design. */
const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/chuyen', labelKey: 'nav.trips', icon: Truck },
  { to: '/kho', labelKey: 'nav.warehouse', icon: Tablet },
  { to: '/tai-xe/diem-giao', labelKey: 'nav.driver', icon: Box },
  { to: '/doi-xe', labelKey: 'nav.fleet', icon: Warehouse },
  { to: '/nguoi-dung', labelKey: 'nav.users', icon: Users },
] as const satisfies readonly NavItem[]

const RAIL_BUTTON = [
  'grid size-11 place-items-center rounded-md',
  'transition-colors duration-(--dur-fast) ease-standard',
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
].join(' ')

/** Nav rail 72px, nút 44px, icon 20px stroke 1.5, tooltip bên phải khi hover. */
export function NavRail() {
  const t = useT()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    void navigate('/dang-nhap', { replace: true })
  }

  return (
    <nav
      aria-label={t('nav.label')}
      className="flex w-18 flex-none flex-col items-center gap-1 border-r border-border bg-surface py-3"
    >
      <div className="mb-3 grid size-9 place-items-center rounded-md bg-primary">
        <div className="h-2.75 w-4 rounded-xs border-2 border-t-4 border-white" />
      </div>

      {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => (
        <Tooltip key={to}>
          <TooltipTrigger asChild>
            <NavLink
              to={to}
              end={to === '/'}
              aria-label={t(labelKey)}
              className={({ isActive }) =>
                cn(
                  RAIL_BUTTON,
                  isActive
                    ? 'bg-primary-bg text-primary-hover'
                    : 'text-text-2 hover:bg-primary-bg',
                )
              }
            >
              <Icon className="size-5" strokeWidth={1.5} aria-hidden />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">{t(labelKey)}</TooltipContent>
        </Tooltip>
      ))}

      <div className="flex-1" />

      <LanguageSwitch orientation="vertical" className="mb-2" />

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={t('nav.account', { name: user.fullName })}
            className="mt-2 grid size-8 place-items-center rounded-full bg-primary-bg text-caption font-semibold leading-none text-primary-hover outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
