import { zodResolver } from '@hookform/resolvers/zod'
import { Boxes, Gauge, Layers } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthError } from './auth-api'
import { DemoAccounts } from './DemoAccounts'
import { LoginArtwork } from './LoginArtwork'
import { useAuth } from './AuthProvider'

const schema = z.object({
  email: z.string().min(1, 'Nhập email').email('Email không đúng định dạng'),
  password: z.string().min(1, 'Nhập mật khẩu'),
})

type FormValues = z.infer<typeof schema>

/** Ba giá trị sản phẩm, hiện ở cột phải. */
const HIGHLIGHTS = [
  { icon: Gauge, text: 'Tăng tỷ lệ lấp đầy xe, giảm số chuyến phải chạy' },
  { icon: Layers, text: 'Xếp ngược thứ tự giao — tới điểm nào lấy hàng điểm đó' },
  { icon: Boxes, text: 'Kiểm soát tải trọng từng trục trước khi xe lăn bánh' },
]

/**
 * Đăng nhập. Đây là một trong số ít màn không có dữ liệu nghiệp vụ, nên được
 * phép dùng bố cục hai cột có hình minh hoạ — xem ngoại lệ ở CLAUDE.md mục 5.
 */
export function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  /** Quay lại đúng trang người dùng định vào trước khi bị chuyển tới đây. */
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (user) return <Navigate to={from} replace />

  async function onSubmit(values: FormValues) {
    setServerError(null)
    try {
      await signIn(values.email, values.password)
      void navigate(from, { replace: true })
    } catch (error) {
      setServerError(
        error instanceof AuthError
          ? error.message
          : 'Không kết nối được máy chủ. Thử lại sau.',
      )
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[2fr_3fr]">
      <main className="flex flex-col items-center justify-center px-8 py-12 sm:px-14">
        <div className="flex w-full max-w-115 flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-md bg-primary">
                <span className="h-3 w-4.5 rounded-xs border-2 border-t-4 border-white" />
              </span>
              <span className="text-h3 font-semibold tracking-[-0.01em]">LoadMaster</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-h1 font-semibold tracking-[-0.01em]">Đăng nhập</h1>
              <p className="text-body text-text-2">
                Hệ thống lập kế hoạch và tối ưu chất xếp hàng hoá 3D.
              </p>
            </div>
          </div>

          <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              placeholder="ten@loadmaster.vn"
              error={form.formState.errors.email?.message}
              {...form.register('email')}
            />
            <Input
              label="Mật khẩu"
              type="password"
              autoComplete="current-password"
              error={form.formState.errors.password?.message}
              {...form.register('password')}
            />

            {serverError ? (
              <p
                role="alert"
                className="rounded-md border border-badge-danger-border bg-badge-danger-bg px-3 py-2 text-body text-badge-danger-fg"
              >
                {serverError}
              </p>
            ) : null}

            <Button type="submit" variant="primary" block loading={form.formState.isSubmitting}>
              Đăng nhập
            </Button>
          </form>

          <DemoAccounts
            onPick={(email, password) => {
              form.setValue('email', email)
              form.setValue('password', password)
              setServerError(null)
            }}
          />
        </div>
      </main>

      {/* Cột minh hoạ: ẩn dưới 1024px để màn hẹp chỉ còn đúng form */}
      <aside className="relative hidden flex-col items-center justify-center overflow-hidden bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)] px-12 py-12 lg:flex">
        <div className="flex w-full max-w-180 flex-col gap-8">
          <LoginArtwork />

          <div className="flex flex-col gap-5">
            <p className="max-w-160 text-h1 leading-9 font-semibold text-pretty text-white">
              Mỗi chuyến xe chở được nhiều hơn, và dỡ hàng đúng thứ tự.
            </p>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-body-lg text-white/75">
                  <Icon className="mt-0.5 size-5 flex-none text-white/50" strokeWidth={1.5} aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  )
}
