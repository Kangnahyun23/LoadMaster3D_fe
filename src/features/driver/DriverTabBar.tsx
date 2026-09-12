import { MapPin, Package, Truck, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

type Tab = { to: string; label: string; icon: LucideIcon }

const TABS: Tab[] = [
  { to: '/tai-xe/chuyen', label: 'Chuyến', icon: Truck },
  { to: '/tai-xe/diem-giao', label: 'Điểm giao', icon: MapPin },
  { to: '/tai-xe/kien-hang', label: 'Kiện hàng', icon: Package },
  { to: '/tai-xe/tai-khoan', label: 'Tài khoản', icon: User },
]

/** Thanh tab đáy màn tài xế, 4 mục, cao 64px + vùng an toàn của máy. */
export function DriverTabBar() {
  return (
    <nav
      aria-label="Điều hướng tài xế"
      className="grid h-16 grid-cols-4 border-t border-border bg-bg pb-[env(safe-area-inset-bottom)]"
    >
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-0.5 text-body-lg leading-[18px]',
              'outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary',
              isActive ? 'font-semibold text-primary-hover' : 'font-medium text-text-2',
            )
          }
        >
          <Icon className="size-6" strokeWidth={2} aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
