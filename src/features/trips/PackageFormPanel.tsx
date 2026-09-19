import { zodResolver } from '@hookform/resolvers/zod'
import { Copy, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog'
import { checkDoorClearance } from '@/domain/constraints'
import { isUpright } from '@/domain/geometry'
import { cargoPackageSchema, type CargoPackage, type VehicleConfig } from '@/domain/models'
import { formatIssue, useFormat, useT } from '@/lib/i18n'
import { PackageFormFields } from './PackageFormFields'
import type { StopRow } from './trip-summary'

/**
 * Panel sửa một kiện (LM-045). Desktop: cột phải; tablet/điện thoại: tấm dưới, nút 56px.
 * Tự đồng bộ theo D-25 — `keepUpright` bỏ các hướng nằm nghiêng và khoá ô, `stackable` tắt đưa tải trên về 0 —
 * còn `cargoPackageSchema` là nơi từ chối dữ liệu xung đột. Lỗi cửa (`DOOR_TOO_SMALL`) hiện ngay theo xe của chuyến.
 */
export function PackageFormPanel({ value, vehicle, stops, onSave, onDelete, onDuplicate, onClose, readOnly = false }: {
  value: CargoPackage
  vehicle: VehicleConfig
  stops: readonly StopRow[]
  onSave: (pkg: CargoPackage, keepOpen: boolean) => void
  onDelete?: (pkg: CargoPackage) => void
  onDuplicate?: (pkg: CargoPackage) => void
  onClose: () => void
  /** Xem không sửa: người không có quyền sửa chuyến, hoặc chuyến đã khoá (D-41, D-45). */
  readOnly?: boolean
}) {
  const t = useT()
  const format = useFormat()
  const [removedOrientations, setRemovedOrientations] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const form = useForm<CargoPackage>({ resolver: zodResolver(cargoPackageSchema), values: value, mode: 'onChange' })
  const { control, setValue, handleSubmit } = form

  const draft = useWatch({ control })

  /** D-25: bật giữ thẳng đứng bỏ ngay các hướng nằm nghiêng đang chọn và cho biết đã bỏ mấy hướng. */
  function handleKeepUpright(checked: boolean) {
    setValue('keepUpright', checked, { shouldValidate: true, shouldDirty: true })
    if (!checked) { setRemovedOrientations(0); return }
    const current = form.getValues('allowedOrientations')
    const upright = current.filter(isUpright)
    setValue('allowedOrientations', upright, { shouldValidate: true, shouldDirty: true })
    setRemovedOrientations(current.length - upright.length)
  }

  /** D-25: kiện không cho xếp chồng thì tải trên bằng 0 — schema từ chối số khác 0. */
  function handleStackable(checked: boolean) {
    setValue('stackable', checked, { shouldValidate: true, shouldDirty: true })
    if (!checked) setValue('maxTopLoadKg', 0, { shouldValidate: true, shouldDirty: true })
  }

  const parsed = cargoPackageSchema.safeParse(draft)
  const doorIssues = parsed.success ? checkDoorClearance(parsed.data, vehicle) : []
  const isNew = value.name === '' && value.lengthCm === 0

  return (
    <aside
      aria-label={isNew ? t('trips.form.titleNew') : t('trips.form.title', { id: value.id })}
      className="flex w-full flex-col overflow-hidden border-border bg-bg max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-20 max-md:max-h-[70dvh] max-md:rounded-t-lg max-md:border-t max-md:shadow-e3 md:w-90 md:border-l"
    >
      <div className="flex h-14 flex-none items-center justify-between gap-2 border-b border-border pr-2 pl-4">
        <h2 className="font-mono text-body-lg font-semibold">
          {isNew ? t('trips.form.titleNew') : t('trips.form.title', { id: value.id })}
        </h2>
        <button
          type="button"
          aria-label={t('trips.form.close')}
          onClick={onClose}
          className="grid size-14 place-items-center rounded-md text-text-3 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:size-11"
        >
          <X className="size-4" strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      <form
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
        onSubmit={handleSubmit((values) => onSave(values, false))}
        id="package-form"
      >
        {removedOrientations > 0 ? (
          <p role="status" className="rounded-md bg-badge-warning-bg px-3 py-2 text-caption text-badge-warning-fg">
            {t('trips.form.keepUprightApplied', { count: removedOrientations })}
          </p>
        ) : null}

        {doorIssues.map((issue) => (
          <p key={issue.code} role="alert" className="rounded-md bg-badge-danger-bg px-3 py-2 text-caption text-badge-danger-fg">
            {formatIssue(issue, t, format)}
          </p>
        ))}

        <fieldset disabled={readOnly} className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
          <PackageFormFields form={form} stops={stops} onKeepUprightChange={handleKeepUpright} onStackableChange={handleStackable} />
        </fieldset>
      </form>

      {readOnly ? null : <div className="flex flex-none flex-wrap gap-2 border-t border-border p-4">
        <Button type="submit" form="package-form" variant="primary" className="h-14 flex-1 md:h-10">{t('trips.form.save')}</Button>
        <Button type="button" variant="secondary" className="h-14 md:h-10" onClick={handleSubmit((values) => onSave(values, true))}>
          {t('trips.form.saveAndNew')}
        </Button>
        {onDuplicate ? (
          <Button type="button" variant="ghost" className="h-14 md:h-10" onClick={() => onDuplicate(value)}>
            <Copy strokeWidth={1.5} />{t('trips.form.duplicate')}
          </Button>
        ) : null}
        {onDelete ? (
          <Button type="button" variant="ghost" className="h-14 md:h-10" onClick={() => setConfirmDelete(true)}>
            <Trash2 strokeWidth={1.5} />{t('trips.form.delete')}
          </Button>
        ) : null}
      </div>}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogTitle>{t('trips.form.deleteTitle', { id: value.id })}</DialogTitle>
          <DialogDescription>{t('trips.form.deleteDescription')}</DialogDescription>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>{t('trips.form.cancel')}</Button>
            <Button variant="danger" onClick={() => { setConfirmDelete(false); onDelete?.(value); toast.success(t('trips.form.deleted', { id: value.id })) }}>
              {t('trips.form.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
