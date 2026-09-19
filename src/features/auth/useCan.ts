import { useCallback } from 'react'
import { useAuth } from './AuthProvider'
import { can, type Permission } from './permissions'

/** `can(permission)` của người đang đăng nhập — màn dùng để ẩn nút ghi với vai trò chỉ đọc (D-41). */
export function useCan(): (permission: Permission) => boolean {
  const { user } = useAuth()
  const role = user?.role
  return useCallback((permission: Permission) => can(role, permission), [role])
}
