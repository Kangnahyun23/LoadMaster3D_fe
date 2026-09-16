import { useWatch, type UseFormReturn } from 'react-hook-form'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { ORIENTATION_CODES, isUpright } from '@/domain/geometry'
import type { CargoPackage } from '@/domain/models'
import { useT } from '@/lib/i18n'
import type { StopRow } from './trip-summary'

const FRAGILITY = ['NONE', 'LOW', 'MEDIUM', 'HIGH'] as const

/** Các trường của form kiện (LM-045); quy tắc tự đồng bộ D-25 nằm ở `PackageFormPanel`. Giá trị đọc bằng `useWatch`. */
export function PackageFormFields({ form, stops, onKeepUprightChange, onStackableChange }: {
  form: UseFormReturn<CargoPackage>
  stops: readonly StopRow[]
  /** D-25: bật giữ thẳng đứng bỏ các hướng nằm nghiêng; tắt xếp chồng đưa tải trên về 0 (panel xử lý). */
  onKeepUprightChange: (checked: boolean) => void
  onStackableChange: (checked: boolean) => void
}) {
  const t = useT()
  const { control, register, setValue, formState: { errors } } = form
  const allowed = useWatch({ control, name: 'allowedOrientations' })
  const keepUpright = useWatch({ control, name: 'keepUpright' })
  const stackable = useWatch({ control, name: 'stackable' })
  const mustLoad = useWatch({ control, name: 'mustLoad' })

  const numeric = (field: 'lengthCm' | 'widthCm' | 'heightCm' | 'weightKg' | 'quantity' | 'maxTopLoadKg' | 'maxStackCount' | 'minSupportRatio' | 'priority',
    label: string, suffix: string, step: string, disabled = false) => (
    <Input
      label={label}
      numeric
      suffix={suffix}
      type="number"
      step={step}
      error={errors[field]?.message}
      disabled={disabled}
      {...register(field, { valueAsNumber: true })}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <Input label={t('trips.form.name')} error={errors.name?.message} {...register('name')} />

      <div className="grid grid-cols-3 gap-3">
        {numeric('lengthCm', t('trips.form.length'), 'cm', '0.1')}
        {numeric('widthCm', t('trips.form.width'), 'cm', '0.1')}
        {numeric('heightCm', t('trips.form.height'), 'cm', '0.1')}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {numeric('weightKg', t('trips.form.weight'), 'kg', '0.01')}
        {numeric('quantity', t('trips.form.quantity'), '', '1')}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-caption font-medium text-text-3">{t('trips.form.orientations')}</legend>
        <div className="grid grid-cols-3 gap-2">
          {ORIENTATION_CODES.map((code) => (
            <Checkbox
              key={code}
              label={code}
              disabled={keepUpright && !isUpright(code)}
              checked={allowed.includes(code)}
              onCheckedChange={(checked) => setValue(
                'allowedOrientations',
                checked === true ? [...allowed, code] : allowed.filter((item) => item !== code),
                { shouldValidate: true, shouldDirty: true },
              )}
            />
          ))}
        </div>
        {errors.allowedOrientations ? <p className="text-caption text-badge-danger-fg">{errors.allowedOrientations.message}</p> : null}
      </fieldset>

      <Switch
        label={t('trips.form.keepUpright')}
        checked={keepUpright}
        onCheckedChange={onKeepUprightChange}
      />

      <SelectField
        control={control}
        name="fragilityLevel"
        label={t('trips.form.fragility')}
        options={FRAGILITY.map((level) => ({ value: level, label: t(`trips.form.fragilityLevels.${level}`) }))}
      />

      <Switch
        label={t('trips.form.stackable')}
        checked={stackable}
        onCheckedChange={onStackableChange}
      />

      <div className="grid grid-cols-2 gap-3">
        {numeric('maxTopLoadKg', t('trips.form.maxTopLoad'), 'kg', '0.01', !stackable)}
        {numeric('maxStackCount', t('trips.form.maxStackCount'), '', '1', !stackable)}
      </div>

      {numeric('minSupportRatio', t('trips.form.minSupportRatio'), '', '0.05')}

      <label className="flex flex-col gap-1.5 text-caption font-medium text-text-3">
        {t('trips.form.deliveryStop')}
        <select
          {...register('deliveryStop', { valueAsNumber: true })}
          className="h-10 rounded-md border border-border bg-bg px-2 text-body text-text focus-visible:outline-2 focus-visible:outline-primary"
        >
          {stops.map((stop) => <option key={stop.id} value={stop.number}>{stop.number} · {stop.name}</option>)}
        </select>
      </label>

      <div className="grid grid-cols-2 items-end gap-3">
        {numeric('priority', t('trips.form.priority'), '', '1')}
        <Switch
          label={t('trips.form.mustLoad')}
          checked={mustLoad}
          onCheckedChange={(checked) => setValue('mustLoad', checked, { shouldDirty: true })}
        />
      </div>

      <Textarea label={t('trips.form.notes')} rows={2} {...register('notes')} />
    </div>
  )
}
