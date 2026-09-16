import { OctagonAlert } from 'lucide-react'
import { useT } from '@/lib/i18n'
import type { FormIssue } from './vehicle-form-resolver'

/**
 * Tóm tắt lỗi ở đầu form xe (LM-041). Câu đã được resolver dịch sẵn: lỗi từng ô do schema form,
 * lỗi Spec nhiều trường do `validateVehicle` qua `formatIssue`. Bấm một dòng thì nhảy tới ô tương ứng.
 */
export function VehicleValidationSummary({
  issues,
  onFocus,
}: {
  issues: readonly FormIssue[]
  onFocus: (path: string) => void
}) {
  const t = useT()
  if (issues.length === 0) return null

  return (
    <section
      aria-labelledby="loi-cau-hinh-xe"
      className="flex flex-col gap-2 rounded-md border border-badge-danger-border bg-badge-danger-bg p-4"
    >
      <h2 id="loi-cau-hinh-xe" className="flex items-center gap-2 text-body font-semibold text-danger">
        <OctagonAlert className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
        {t('fleet.validation.title', { count: issues.length })}
      </h2>
      <ul className="flex flex-col gap-0.5">
        {issues.map((issue) => (
          <li key={`${issue.path}:${issue.message}`}>
            <button
              type="button"
              onClick={() => onFocus(issue.path)}
              className="w-full rounded-sm px-1 py-0.5 text-left text-body text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {issue.message}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-caption text-text-3">{t('fleet.validation.focusHint')}</p>
    </section>
  )
}
