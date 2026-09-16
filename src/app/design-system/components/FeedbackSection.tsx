import { CloudOff, Package, Plus, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyTripsIllustration } from '@/features/trips/EmptyTripsIllustration'
import { ConfirmedOverlay } from '@/features/warehouse/ConfirmedOverlay'
import { useT } from '@/lib/i18n'
import { Sample, SheetRow, SheetSection } from '../SheetLayout'

export function FeedbackSection() {
  const t = useT()

  function handleToastWarning() {
    toast.warning(t('designSystem.components.feedback.axleWarning'), {
      description: t('designSystem.components.feedback.axleWarningDescription'),
      action: { label: t('designSystem.components.feedback.viewAxleLoad'), onClick: () => undefined },
    })
  }

  function handleToastError() {
    toast.error(t('designSystem.components.feedback.serverLost'), {
      description: t('designSystem.components.feedback.serverLostDescription'),
      action: { label: t('designSystem.components.feedback.retry'), onClick: () => undefined },
      cancel: { label: t('designSystem.components.feedback.viewPartial'), onClick: () => undefined },
    })
  }

  return (
    <SheetSection id="feedback" number="04" title={t('designSystem.components.nav.feedback')}>
      <SheetRow name="Toast · InlineNote · OfflinePill" note={t('designSystem.components.feedback.toastNote')} className="flex-col items-start gap-5">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => toast.success(t('designSystem.components.feedback.approved'), { description: t('designSystem.components.feedback.approvedDescription') })}>Toast success</Button>
          <Button variant="secondary" onClick={handleToastWarning}>Toast warning</Button>
          <Button variant="secondary" onClick={handleToastError}>Toast error</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <div role="note" className="flex items-center gap-3 rounded-md border border-badge-warning-border bg-badge-warning-bg px-4 py-3.5 text-badge-warning-fg"><TriangleAlert className="size-6" strokeWidth={2} /><span className="text-[18px] leading-6 font-semibold">{t('designSystem.components.feedback.fragile')}</span></div>
          <div role="note" className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3.5 text-text-2"><Package className="size-6" strokeWidth={2} /><span className="text-[18px] leading-6 font-semibold">{t('designSystem.components.feedback.light')}</span></div>
          <span className="inline-flex h-8 items-center gap-1.5 self-center rounded-full border border-badge-warning-border bg-badge-warning-bg px-2.5 text-body-lg font-medium text-badge-warning-fg"><CloudOff className="size-4" strokeWidth={2} />{t('designSystem.components.feedback.pendingSync')}</span>
        </div>
      </SheetRow>

      <SheetRow name="EmptyState · Skeleton · Spinner · ConfirmedOverlay" note={t('designSystem.components.feedback.emptyNote')} className="flex-col items-stretch gap-6">
        <div className="w-140">
          <EmptyState illustration={<EmptyTripsIllustration />} title={t('designSystem.components.feedback.emptyTitle')} description={t('designSystem.components.feedback.emptyDescription')} action={<Button variant="primary"><Plus strokeWidth={1.5} />{t('designSystem.components.feedback.createFirstTrip')}</Button>} />
        </div>
        <div className="flex flex-wrap items-end gap-8">
          <Sample label={t('designSystem.components.feedback.skeletonLight')}><div className="flex w-60 flex-col gap-2"><Skeleton className="h-3 w-40" /><Skeleton className="h-3 w-52" /><Skeleton className="h-[22px] w-21 rounded-full" /></div></Sample>
          <Sample label={t('designSystem.components.feedback.skeletonDark')}><div className="flex w-60 gap-1 rounded-md bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)] p-3"><Skeleton dark className="h-7 w-13 rounded-sm" /><Skeleton dark className="h-7 w-16 rounded-sm" /><Skeleton dark className="h-7 w-18 rounded-sm" /></div></Sample>
          <Sample label="spinner dark / light"><div className="flex items-center gap-4"><Spinner /><span className="rounded-md bg-primary p-2"><Spinner tone="light" /></span></div></Sample>
        </div>
        <Sample label={t('designSystem.components.feedback.overlayCaption')}>
          <div className="relative h-80 w-140 overflow-hidden rounded-md border border-border"><ConfirmedOverlay confirmedId="PKG-00147" nextStep={48} /></div>
        </Sample>
      </SheetRow>
    </SheetSection>
  )
}
