import { Outlet } from 'react-router'
import { NavRail } from './NavRail'

/** Khung desktop: nav rail cố định bên trái, nội dung màn bên phải. */
export function AppShell() {
  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <NavRail />
      <Outlet />
    </div>
  )
}
