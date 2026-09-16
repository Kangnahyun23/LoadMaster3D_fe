import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { OptimizationErrorDialog } from '@/features/optimization/OptimizationErrorDialog'
import { OptimizationRunDialog } from '@/features/optimization/OptimizationRunDialog'
import { ApprovePlanDialog } from '@/features/viewer3d/ApprovePlanDialog'
import { useT } from '@/lib/i18n'
import { SheetRow, SheetSection } from '../SheetLayout'


export function OverlaySection() {
  const t = useT()
  const [open, setOpen] = useState<'running' | 'failed' | 'error' | 'approve' | null>(null)

  return (
    <SheetSection id="overlay" number="05" title={t('designSystem.components.nav.overlay')}>
      <SheetRow name="Modal · ConfirmDialog · ErrorDialog · ProgressModal" note={t('designSystem.components.overlay.modalNote')}>
        <Button variant="secondary" onClick={() => setOpen('running')}>{t('designSystem.components.overlay.running')}</Button>
        <Button variant="secondary" onClick={() => setOpen('failed')}>{t('designSystem.components.overlay.invalidInput')}</Button>
        <Button variant="secondary" onClick={() => setOpen('error')}>{t('designSystem.components.overlay.optimizationError')}</Button>
        <Button variant="secondary" onClick={() => setOpen('approve')}>{t('designSystem.components.overlay.confirmApproval')}</Button>
      </SheetRow>

      <SheetRow name="Tooltip · Dropdown" note={t('designSystem.components.overlay.tooltipNote')}>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="secondary">{t('designSystem.components.overlay.hoverHere')}</Button></TooltipTrigger>
          <TooltipContent side="right">{t('designSystem.components.overlay.tooltip')}</TooltipContent>
        </Tooltip>
      </SheetRow>

      {open === 'running' ? <OptimizationRunDialog progress={{ placed: 80, total: 132 }} onCancel={() => setOpen(null)} /> : null}
      {open === 'error' ? <OptimizationErrorDialog failure={{ kind: 'service', code: 'SERVICE_UNAVAILABLE' }} onRetry={() => setOpen(null)} onClose={() => setOpen(null)} /> : null}
      {open === 'failed' ? <OptimizationErrorDialog failure={{ kind: 'failed', messages: [t('designSystem.components.overlay.noOrientation')] }} onRetry={() => setOpen(null)} onClose={() => setOpen(null)} /> : null}
      <ApprovePlanDialog
        open={open === 'approve'}
        onOpenChange={(o) => setOpen(o ? 'approve' : null)}
        // Số của revision đã duyệt trong seed (chuyến TRIP-2026-0914): 132 kiện, 5.844 / 9.500 kg.
        metrics={{
          totalVehicleVolumeCm3: 40_608_000, usedVolumeCm3: 16_568_064, volumeUtilizationPercent: 40.8, maxPayloadKg: 9500,
          usedPayloadKg: 5844, payloadUtilizationPercent: 61.5, placedCount: 132, unplacedCount: 0, runtimeMs: 0,
        }}
        canSubmit
        approval={{ blockers: { canApprove: true, issues: [], stale: false }, warnings: [], patches: [] }}
        checks={[{ tone: 'success', text: t('designSystem.components.overlay.stopOrderOk') }]}
        pending={false}
        onConfirm={() => setOpen(null)}
      />
    </SheetSection>
  )
}
