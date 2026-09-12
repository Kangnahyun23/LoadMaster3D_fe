import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@/types/user'
import * as authApi from './auth-api'

/**
 * Phiên đăng nhập.
 *
 * Phiên được giữ trong `sessionStorage` để tải lại trang không bị đăng xuất
 * khi đang phát triển. Đây là chỗ tạm: backend thật sẽ đặt cookie HttpOnly,
 * lúc đó bỏ hẳn phần lưu trữ này. Không dùng `localStorage` và không lưu dữ
 * liệu nghiệp vụ ở client (CLAUDE.md mục 9).
 */

const SESSION_KEY = 'loadmaster.phien'

type AuthValue = {
  user: User | null
  signIn: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

function readStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    // Trình duyệt chặn storage hoặc dữ liệu hỏng — coi như chưa đăng nhập.
    return null
  }
}

function writeStoredUser(user: User | null) {
  try {
    if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Không lưu được thì phiên chỉ sống trong bộ nhớ; app vẫn chạy bình thường.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)

  const signIn = useCallback(async (email: string, password: string) => {
    const signedIn = await authApi.login(email, password)
    writeStoredUser(signedIn)
    setUser(signedIn)
    return signedIn
  }, [])

  const signOut = useCallback(async () => {
    await authApi.logout()
    writeStoredUser(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthValue>(() => ({ user, signIn, signOut }), [user, signIn, signOut])

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthValue {
  const value = use(AuthContext)
  if (!value) throw new Error('useAuth phải nằm trong <AuthProvider>')
  return value
}

/** Người dùng hiện tại, ném lỗi nếu gọi ở màn chưa qua RequireAuth. */
export function useCurrentUser(): User {
  const { user } = useAuth()
  if (!user) throw new Error('Màn hình này yêu cầu đăng nhập')
  return user
}
