import { Outlet } from 'react-router'
import { ForbiddenPage } from '@/app/ForbiddenPage'
import type { Permission } from './permissions'
import { useCan } from './useCan'

/** Route con chỉ mở khi người đăng nhập có `permission`; thiếu quyền thì màn 403 có lối về màn chính (D-41). */
export function RequirePermission({ permission }: { permission: Permission }) {
  const can = useCan()
  return can(permission) ? <Outlet /> : <ForbiddenPage />
}
