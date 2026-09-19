import { useCurrentUser } from '@/features/auth/AuthProvider'
import { useT } from '@/lib/i18n'
import { PasswordForm } from './PasswordForm'
import { ProfileDetailsForm } from './ProfileDetailsForm'

/**
 * Hồ sơ cá nhân `/ho-so` (LM-096, D-42): mọi người đã đăng nhập, mở từ menu tài khoản của nav rail hoặc của màn kho/tài xế.
 * Họ tên và số điện thoại sửa được; email, vai trò, kho trực thuộc chỉ đọc. Đổi mật khẩu ở mục riêng. Nhân viên kho và tài xế mở
 * màn này trên máy cảm ứng nên ô nhập và nút cao 56px khi con trỏ là ngón tay.
 */
export function ProfilePage() {
  const t = useT()
  const user = useCurrentUser()
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center border-b border-border bg-bg px-6">
        <h1 className="text-h2 font-semibold">{t('profile.title')}</h1>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="flex max-w-160 flex-col gap-10 pointer-coarse:text-body-lg">
          {/* `key`: đổi tài khoản trong cùng tab thì form dựng lại với dữ liệu của người mới */}
          <ProfileDetailsForm key={user.id} user={user} />
          <PasswordForm key={`${user.id}-mat-khau`} />
        </div>
      </main>
    </div>
  )
}
