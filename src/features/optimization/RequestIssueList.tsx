import { AlertCircle, CheckCircle2, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'
import { formatIssue, useFormat, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { IssueGroup, RequestIssueSummary } from './optimization-request'

const GROUPS: readonly IssueGroup[] = ['vehicle', 'packages', 'payload']

/** Validation summary theo nhóm Xe / Kiện / Tải trọng (LM-047); mỗi mục là liên kết tới nơi sửa. */
export function RequestIssueList({ summary }: { summary: RequestIssueSummary }) {
  const t = useT()
  const format = useFormat()
  const total = GROUPS.reduce((sum, group) => sum + summary.groups[group].length, 0)

  return (
    <section aria-labelledby="request-issues" className="flex flex-col gap-3 rounded-lg border border-border bg-bg p-4">
      <h2 id="request-issues" className="text-h3 font-semibold">{t('optimization.summaryTitle')}</h2>
      {total === 0 ? (
        <p className="flex items-center gap-2 text-body text-badge-success-fg">
          <CheckCircle2 className="size-4" strokeWidth={1.5} aria-hidden />{t('optimization.summaryClear')}
        </p>
      ) : null}
      {GROUPS.filter((group) => summary.groups[group].length > 0).map((group) => (
        <div key={group} className="flex flex-col gap-1.5">
          <h3 className="text-caption font-medium text-text-3">{t(`optimization.groups.${group}`)}</h3>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {summary.groups[group].map(({ issue, to }, index) => {
              const error = issue.severity === 'error'
              const Icon = error ? AlertCircle : TriangleAlert
              return (
                <li key={`${issue.code}-${index}`}>
                  <Link to={to} className={cn('flex items-start gap-2 rounded-sm text-body hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary',
                    error ? 'text-badge-danger-fg' : 'text-badge-warning-fg')}>
                    <Icon className="mt-0.5 size-4 flex-none" strokeWidth={1.5} aria-hidden />
                    {formatIssue(issue, t, format)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      {!summary.canRun ? <p role="alert" className="text-caption text-badge-danger-fg">{t('optimization.blocked')}</p> : null}
    </section>
  )
}
