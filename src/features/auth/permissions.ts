import type { Role } from '@/types/user'

/**
 * Quyền của FE giả lập (D-41): chặn route, ẩn mục nav và ẩn nút ghi. Backend thật phải kiểm lại ở server — đây chỉ là lớp giao diện.
 * Một hằng số dùng chung cho route, nav, nút và màn "Ma trận quyền" (LM-092).
 */
export const PERMISSIONS = [
  'dashboard.view',
  'reports.export',
  'trips.view',
  'trips.edit',
  'optimization.run',
  'plans.view',
  'plans.approve',
  'fleet.view',
  'fleet.edit',
  'warehouse.operate',
  'driver.operate',
  'users.manage',
  'audit.view',
] as const

export type Permission = (typeof PERMISSIONS)[number]

/** Quản trị toàn quyền; quản lý chỉ đọc + xuất báo cáo; kho và tài xế chỉ màn vận hành của mình. */
export const ROLE_PERMISSIONS: Readonly<Record<Role, readonly Permission[]>> = {
  admin: PERMISSIONS,
  dispatcher: ['dashboard.view', 'trips.view', 'trips.edit', 'optimization.run', 'plans.view', 'plans.approve', 'fleet.view', 'fleet.edit'],
  manager: ['dashboard.view', 'reports.export', 'trips.view', 'plans.view', 'fleet.view'],
  warehouse: ['warehouse.operate'],
  driver: ['driver.operate'],
}

export function can(role: Role | undefined, permission: Permission): boolean {
  return role !== undefined && ROLE_PERMISSIONS[role].includes(permission)
}
