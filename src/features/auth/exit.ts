import type { Role } from '@/types/user'
import { ROLE_HOME } from './landing'

export type ExitAction = { readonly kind: 'signOut' } | { readonly kind: 'link'; readonly to: string }

/**
 * Nút thoát của màn toàn màn hình (kho, tài xế) — các màn này không có nav rail.
 *
 * - Màn là màn chính của vai trò (nhân viên kho ở `/kho`, tài xế ở `/tai-xe/diem-giao`): không còn màn nào khác để về,
 *   nên thoát là **đăng xuất**, không đẩy họ sang trang của điều phối viên.
 * - Điều phối viên và quản trị viên về trang chuyến đã mở màn này (`contextual`), không có thì về màn của mình.
 * - Vai trò khác về màn chính của vai trò.
 */
export function exitAction(role: Role, screenHome: string, contextual?: string): ExitAction {
  if (ROLE_HOME[role] === screenHome) return { kind: 'signOut' }
  if ((role === 'dispatcher' || role === 'admin') && contextual) return { kind: 'link', to: contextual }
  return { kind: 'link', to: ROLE_HOME[role] }
}
