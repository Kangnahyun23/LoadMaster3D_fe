import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './AuthProvider'

/**
 * Chặn route khi chưa đăng nhập và ghi nhớ trang định vào, để sau khi đăng nhập quay lại đúng chỗ.
 *
 * Chỉ ghi nhớ khi người **chưa đăng nhập** mở một trang (liên kết sâu, tab mới). Khi người đang đăng nhập bấm
 * Đăng xuất, trang họ đang đứng không phải lựa chọn của người đăng nhập kế tiếp: không ghi nhớ, để lần đăng nhập sau
 * mở màn của vai trò (`landingPath`). Chưa phân quyền theo vai trò — mọi tài khoản đã đăng nhập đều vào được tất cả màn.
 */
export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()
  // Layout này giữ nguyên khi đăng xuất (user đổi từ có sang null), nhưng mount mới khi mở trang lúc chưa đăng nhập.
  const [signedInOnMount] = useState(user !== null)

  if (!user) {
    return (
      <Navigate
        to="/dang-nhap"
        replace
        state={signedInOnMount ? null : { from: location.pathname + location.search }}
      />
    )
  }

  return <Outlet />
}
