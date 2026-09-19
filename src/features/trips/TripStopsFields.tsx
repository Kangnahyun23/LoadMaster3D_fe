import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useT } from '@/lib/i18n'
import type { TripFormValues } from './trip-form.schema'

/**
 * Điểm giao của form chuyến (LM-053, LM-088): tên, địa chỉ, số điện thoại, người liên hệ theo thứ tự giao. Tạo mới thì thêm/xoá
 * được; sửa chỉ đổi chữ của điểm giao hiện có — sắp xếp và xoá ở Chi tiết chuyến để kiện được đánh số lại cùng lúc.
 */
export function TripStopsFields({ form, creating }: { form: UseFormReturn<TripFormValues>; creating: boolean }) {
  const t = useT()
  const stops = useFieldArray({ control: form.control, name: 'stops' })
  const errors = form.formState.errors.stops
  const listError = errors?.root?.message ?? errors?.message

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3 font-semibold">{t('trips.create.stopsTitle')}</h2>
        <p className="text-caption text-text-3">{creating ? t('trips.create.stopsHint') : t('trips.create.editStopsHint')}</p>
      </div>
      <ol className="m-0 flex list-none flex-col gap-4 p-0">
        {stops.fields.map((field, index) => {
          const number = index + 1
          const own = errors?.[index]
          return (
            <li
              key={field.id}
              className={`grid ${creating ? 'grid-cols-[1fr_1fr_auto]' : 'grid-cols-2'} items-start gap-x-2 gap-y-3 border-b border-border pb-4 last:border-b-0 last:pb-0`}
            >
              <Input label={t('trips.create.stopName', { number })} error={own?.name?.message} {...form.register(`stops.${index}.name`)} />
              <Input label={t('trips.create.stopAddress', { number })} error={own?.address?.message} {...form.register(`stops.${index}.address`)} />
              {creating ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-6.5 size-10 px-0"
                  aria-label={t('trips.create.removeStop', { number })}
                  disabled={stops.fields.length === 1}
                  onClick={() => stops.remove(index)}
                >
                  <Trash2 strokeWidth={1.5} />
                </Button>
              ) : null}
              <Input
                type="tel"
                autoComplete="off"
                label={t('trips.create.stopPhone', { number })}
                error={own?.phone?.message}
                {...form.register(`stops.${index}.phone`)}
              />
              <Input label={t('trips.create.stopContact', { number })} error={own?.contactName?.message} {...form.register(`stops.${index}.contactName`)} />
            </li>
          )
        })}
      </ol>
      {listError ? <p role="alert" className="text-caption text-danger">{listError}</p> : null}
      {creating ? (
        <Button
          type="button"
          variant="secondary"
          className="self-start"
          onClick={() => stops.append({ name: '', address: '', phone: '', contactName: '' })}
        >
          <Plus strokeWidth={1.5} />
          {t('trips.create.addStop')}
        </Button>
      ) : null}
    </Card>
  )
}
