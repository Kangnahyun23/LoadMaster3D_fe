import { useWatch, type UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { useT } from '@/lib/i18n'
import { METHODS, type OptimizationSettings } from './optimization-request'

/** Trường thiết lập (Spec 9.4). Phương pháp ngoài `MOCK` hiện nhưng khoá kèm lý do — MVP chỉ có mock. */
export function SetupSettingsFields({ form }: { form: UseFormReturn<OptimizationSettings> }) {
  const t = useT()
  const { control, register, setValue, formState: { errors } } = form
  const method = useWatch({ control, name: 'method' })
  const enforceLifo = useWatch({ control, name: 'enforceLifo' })
  const lowCenter = useWatch({ control, name: 'prioritizeLowCenterOfGravity' })

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-caption font-medium text-text-3">{t('optimization.method')}</legend>
        {METHODS.map((code) => (
          <label key={code} className="flex items-center gap-2 text-body has-disabled:text-text-disabled">
            <input
              type="radio"
              name="method"
              value={code}
              checked={method === code}
              disabled={code !== 'MOCK'}
              onChange={() => setValue('method', code, { shouldDirty: true })}
              className="size-4 accent-(--primary)"
            />
            {t(`optimization.methods.${code}`)}
          </label>
        ))}
        <p className="text-caption text-text-3">{t('optimization.methodUnavailable')}</p>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Input label={t('optimization.timeLimit')} numeric suffix="s" type="number" step="1"
          error={errors.timeLimitSeconds?.message} {...register('timeLimitSeconds', { valueAsNumber: true })} />
        <Input label={t('optimization.randomSeed')} numeric type="number" step="1"
          error={errors.randomSeed?.message} {...register('randomSeed', { valueAsNumber: true })} />
      </div>

      <Switch label={t('optimization.enforceLifo')} checked={enforceLifo}
        onCheckedChange={(checked) => setValue('enforceLifo', checked, { shouldDirty: true })} />
      <Switch label={t('optimization.lowCenterOfGravity')} checked={lowCenter}
        onCheckedChange={(checked) => setValue('prioritizeLowCenterOfGravity', checked, { shouldDirty: true })} />
    </div>
  )
}
