import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { ArrowUp } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { StopLabel } from '@/components/StopLabel'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { DeliveryItemRow } from '@/features/driver/DeliveryItemRow'
import { KpiTile } from '@/components/KpiTile'
import { StopCard } from '@/features/trips/StopCard'
import { useFormat, useT } from '@/lib/i18n'
import { stopColor, stopForeground } from '@/lib/stops'
import { SAMPLE_DRIVER_ITEM, SAMPLE_STOP, SAMPLE_STOP_NAME } from '../design-system.mock'
import { SheetRow, SheetSection } from '../SheetLayout'
import { DataTableSample } from './DataTableSample'

export function DataSection() {
  const t = useT()
  const format = useFormat()
  const stop = SAMPLE_STOP

  return (
    <SheetSection id="data" number="03" title={t('designSystem.components.nav.data')}>
      <SheetRow name="Badge · StopTag · StopDot · DeltaPill" note={t('designSystem.components.data.badgesNote')}>
        <Badge tone="neutral">{t('designSystem.components.data.draft')}</Badge>
        <Badge tone="info" dot>{t('designSystem.components.data.optimizing')}</Badge>
        <Badge tone="cyan" dot>{t('designSystem.components.data.delivering')}</Badge>
        <Badge tone="success">{t('designSystem.components.data.completed')}</Badge>
        <Badge tone="warning">{t('designSystem.components.data.needsReview')}</Badge>
        <Badge tone="danger">{t('designSystem.components.data.cancelled')}</Badge>
        <span className="inline-flex h-[22px] items-center rounded-[4px] px-2 text-caption font-semibold leading-none" style={{ background: stopColor(2), color: stopForeground(2) }}><StopLabel number={2} /></span>
        <span className="inline-flex items-center gap-2 text-body"><span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: stopColor(3) }} /><StopLabel number={3} /> · {SAMPLE_STOP_NAME}</span>
        <span className="grid size-8 place-items-center rounded-full font-mono text-body font-semibold" style={{ background: stopColor(4), color: stopForeground(4) }}>4</span>
        <span className="inline-flex h-[22px] items-center gap-1 rounded-full border border-badge-success-border bg-badge-success-bg px-2 font-mono text-caption font-medium text-badge-success-fg"><ArrowUp className="size-3" strokeWidth={2.5} />+{format.percent(3.1)}</span>
      </SheetRow>

      <SheetRow name="Card · KPITile · StatTile · InfoTile" note={t('designSystem.components.data.cardsNote')} className="items-stretch">
        <div className="w-80"><KpiTile label={t('designSystem.components.data.totalPackages')} value={format.integer(132)} unit={t('designSystem.components.data.packagesUnit')} note={t('designSystem.components.data.totalPackagesNote')} /></div>
        <div className="flex flex-col gap-0.5"><span className="text-caption text-text-3">{t('designSystem.components.data.volume')}</span><span className="font-mono text-h2 font-semibold">{format.decimal(18.4)} <span className="font-sans text-caption font-normal text-text-3">m³</span></span></div>
        <div className="flex flex-col gap-0.5 rounded-md border border-border bg-surface px-2.5 py-2"><span className="text-[11px] leading-3.5 text-text-3">X</span><span className="font-mono text-body font-medium">{format.integer(4360)}</span></div>
      </SheetRow>

      <SheetRow name={t('designSystem.components.data.tripStatus')} note={t('designSystem.components.data.tripStatusNote')}>
        {(['nhap', 'dang_toi_uu', 'da_toi_uu', 'da_duyet', 'dang_xep_hang', 'da_xep_xong', 'dang_giao', 'hoan_thanh', 'can_xem_lai', 'da_huy'] as const).map((s) => <StatusBadge key={s} status={s} />)}
      </SheetRow>

      <SheetRow name="StopCard · PackageRow · UnplacedCard" note={t('designSystem.components.data.rowsNote')} className="flex-col items-stretch">
        <DndContext><SortableContext items={[stop.id]}><ul className="m-0 w-140 list-none p-0"><StopCard stop={stop} onRemove={() => undefined} /></ul></SortableContext></DndContext>
        <ul className="m-0 w-95 list-none overflow-hidden rounded-md border border-border p-0 text-body-lg">
          <DeliveryItemRow item={SAMPLE_DRIVER_ITEM} done={false} onToggle={() => undefined} />
          <DeliveryItemRow item={{ ...SAMPLE_DRIVER_ITEM, id: 'PKG-002-11', unloadingOrder: 4 }} done onToggle={() => undefined} />
        </ul>
        <div className="flex w-62 gap-3 rounded-md border border-dashed border-switch-off p-3">
          <span className="grid size-9 flex-none place-items-center rounded-sm font-mono text-caption font-semibold" style={{ background: stopColor(3), color: stopForeground(3) }}>3</span>
          <div className="flex flex-col gap-0.5"><span className="font-mono text-body font-medium">PKG-00233</span><span className="font-mono text-caption text-text-3">{format.dimensions(60, 40, 40)} · {format.weight(28)}</span><span className="text-caption text-badge-warning-fg">{t('designSystem.components.data.exceedsHeight')}</span></div>
        </div>
      </SheetRow>

      <SheetRow name="DataTable · FilterBar · useListUrlState" note={t('designSystem.components.data.table.note')} className="flex-col items-stretch">
        <DataTableSample />
      </SheetRow>

      <SheetRow name="UtilizationBar · ProgressBar · StepProgress · Sparkline" note={t('designSystem.components.data.barsNote')} className="flex-col items-stretch gap-6">
        <div className="flex w-80 flex-col gap-3"><ProgressBar label={t('designSystem.components.data.volumeUsed')} value={78} /><ProgressBar label={t('designSystem.components.data.rearAxle')} value={93} tone="warning" /><ProgressBar label={t('designSystem.components.data.overload')} value={100} tone="danger" /></div>
        <span className="font-mono text-caption text-text-3">{t('designSystem.components.data.barsCaption', { count: 132 })}</span>
      </SheetRow>
    </SheetSection>
  )
}
