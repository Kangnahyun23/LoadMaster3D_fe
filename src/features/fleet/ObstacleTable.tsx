import { Plus, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Controller,
  useFieldArray,
  useFormState,
  useWatch,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { newObstacle, OBSTACLE_TYPES, type VehicleFormValues } from './vehicle-form'
import { CM_STEP, KG_STEP, NUMERIC_FIELD_PROPS } from './VehicleSpecFields'

/**
 * Hai tầng của một vật cản, mỗi cột một trục: tầng trên là góc (X, Y, Z), tầng dưới là kích thước (Dài, Rộng, Cao) — cùng
 * cột thì cùng trục. Kèm key nhãn trong từ điển.
 */
const POSITION_COLUMNS = [
  ['xCm', 'x'],
  ['yCm', 'y'],
  ['zCm', 'z'],
] as const
const SIZE_COLUMNS = [
  ['lengthCm', 'length'],
  ['widthCm', 'width'],
  ['heightCm', 'height'],
] as const

const CELL_INPUT = 'w-14'
const CELL = 'px-2 py-1.5'

type CmField = (typeof POSITION_COLUMNS)[number][0] | (typeof SIZE_COLUMNS)[number][0]
type CmLabel = (typeof POSITION_COLUMNS)[number][1] | (typeof SIZE_COLUMNS)[number][1]

/**
 * Bảng vật cản trong thùng (Spec 9.2, LM-041): mỗi xe chỉ vài dòng nên nhập thẳng trong bảng, không phân trang.
 * Mỗi vật cản là hai tầng (LM-095): tầng trên loại + góc X/Y/Z, tầng dưới chịu tải + kích thước — vừa cột trái của form xe ở
 * 1.366 px mà không cuộn ngang. Lỗi của một ô hiện ngay tại ô; lỗi gắn cả vật cản (ra ngoài thùng, chồng vật cản khác) liệt kê
 * dưới bảng để không phá lưới cột.
 */
export function ObstacleTable({
  control,
  register,
  setValue,
  highlightedId,
  onHighlight,
}: {
  control: Control<VehicleFormValues>
  register: UseFormRegister<VehicleFormValues>
  setValue: UseFormSetValue<VehicleFormValues>
  /** Vật cản đang làm nổi trong xem trước 3D (LM-042). */
  highlightedId: string | null
  onHighlight: (id: string) => void
}) {
  const t = useT()
  const { fields, append, remove } = useFieldArray({ control, name: 'obstacles', keyName: 'rowKey' })
  const { errors } = useFormState({ control })
  const rows = useWatch({ control, name: 'obstacles' }) ?? []
  const rowMessages = fields
    .map((_row, index) => ({ index, message: errors.obstacles?.[index]?.message }))
    .filter((row): row is { index: number; message: string } => typeof row.message === 'string' && row.message !== '')

  function cmCell(index: number, id: string, [column, heading]: readonly [CmField, CmLabel]) {
    return (
      <td key={column} className={CELL}>
        <Input
          aria-label={`${t(`fleet.obstacles.${heading}`)} ${id}`}
          suffix="cm"
          step={CM_STEP}
          className={CELL_INPUT}
          error={errors.obstacles?.[index]?.[column]?.message}
          {...NUMERIC_FIELD_PROPS}
          {...register(`obstacles.${index}.${column}`, { valueAsNumber: true })}
        />
      </td>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 ? (
        <p className="text-body text-text-3">{t('fleet.obstacles.empty')}</p>
      ) : (
        // `relative`: ô ẩn của Select/Switch Radix định vị tuyệt đối — không để chúng kéo giãn trang theo chiều ngang
        <div className="relative overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th rowSpan={2}>{t('fleet.obstacles.code')}</Th>
                <Th>{t('fleet.obstacles.type')}</Th>
                {POSITION_COLUMNS.map(([column, heading]) => <Th key={column}>{t(`fleet.obstacles.${heading}`)}</Th>)}
                <Th rowSpan={2}>
                  <span className="sr-only">{t('fleet.obstacles.add')}</span>
                </Th>
              </tr>
              <tr>
                <Th>{t('fleet.obstacles.loadBearing')} · {t('fleet.obstacles.maxTopLoad')}</Th>
                {SIZE_COLUMNS.map(([column, heading]) => <Th key={column}>{t(`fleet.obstacles.${heading}`)}</Th>)}
              </tr>
            </thead>
            {fields.map((field, index) => {
              const rowError = errors.obstacles?.[index]
              return (
                <tbody
                  key={field.rowKey}
                  // Bấm hoặc đưa focus vào vật cản làm nổi nó trong xem trước 3D, dùng được cả bằng bàn phím
                  onClick={() => onHighlight(field.id)}
                  onFocusCapture={() => onHighlight(field.id)}
                  aria-current={field.id === highlightedId ? 'true' : undefined}
                  className={cn('border-t border-border align-top', field.id === highlightedId && 'bg-primary-bg')}
                >
                  <tr>
                    <td rowSpan={2} className="px-2 py-3.5 font-mono text-caption text-text-2">{field.id}</td>
                    <td className={CELL}>
                      <Controller
                        control={control}
                        name={`obstacles.${index}.type`}
                        render={({ field: select }) => (
                          <Select value={select.value} onValueChange={select.onChange}>
                            <SelectTrigger
                              ref={select.ref}
                              onBlur={select.onBlur}
                              aria-label={`${t('fleet.obstacles.type')} ${field.id}`}
                              className="w-44"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OBSTACLE_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {t(`viewer.obstacles.types.${type}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </td>
                    {POSITION_COLUMNS.map((column) => cmCell(index, field.id, column))}
                    <td rowSpan={2} className={CELL}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t('fleet.obstacles.remove', { row: index + 1 })}
                        onClick={() => remove(index)}
                      >
                        <Trash2 strokeWidth={1.5} />
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td className={CELL}>
                      <div className="flex items-start gap-2">
                        <Controller
                          control={control}
                          name={`obstacles.${index}.loadBearing`}
                          render={({ field: toggle }) => (
                            <Switch
                              className="mt-2.5"
                              checked={toggle.value}
                              // Tắt chịu tải thì xoá luôn tải trên: ô bị vô hiệu hoá, để lại số cũ là lỗi không sửa được
                              onCheckedChange={(checked) => {
                                toggle.onChange(checked)
                                if (!checked) setValue(`obstacles.${index}.maxTopLoadKg`, null)
                              }}
                              aria-label={`${t('fleet.obstacles.loadBearing')} ${field.id}`}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name={`obstacles.${index}.maxTopLoadKg`}
                          render={({ field: load }) => (
                            <Input
                              aria-label={`${t('fleet.obstacles.maxTopLoad')} ${field.id}`}
                              suffix="kg"
                              step={KG_STEP}
                              className="w-16"
                              // Tải trên chỉ có nghĩa với vật cản chịu tải (Spec 7.6)
                              disabled={!(rows[index]?.loadBearing ?? false)}
                              error={rowError?.maxTopLoadKg?.message}
                              {...NUMERIC_FIELD_PROPS}
                              ref={load.ref}
                              name={load.name}
                              value={load.value ?? ''}
                              onBlur={load.onBlur}
                              onChange={(event) =>
                                load.onChange(event.target.value === '' ? null : Number(event.target.value))
                              }
                            />
                          )}
                        />
                      </div>
                    </td>
                    {SIZE_COLUMNS.map((column) => cmCell(index, field.id, column))}
                  </tr>
                </tbody>
              )
            })}
          </table>

          {rowMessages.length > 0 ? (
            <ul aria-label={t('fleet.obstacles.rowErrors')} className="mt-2 flex flex-col gap-1">
              {rowMessages.map(({ index, message }) => (
                <li key={index} className="text-caption text-danger">
                  {message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      <p className="text-caption text-text-3">{t('fleet.obstacles.cornerHint')}</p>

      <div>
        <Button type="button" variant="secondary" onClick={() => append(newObstacle(rows))}>
          <Plus strokeWidth={1.5} />
          {t('fleet.obstacles.add')}
        </Button>
      </div>
    </div>
  )
}

function Th({ children, rowSpan }: { children: ReactNode; rowSpan?: number }) {
  return <th rowSpan={rowSpan} className="px-2 pb-1.5 text-left align-bottom text-caption font-medium text-text-3">{children}</th>
}
