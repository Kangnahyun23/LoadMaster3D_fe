import { AlertCircle, Check, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog'
import type { OptimizationResult } from '@/domain/models'
import { formatIssue, useFormat, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { PlanApproval } from './approval/plan-approval'

/** Dòng kiểm vận hành (thứ tự điểm giao, LIFO — LM-036): chỉ hỗ trợ xem xét, không phải lý do chặn. */
export type ApprovalCheck = {
  tone: 'success' | 'warning' | 'danger'
  text: string
}

/**
 * Xác nhận Duyệt (LM-050): số chính của phương án, lý do chặn (`approvalBlockers` của domain), số cảnh báo còn lại, có chỉnh
 * tay hay không và việc thứ tự xếp/dỡ sẽ được tính lại. Còn lý do chặn thì nút Duyệt khoá.
 */
export function ApprovePlanDialog({ open, onOpenChange, metrics, canSubmit, approval, checks, pending, onConfirm }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  metrics: OptimizationResult['metrics']
  /** Fixture benchmark không có revision trong kho: xem được kiểm tra nhưng không gửi Duyệt. */
  canSubmit: boolean
  approval: PlanApproval
  checks: readonly ApprovalCheck[]
  pending: boolean
  onConfirm: () => void
}) {
  const t = useT()
  const format = useFormat()
  const { blockers, warnings, patches } = approval
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-140">
        <div className="flex flex-col gap-4 px-6 pt-6">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-h2 font-semibold">{t('viewer.plan.dialog.title')}</DialogTitle>
            <DialogDescription className="text-body text-pretty text-text-2">{t('viewer.plan.dialog.description')}</DialogDescription>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Stat label={t('viewer.plan.volume')}><span className="text-primary">{format.percent(metrics.volumeUtilizationPercent)}</span></Stat>
            <Stat label={t('viewer.plan.payload')}>{format.percent(metrics.payloadUtilizationPercent)}</Stat>
            <Stat label={t('viewer.plan.placed')}>
              {format.integer(metrics.placedCount)} <span className="text-caption text-text-3">/ {format.integer(metrics.placedCount + metrics.unplacedCount)}</span>
            </Stat>
          </div>

          {blockers.stale || blockers.issues.length > 0 ? (
            <div role="alert" className="flex flex-col gap-2 rounded-md border border-badge-danger-border bg-badge-danger-bg p-3">
              <span className="text-caption font-medium text-badge-danger-fg">{t('viewer.plan.dialog.blockersTitle')}</span>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-body text-badge-danger-fg">
                {blockers.stale ? <Line icon={<AlertCircle className="size-3.5 flex-none" strokeWidth={2} aria-hidden />}>{t('viewer.plan.dialog.stale')}</Line> : null}
                {blockers.issues.map((issue, index) => (
                  <Line key={`${issue.code}-${index}`} icon={<AlertCircle className="size-3.5 flex-none" strokeWidth={2} aria-hidden />}>
                    {formatIssue(issue, t, format)}
                  </Line>
                ))}
              </ul>
            </div>
          ) : null}

          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-body text-text-2">
            <Line icon={warnings.length > 0
              ? <TriangleAlert className="size-3.5 flex-none text-warning" strokeWidth={2} aria-hidden />
              : <Check className="size-3.5 flex-none text-success" strokeWidth={2.5} aria-hidden />}>
              {warnings.length > 0 ? t('viewer.plan.dialog.warnings', { count: warnings.length }) : t('viewer.plan.dialog.noWarnings')}
            </Line>
            <Line icon={<Check className="size-3.5 flex-none text-text-3" strokeWidth={2.5} aria-hidden />}>
              {patches.length > 0 ? t('viewer.plan.dialog.manual', { count: patches.length }) : t('viewer.plan.dialog.noManual')}
            </Line>
            <Line icon={<Check className="size-3.5 flex-none text-text-3" strokeWidth={2.5} aria-hidden />}>{t('viewer.plan.dialog.ordersRecomputed')}</Line>
            {checks.map((check) => (
              <Line key={check.text} icon={check.tone === 'success'
                ? <Check className="size-3.5 flex-none text-success" strokeWidth={2.5} aria-hidden />
                : <TriangleAlert className={cn('size-3.5 flex-none', check.tone === 'danger' ? 'text-danger' : 'text-warning')} strokeWidth={2} aria-hidden />}>
                {check.text}
              </Line>
            ))}
          </ul>
        </div>

        <DialogFooter className="justify-end px-6">
          <DialogClose asChild><Button variant="secondary">{t('viewer.plan.dialog.cancel')}</Button></DialogClose>
          <Button variant="primary" disabled={!canSubmit || !blockers.canApprove || pending} loading={pending} onClick={onConfirm}>
            <Check strokeWidth={1.5} />{t('viewer.plan.dialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Line({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <li className="flex items-start gap-2">{icon}<span>{children}</span></li>
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border px-3 py-2">
      <span className="text-caption text-text-3">{label}</span>
      <span className="font-mono text-h3 font-semibold">{children}</span>
    </div>
  )
}
