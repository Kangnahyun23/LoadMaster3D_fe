import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useT } from '@/lib/i18n'
import { stopColor, stopForeground } from '@/lib/stops'
import type { TripFormValues } from './trip-form.schema'

/**
 * Điểm giao của form chuyến (LM-053, LM-088): tên, địa chỉ, số điện thoại, người liên hệ theo thứ tự giao. Tạo mới thì thêm, xoá và
 * đổi thứ tự bằng nút ↑/↓ (V2 — bàn phím dùng được ngay, không cần kéo thả); sửa chỉ đổi chữ của điểm giao hiện có — sắp xếp và xoá ở
 * Chi tiết chuyến để kiện được đánh số lại cùng lúc. Chip số mang màu định danh của điểm giao (AGENTS mục 4), luôn kèm số.
 * Nằm trong một `FormSection` của form nên không tự dựng thẻ hay tiêu đề.
 */
export function TripStopsFields({ form, creating }: { form: UseFormReturn<TripFormValues>; creating: boolean }) {
  const t = useT()
  const stops = useFieldArray({ control: form.control, name: 'stops' })
  const errors = form.formState.errors.stops
  const listError = errors?.root?.message ?? errors?.message
  const last = stops.fields.length - 1

  return (
    <div className="flex flex-col gap-4">
      <ol className="m-0 flex list-none flex-col gap-4 p-0">
        {stops.fields.map((field, index) => {
          const number = index + 1
          const own = errors?.[index]
          return (
            <li
              key={field.id}
              className={`grid ${creating ? 'grid-cols-[auto_1fr_1fr_auto]' : 'grid-cols-[auto_1fr_1fr]'} items-start gap-x-3 gap-y-3 border-b border-border pb-4 last:border-b-0 last:pb-0`}
            >
              <span
                aria-hidden
                className="row-span-2 mt-6.5 grid size-7 place-items-center rounded-md font-mono text-caption font-semibold"
                style={{ background: stopColor(number), color: stopForeground(number) }}
              >
                {number}
              </span>
              <Input label={t('trips.create.stopName', { number })} error={own?.name?.message} {...form.register(`stops.${index}.name`)} />
              <Input label={t('trips.create.stopAddress', { number })} error={own?.address?.message} {...form.register(`stops.${index}.address`)} />
              {creating ? (
                <div className="row-span-2 mt-6.5 flex flex-col gap-1">
                  <Button type="button" variant="ghost" size="icon" aria-label={t('trips.create.moveStopUp', { number })} disabled={index === 0} onClick={() => stops.move(index, index - 1)}>
                    <ArrowUp strokeWidth={1.5} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" aria-label={t('trips.create.moveStopDown', { number })} disabled={index === last} onClick={() => stops.move(index, index + 1)}>
                    <ArrowDown strokeWidth={1.5} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" aria-label={t('trips.create.removeStop', { number })} disabled={stops.fields.length === 1} onClick={() => stops.remove(index)}>
                    <Trash2 strokeWidth={1.5} />
                  </Button>
                </div>
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
    </div>
  )
}
