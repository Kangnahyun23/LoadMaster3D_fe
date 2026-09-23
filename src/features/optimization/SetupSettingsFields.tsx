import { useId, useState } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { useT } from '@/lib/i18n'
import { METHODS, type OptimizationSettings } from './optimization-request'

type Form = { form: UseFormReturn<OptimizationSettings> }

/** Phần "Yêu cầu xếp hàng" (Spec 9.4, V2): hai công tắc, mỗi công tắc một câu giải thích nối bằng `aria-describedby`. */
export function SetupRequirementFields({ form }: Form) {
  const t = useT()
  const lifoHint = useId()
  const lowCenterHint = useId()
  const { control, setValue } = form
  const enforceLifo = useWatch({ control, name: 'enforceLifo' })
  const lowCenter = useWatch({ control, name: 'prioritizeLowCenterOfGravity' })

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <Switch label={t('optimization.enforceLifo')} checked={enforceLifo} aria-describedby={lifoHint}
          onCheckedChange={(checked) => setValue('enforceLifo', checked, { shouldDirty: true })} />
        <p id={lifoHint} className="pl-12 text-caption text-ink-3">{t('optimization.lifoHint')}</p>
      </div>
      <div className="flex flex-col gap-1 pt-4">
        <Switch label={t('optimization.lowCenterOfGravity')} checked={lowCenter} aria-describedby={lowCenterHint}
          onCheckedChange={(checked) => setValue('prioritizeLowCenterOfGravity', checked, { shouldDirty: true })} />
        <p id={lowCenterHint} className="pl-12 text-caption text-ink-3">{t('optimization.lowCenterHint')}</p>
      </div>
    </div>
  )
}

/**
 * Phần "Thiết lập nâng cao" gập trong `<details>` (V2): phương pháp (ngoài `MOCK` hiện nhưng khoá kèm lý do — MVP chỉ có mock),
 * thời gian giới hạn và random seed. Có lỗi ở hai ô số thì phần này tự mở, để lỗi không nằm khuất khi nút Tối ưu bị tắt.
 */
export function SetupAdvancedFields({ form }: Form) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const { control, register, setValue, formState: { errors } } = form
  const method = useWatch({ control, name: 'method' })
  const hasError = errors.timeLimitSeconds !== undefined || errors.randomSeed !== undefined

  return (
    <details open={open || hasError} onToggle={(event) => setOpen(event.currentTarget.open)} className="group">
      <summary className="cursor-pointer rounded-sm text-body font-medium text-ink-1 marker:text-ink-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        {t('optimization.advancedTitle')}
        <span className="ml-2 text-caption font-normal text-ink-3">{t('optimization.advancedHint')}</span>
      </summary>
      <div className="flex flex-col gap-4 pt-4">
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-1 text-caption font-medium text-ink-2">{t('optimization.method')}</legend>
          {METHODS.map((code) => (
            <label key={code} className="flex items-center gap-2 text-body has-disabled:text-text-disabled">
              <input
                type="radio"
                name="method"
                value={code}
                checked={method === code}
                disabled={code !== 'MOCK'}
                onChange={() => setValue('method', code, { shouldDirty: true })}
                className="size-4 accent-primary"
              />
              {t(`optimization.methods.${code}`)}
            </label>
          ))}
          <p className="text-caption text-ink-3">{t('optimization.methodUnavailable')}</p>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <Input label={t('optimization.timeLimit')} numeric suffix="s" type="number" step="1"
            error={errors.timeLimitSeconds?.message} {...register('timeLimitSeconds', { valueAsNumber: true })} />
          <Input label={t('optimization.randomSeed')} numeric type="number" step="1"
            error={errors.randomSeed?.message} {...register('randomSeed', { valueAsNumber: true })} />
        </div>
      </div>
    </details>
  )
}
