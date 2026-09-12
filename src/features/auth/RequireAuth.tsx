import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './AuthProvider'

/**
 * Chặn route khi chưa đăng nhập và ghi nhớ trang định vào, để sau khi đăng
 * nhập quay lại đúng chỗ. Chưa phân quyền theo vai trò — mọi tài khoản đã
 * đăng nhập đều vào được tất cả màn.
 */
export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return (
      <Navigate
        to="/dang-nhap"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return <Outlet />
}
