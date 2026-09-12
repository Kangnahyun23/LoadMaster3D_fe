import {
  Box,
  LayoutDashboard,
  LogOut,
  Settings,
  Tablet,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router'
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
import { cn } from '@/lib/utils'
import { initialsOf, ROLE_LABELS } from '@/types/user'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

/** Thứ tự và nhãn lấy từ nav rail trong bản design. */
const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { to: '/chuyen', label: 'Chuyến hàng', icon: Truck },
  { to: '/kho', label: 'Máy tính bảng kho', icon: Tablet },
  { to: '/tai-xe/diem-giao', label: 'Màn hình tài xế', icon: Box },
  { to: '/doi-xe', label: 'Đội xe', icon: Warehouse },
  { to: '/nguoi-dung', label: 'Người dùng', icon: Users },
]

const RAIL_BUTTON = [
  'grid size-11 place-items-center rounded-md',
  'transition-colors duration-(--dur-fast) ease-standard',
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
].join(' ')

/** Nav rail 72px, nút 44px, icon 20px stroke 1.5, tooltip bên phải khi hover. */
export function NavRail() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    void navigate('/dang-nhap', { replace: true })
  }

  return (
    <nav
      aria-label="Điều hướng chính"
      className="flex w-18 flex-none flex-col items-center gap-1 border-r border-border bg-surface py-3"
    >
      <div className="mb-3 grid size-9 place-items-center rounded-md bg-primary">
        <div className="h-2.75 w-4 rounded-xs border-2 border-t-4 border-white" />
      </div>

      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <Tooltip key={to}>
          <TooltipTrigger asChild>
            <NavLink
              to={to}
              end={to === '/'}
              aria-label={label}
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
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      ))}

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Cài đặt"
            className={cn(RAIL_BUTTON, 'text-text-2 hover:bg-primary-bg')}
          >
            <Settings className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Cài đặt</TooltipContent>
      </Tooltip>

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Tài khoản ${user.fullName}`}
            className="mt-2 grid size-8 place-items-center rounded-full bg-primary-bg text-caption font-semibold leading-none text-primary-hover outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {initialsOf(user.fullName)}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end">
            <DropdownMenuLabel>
              <span className="text-body font-medium text-text">{user.fullName}</span>
              <span className="text-caption text-text-3">{user.email}</span>
              <span className="text-caption text-text-3">
                {ROLE_LABELS[user.role]} · {user.depot}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void handleSignOut()}>
              <LogOut strokeWidth={1.5} aria-hidden />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </nav>
  )
}
