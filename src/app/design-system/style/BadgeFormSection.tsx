import { useState } from 'react'
import { StatusBadge, TRIP_STATUS } from '@/components/StatusBadge'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { useFormat, useT } from '@/lib/i18n'
import { readToken } from '@/lib/tokens'
import type { TripStatus } from '@/types/trip'
import { SAMPLE_VEHICLE_TYPES } from '../design-system.mock'
import { SheetSection } from '../SheetLayout'

const TONE_TOKENS: Record<string, [`--${string}`, `--${string}`]> = {
  neutral: ['--badge-neutral-fg', '--badge-neutral-bg'],
  info: ['--badge-info-fg', '--badge-info-bg'],
  cyan: ['--badge-cyan-fg', '--badge-cyan-bg'],
  success: ['--badge-success-fg', '--badge-success-bg'],
  warning: ['--badge-warning-fg', '--badge-warning-bg'],
  danger: ['--badge-danger-fg', '--badge-danger-bg'],
}

export function BadgeSection() {
  const t = useT()
  return (
    <SheetSection
      id="badge"
      number="04"
      title={t('designSystem.style.badges.title')}
      description={t('designSystem.style.badges.description')}
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
        {(Object.keys(TRIP_STATUS) as TripStatus[]).map((status) => {
          const spec = TRIP_STATUS[status]
          const [fg, bg] = TONE_TOKENS[spec.tone] ?? TONE_TOKENS.neutral!
          return (
            <div key={status} className="flex flex-col gap-3 rounded-md border border-border p-4">
              <div><StatusBadge status={status} /></div>
              <div className="flex flex-col gap-0.5">
                <span className="text-caption text-text-2">{spec.tone}{spec.dot ? ` · ${t('designSystem.style.badges.ongoing')}` : ''}</span>
                <span className="font-mono text-caption text-text-3">{readToken(fg)} / {readToken(bg)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </SheetSection>
  )
}

export function FormSection() {
  const t = useT()
  const format = useFormat()
  const [vehicle, setVehicle] = useState(SAMPLE_VEHICLE_TYPES[0] ?? '')
  const [priority, setPriority] = useState('weight')

  return (
    <SheetSection
      id="form"
      number="05"
      title={t('designSystem.style.form.title')}
      description={t('designSystem.style.form.description')}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-8 gap-y-6">
        <Input label={t('designSystem.samples.customer')} placeholder={t('designSystem.samples.customerPlaceholder')} hint="Default" />
        <Input label={t('designSystem.samples.weight')} required numeric suffix="kg" defaultValue={format.integer(8240)} hint={t('designSystem.style.form.weightHint')} />
        <Input label={t('designSystem.samples.packageCode')} defaultValue="KIEN-00418" error={t('designSystem.samples.packageCodeTaken')} className="font-mono" />
        <Input label={t('designSystem.samples.plate')} defaultValue="51C-123.45" disabled hint="Disabled" className="font-mono" />

        <div className="flex flex-col gap-1.5">
          <span className="text-body font-medium">{t('designSystem.style.form.vehicleType')}</span>
          <Select value={vehicle} onValueChange={setVehicle}>
            <SelectTrigger aria-label={t('designSystem.style.form.vehicleType')}><SelectValue /></SelectTrigger>
            <SelectContent>
              {SAMPLE_VEHICLE_TYPES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-caption text-text-3">{t('designSystem.style.form.selectHint')}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-body font-medium">{t('designSystem.style.form.loadOptions')}</span>
          <div className="flex flex-col gap-3 pt-1">
            <Checkbox defaultChecked label={t('designSystem.samples.allowRotate')} />
            <Checkbox label={t('designSystem.samples.allowStackOnFragile')} />
            <Checkbox disabled label={t('designSystem.samples.coldUnavailable')} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-body font-medium">{t('designSystem.style.form.priority')}</span>
          <RadioGroup value={priority} onValueChange={setPriority} className="pt-1">
            <RadioGroupItem value="weight" label={t('designSystem.samples.byWeight')} />
            <RadioGroupItem value="stops" label={t('designSystem.samples.byStops')} />
            <RadioGroupItem value="volume" disabled label={t('designSystem.samples.byVolume')} />
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-body font-medium">{t('designSystem.style.form.display')}</span>
          <div className="flex flex-col gap-3 pt-1">
            <Switch defaultChecked label={t('designSystem.samples.showCenterOfMass')} />
            <Switch label={t('designSystem.samples.floorGrid')} />
            <Switch disabled label={t('designSystem.samples.darkModeDisabled')} />
          </div>
        </div>
      </div>
    </SheetSection>
  )
}
