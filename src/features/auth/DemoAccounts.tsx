import { ROLE_LABELS } from '@/types/user'
import { DEMO_HINTS, DEMO_PASSWORD } from './auth.mock'

/**
 * Bảng tài khoản dùng thử, chỉ có ý nghĩa khi chạy dữ liệu mẫu.
 * Xoá component này cùng lúc với việc nối backend xác thực thật.
 */
export function DemoAccounts({
  onPick,
}: {
  onPick: (email: string, password: string) => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed border-switch-off bg-surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-caption font-medium text-text-2">Tài khoản dùng thử</span>
        <span className="font-mono text-caption text-text-3">
          mật khẩu {DEMO_PASSWORD}
        </span>
      </div>

      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {DEMO_HINTS.map((hint) => (
          <li key={hint.email}>
            <button
              type="button"
              onClick={() => onPick(hint.email, DEMO_PASSWORD)}
              className="flex w-full items-baseline justify-between gap-3 rounded-sm px-2 py-1.5 text-left transition-colors duration-(--dur-fast) ease-standard hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="text-body font-medium text-text">
                {ROLE_LABELS[hint.role]}
              </span>
              <span className="truncate font-mono text-caption text-text-3">
                {hint.email}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
