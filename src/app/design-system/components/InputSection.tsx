import { Calendar, Check, ChevronDown, Navigation, Phone, Plus, X } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Switch } from '@/components/ui/Switch'
import { ORIENTATION_CODES, orientDimensions, type OrientationCode } from '@/domain/geometry'
import { useFormat, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Sample, SheetRow, SheetSection } from '../SheetLayout'

export function InputSection() {
  const t = useT()
  const format = useFormat()
  const [orientation, setOrientation] = useState<OrientationCode>('LWH')
  const [slice, setSlice] = useState(435)

  return (
    <SheetSection id="input" number="02" title={t('designSystem.components.nav.input')}>
      <SheetRow name="Button" note={t('designSystem.components.input.buttonNote')}>
        <Button variant="primary"><Check strokeWidth={1.5} />{t('designSystem.samples.approvePlan')}</Button>
        <Button variant="secondary">{t('designSystem.samples.saveDraft')}</Button>
        <Button variant="ghost">{t('designSystem.samples.viewDetails')}</Button>
        <Button variant="danger">{t('designSystem.samples.cancelTrip')}</Button>
        <Button variant="primary" disabled>Disabled</Button>
        <Button variant="primary" loading>{t('designSystem.samples.running')}</Button>
      </SheetRow>

      <SheetRow name="IconButton · RoundAction" note={t('designSystem.components.input.iconNote')}>
        <Sample label="ghost 36"><Button variant="ghost" size="icon" aria-label={t('designSystem.samples.close')}><X strokeWidth={1.5} /></Button></Sample>
        <Sample label="secondary 36"><Button variant="secondary" size="icon" aria-label={t('designSystem.samples.add')}><Plus strokeWidth={1.5} /></Button></Sample>
        <Sample label="primary 44"><Button variant="primary" size="icon" className="size-11" aria-label={t('designSystem.samples.play')}><Check strokeWidth={2} /></Button></Sample>
        <Sample label="secondary 56"><Button variant="secondary" size="iconTouch" className="size-14 [&_svg]:size-6" aria-label={t('designSystem.samples.call')}><Phone strokeWidth={2} /></Button></Sample>
        <Sample label="secondary 56"><Button variant="secondary" size="iconTouch" className="size-14 [&_svg]:size-6" aria-label={t('designSystem.samples.directions')}><Navigation strokeWidth={2} /></Button></Sample>
        <Sample label={t('designSystem.components.input.roundWaiting')}><button type="button" className="grid size-14 place-items-center rounded-full border-2 border-success bg-bg text-body-lg font-semibold text-badge-success-fg">{t('designSystem.samples.unloaded')}</button></Sample>
        <Sample label={t('designSystem.components.input.roundDone')}><button type="button" className="grid size-14 place-items-center rounded-full bg-success text-white"><Check className="size-7" strokeWidth={3} /></button></Sample>
        <Sample label={t('designSystem.components.input.roundRejected')}><button type="button" disabled className="grid size-14 place-items-center rounded-full border-2 border-badge-danger-border bg-bg text-danger"><X className="size-6" strokeWidth={2.5} /></button></Sample>
      </SheetRow>

      <SheetRow name="Input · Select · FilterButton" note={t('designSystem.components.input.inputNote')}>
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <Input label={t('designSystem.samples.customer')} placeholder={t('designSystem.samples.customerPlaceholder')} />
          <Input label={t('designSystem.samples.weight')} required numeric suffix="kg" defaultValue={format.integer(8240)} />
          <Input label={t('designSystem.samples.packageCode')} defaultValue="KIEN-00418" error={t('designSystem.samples.packageCodeTaken')} className="font-mono" />
          <Input label={t('designSystem.samples.plate')} defaultValue="51C-123.45" disabled className="font-mono" />
        </div>
        <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-bg px-3 text-body font-medium hover:bg-surface">
          <Calendar className="size-4 text-text-3" strokeWidth={1.5} />{t('designSystem.components.input.last30Days')}<ChevronDown className="size-3.5 text-text-3" strokeWidth={1.5} />
        </button>
      </SheetRow>

      <SheetRow name="Checkbox · Radio · Switch · RangeSlider · OrientationPicker" note={t('designSystem.components.input.choiceNote')} className="flex-col items-stretch gap-6">
        <div className="flex flex-wrap gap-10">
          <div className="flex flex-col gap-3"><Checkbox defaultChecked label={t('designSystem.samples.allowRotate')} /><Checkbox label={t('designSystem.samples.stackOnFragile')} /><Checkbox disabled label={t('designSystem.samples.cold')} /></div>
          <RadioGroup defaultValue="weight"><RadioGroupItem value="weight" label={t('designSystem.samples.byWeight')} /><RadioGroupItem value="stops" label={t('designSystem.samples.byStops')} /><RadioGroupItem value="volume" disabled label={t('designSystem.samples.byVolume')} /></RadioGroup>
          <div className="flex flex-col gap-3"><Switch defaultChecked label={t('designSystem.samples.showCenterOfMass')} /><Switch label={t('designSystem.samples.floorGrid')} /><Switch disabled label={t('designSystem.samples.darkMode')} /></div>
        </div>
        <div className="flex w-70 flex-col gap-2">
          <div className="flex justify-between text-caption"><span className="font-medium text-text-3">{t('designSystem.components.input.sliceByLength')}</span><span className="font-mono font-medium">{format.length(slice)}</span></div>
          <input type="range" className="lm-range" min={0} max={720} step={5} value={slice} onChange={(e) => setSlice(Number(e.target.value))} aria-label={t('designSystem.components.input.slice')} style={{ '--lm-range-fill': `${(slice / 720) * 100}%` } as CSSProperties} />
        </div>
        <div role="group" aria-label={t('designSystem.components.input.orientation')} className="grid w-70 grid-cols-3 gap-1.5">
          {ORIENTATION_CODES.map((value) => { const { placedLengthCm: w, placedHeightCm: h } = orientDimensions({ lengthCm: 28, widthCm: 18, heightCm: 12 }, value); return (
            <button key={value} type="button" aria-pressed={orientation === value} onClick={() => setOrientation(value)}
              className={cn('flex flex-col items-center gap-1 rounded-md border px-1 py-2', orientation === value ? 'border-primary bg-primary-bg text-primary-hover' : 'border-border text-text-2 hover:bg-surface')}>
              <span aria-hidden className="block rounded-xs bg-current opacity-85" style={{ width: w, height: h }} />
              <span className="font-mono text-[11px] leading-3.5 font-medium">{value}</span>
            </button>
          ) })}
        </div>
      </SheetRow>
    </SheetSection>
  )
}
