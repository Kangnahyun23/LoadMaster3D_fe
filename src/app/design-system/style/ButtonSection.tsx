import { Check, Minus, Plus, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useT } from '@/lib/i18n'
import { Sample, SheetSection } from '../SheetLayout'

export function ButtonSection() {
  const t = useT()
  const variants = [
    { variant: 'primary', name: 'Primary', note: t('designSystem.style.buttons.primaryNote'), label: t('designSystem.samples.runOptimization'), loading: t('designSystem.samples.running') },
    { variant: 'secondary', name: 'Secondary', note: t('designSystem.style.buttons.secondaryNote'), label: t('designSystem.samples.saveDraft'), loading: t('designSystem.style.buttons.saving') },
    { variant: 'ghost', name: 'Ghost', note: t('designSystem.style.buttons.ghostNote'), label: t('designSystem.samples.viewDetails'), loading: t('designSystem.style.buttons.loading') },
    { variant: 'danger', name: 'Danger', note: '--danger', label: t('designSystem.samples.cancelTrip'), loading: t('designSystem.style.buttons.cancelling') },
  ] as const

  return (
    <SheetSection
      id="nut"
      number="03"
      title={t('designSystem.style.buttons.title')}
      description={t('designSystem.style.buttons.description')}
    >
      <div className="overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-[140px_repeat(4,minmax(max-content,1fr))] gap-4 border-b border-border bg-surface px-5 py-2.5 text-caption font-medium text-text-3">
          <span>{t('designSystem.style.buttons.kind')}</span>
          <span>Default</span>
          <span>Hover</span>
          <span>Disabled</span>
          <span>Loading</span>
        </div>
        {variants.map((item) => (
          <div key={item.variant} className="grid grid-cols-[140px_repeat(4,minmax(max-content,1fr))] items-center gap-4 border-b border-border p-5 last:border-b-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-body font-medium">{item.name}</span>
              <span className="font-mono text-caption text-text-3">{item.note}</span>
            </div>
            <div><Button variant={item.variant}>{item.label}</Button></div>
            <div><Button variant={item.variant} className={HOVER_CLASS[item.variant]}>{item.label}</Button></div>
            <div><Button variant={item.variant} disabled>{item.label}</Button></div>
            <div><Button variant={item.variant} loading>{item.loading}</Button></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-5">
        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
          <span className="text-caption font-medium text-text-3">{t('designSystem.style.buttons.phone')}</span>
          <Button variant="primary" size="touch" block><Check strokeWidth={1.5} />{t('designSystem.style.buttons.confirmLoaded')}</Button>
          <Button variant="secondary" size="touch" block>{t('designSystem.style.buttons.scanNext')}</Button>
          <Button variant="ghost" size="touch" block>{t('designSystem.style.buttons.skipPackage')}</Button>
          <Button variant="danger" size="touch" block>{t('designSystem.style.buttons.reportDamaged')}</Button>
        </div>
        <div className="flex flex-col gap-4 rounded-md border border-border p-5">
          <span className="text-caption font-medium text-text-3">{t('designSystem.style.buttons.tablet')}</span>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="touch">{t('designSystem.style.buttons.startLoading')}</Button>
            <Button variant="secondary" size="touch">{t('designSystem.style.buttons.view3d')}</Button>
            <Button variant="secondary" size="touch" disabled>{t('designSystem.style.buttons.pause')}</Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="iconTouch" aria-label={t('designSystem.style.buttons.zoomIn')}><Plus strokeWidth={1.5} /></Button>
            <Button variant="secondary" size="iconTouch" aria-label={t('designSystem.style.buttons.zoomOut')}><Minus strokeWidth={1.5} /></Button>
            <Button variant="ghost" size="iconTouch" aria-label={t('designSystem.samples.rotate')} className="bg-primary-bg text-primary"><RotateCw strokeWidth={1.5} /></Button>
            <span className="text-caption text-text-3">{t('designSystem.style.buttons.iconNote')}</span>
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-0.5 border-t border-border pt-3 text-caption text-text-2">
            <span className="text-text-3">{t('designSystem.style.buttons.desktop')}</span><span className="font-mono">{t('designSystem.style.buttons.desktopSizes')}</span>
            <span className="text-text-3">{t('designSystem.style.buttons.touch')}</span><span className="font-mono">{t('designSystem.style.buttons.touchSizes')}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <Sample label="icon · 36px desktop"><Button variant="secondary" size="icon" aria-label={t('designSystem.samples.add')}><Plus strokeWidth={1.5} /></Button></Sample>
        <Sample label="icon ghost"><Button variant="ghost" size="icon" aria-label={t('designSystem.samples.rotate')}><RotateCw strokeWidth={1.5} /></Button></Sample>
        <Sample label="primary + icon"><Button variant="primary"><Plus strokeWidth={1.5} />{t('designSystem.style.buttons.addOrder')}</Button></Sample>
      </div>
    </SheetSection>
  )
}

/** Ép trạng thái hover để chụp tài liệu; nút thật tự đổi khi rê chuột. */
const HOVER_CLASS = {
  primary: 'bg-primary-hover',
  secondary: 'bg-surface',
  ghost: 'bg-surface',
  danger: 'bg-danger-hover',
} as const
