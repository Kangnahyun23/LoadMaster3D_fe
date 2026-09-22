import { Outlet } from 'react-router'
import { NavRail } from './NavRail'

/** Khung desktop: thanh điều hướng ngang ở trên, nội dung màn bên dưới. */
export function AppShell() {
  return (
    <div className="app-shell flex h-dvh flex-col overflow-hidden bg-(image:--field)">
      <NavRail />
      <Outlet />
    </div>
  )
}
