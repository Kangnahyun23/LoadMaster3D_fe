import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Save } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useBlocker, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SelectField, type SelectOption } from '@/components/ui/SelectField'
import { ConfirmDialog } from '@/features/fleet/ConfirmDialog'
import type { Trip, TripPhase } from '@/lib/mock-db'
import { dataErrorMessage, useFormat, useT, type TFunction } from '@/lib/i18n'
import { compareText } from '@/lib/list-filter'
import { createTripFormSchema, driverIdOf, tripFormDefaults, UNASSIGNED, type TripFormValues } from './trip-form.schema'
import { TripStopsFields } from './TripStopsFields'
import { useCreateTripMutation, useTripDetailQuery, useTripFormOptionsQuery, useUpdateTripFrameMutation } from './useTripsQuery'
import type { TripFormOptions } from './trips-api'

/** Pha còn mở form sửa: lập kế hoạch sửa mọi thứ; kho đang/đã xếp chỉ còn tên, ngày chạy, tài xế (D-45). */
const EDITABLE_PHASES: readonly TripPhase[] = ['planning', 'loading', 'loaded']

/**
 * Tạo mới hoặc sửa khung chuyến (LM-053, LM-088): ghi thật vào kho qua mutation, không báo thành công giả.
 * Tên, ngày chạy, tài xế, xe và điểm giao; xe bảo dưỡng không chọn được (D-53). Kiện thêm ở Chi tiết chuyến.
 * Còn thay đổi chưa lưu mà rời sang trang khác thì hỏi lại trước (LM-100, như form xe).
 */
export function TripFormPage() {
  const { tripId = '' } = useParams()
  const t = useT()
  const detail = useTripDetailQuery(tripId)
  if (tripId === '') return <TripForm />
  const title = t('trips.create.editTitle', { id: tripId })
  if (detail.isPending) return <FormShell title={title} backTo={`/chuyen/${tripId}`} />
  if (!detail.data) {
    return (
      <FormShell title={title} backTo="/chuyen">
        <p role="alert" className="text-body text-danger">{t('trips.create.notFound', { id: tripId })}</p>
      </FormShell>
    )
  }
  const { trip } = detail.data
  if (!EDITABLE_PHASES.includes(trip.phase)) {
    return (
      <FormShell title={title} backTo={`/chuyen/${tripId}`}>
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-body text-text-2">{t('trips.create.notEditable', { id: tripId })}</p>
          <Button variant="secondary" asChild><Link to={`/chuyen/${tripId}`}>{t('trips.create.back')}</Link></Button>
        </div>
      </FormShell>
    )
  }
  return <TripForm key={trip.id} existing={trip} />
}

function FormShell({ title, backTo, children }: { title: string; backTo: string; children?: ReactNode }) {
  const t = useT()
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center gap-4 border-b border-border bg-bg px-6">
        <Link
          to={backTo}
          aria-label={t('trips.create.back')}
          className="grid size-9 place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
        </Link>
        <h1 className="text-h2 font-semibold">{title}</h1>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-6">{children}</div>
    </div>
  )
}

function TripForm({ existing }: { existing?: Trip }) {
  const t = useT()
  const format = useFormat()
  const navigate = useNavigate()
  const options = useTripFormOptionsQuery()
  const create = useCreateTripMutation()
  const update = useUpdateTripFrameMutation(existing?.id ?? '')
  const schema = useMemo(() => createTripFormSchema(t, { withStops: !existing }), [t, existing])
  const form = useForm<TripFormValues>({ resolver: zodResolver(schema), defaultValues: tripFormDefaults(existing) })
  const vehicleId = useWatch({ control: form.control, name: 'vehicleId' })
  const choices = useMemo(() => formChoices(options.data, existing, t), [options.data, existing, t])
  const selected = options.data?.vehicles.find((option) => option.vehicle.id === vehicleId)
  // Kho đã bắt đầu xếp: xe và điểm giao khoá, còn tên, ngày chạy, tài xế (D-45)
  const locked = existing !== undefined && existing.phase !== 'planning'
  const { errors, isDirty } = form.formState
  const backTo = existing ? `/chuyen/${existing.id}` : '/chuyen'
  const pending = create.isPending || update.isPending
  // Lưu xong: rời trang trong effect ở lần render sau, để hộp hỏi "rời trang?" không chặn chính mình (như form xe, LM-041)
  const [savedPath, setSavedPath] = useState<string | null>(null)
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    isDirty && savedPath === null && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    if (savedPath !== null) void navigate(savedPath)
  }, [savedPath, navigate])

  function handleSubmit(values: TripFormValues) {
    const onError = (error: unknown) => toast.error(t('trips.create.failed'), { description: dataErrorMessage(error, t) })
    const driverId = driverIdOf(values.driverId)
    const onSuccess = (trip: Trip, message: string) => {
      toast.success(message)
      setSavedPath(`/chuyen/${trip.id}`)
    }
    if (existing) {
      const frame = { name: values.name, scheduledDate: values.scheduledDate, driverId }
      update.mutate(locked ? frame : { ...frame, vehicleId: values.vehicleId, stops: values.stops }, {
        onSuccess: (trip) => onSuccess(trip, t('trips.create.saved', { id: trip.id })),
        onError,
      })
      return
    }
    create.mutate({ name: values.name, vehicleId: values.vehicleId, scheduledDate: values.scheduledDate, driverId, stops: values.stops }, {
      onSuccess: (trip) => onSuccess(trip, t('trips.create.created', { id: trip.id })),
      onError,
    })
  }

  return (
    <FormShell title={existing ? t('trips.create.editTitle', { id: existing.id }) : t('trips.create.title')} backTo={backTo}>
      <form noValidate onSubmit={form.handleSubmit(handleSubmit)} className="flex max-w-160 flex-col gap-5">
        {locked ? (
          <p role="status" className="rounded-md border border-badge-warning-border bg-badge-warning-bg px-4 py-3 text-body text-badge-warning-fg">
            {t('trips.create.lockedHint')}
          </p>
        ) : null}
        <Card className="flex flex-col gap-4 p-5">
          <Input label={t('trips.create.name')} placeholder={t('trips.create.namePlaceholder')} error={errors.name?.message} {...form.register('name')} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" label={t('trips.create.scheduledDate')} error={errors.scheduledDate?.message} {...form.register('scheduledDate')} />
            <SelectField control={form.control} name="driverId" label={t('trips.create.driver')} options={choices.drivers} hint={t('trips.create.driverHint')} />
          </div>
          <fieldset disabled={locked} className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
            <SelectField
              control={form.control}
              name="vehicleId"
              label={t('trips.create.vehicle')}
              placeholder={t('trips.create.vehiclePlaceholder')}
              options={choices.vehicles}
              hint={selected?.status === 'maintenance' ? t('trips.create.vehicleMaintenanceHint') : t('trips.create.vehicleHint')}
            />
            {selected ? (
              <dl className="grid grid-cols-2 gap-3 rounded-md border border-border bg-surface p-4">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-caption text-text-3">{t('trips.create.cargoSpace')}</dt>
                  <dd className="font-mono text-body font-medium">
                    {format.dimensions(selected.vehicle.innerLengthCm, selected.vehicle.innerWidthCm, selected.vehicle.innerHeightCm)}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-caption text-text-3">{t('trips.create.payload')}</dt>
                  <dd className="font-mono text-body font-medium">{format.weight(selected.vehicle.maxPayloadKg)}</dd>
                </div>
              </dl>
            ) : null}
          </fieldset>
        </Card>

        <fieldset disabled={locked} className="m-0 min-w-0 border-0 p-0">
          <TripStopsFields form={form} creating={!existing} />
        </fieldset>

        <div className="flex gap-2">
          <Button type="submit" variant="primary" loading={pending}>
            <Save strokeWidth={1.5} />
            {existing ? t('trips.create.submitEdit') : t('trips.create.submitCreate')}
          </Button>
          <Button type="button" variant="secondary" asChild>
            <Link to={backTo}>{t('trips.create.cancel')}</Link>
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open) blocker.reset?.()
        }}
        title={t('trips.leave.title')}
        description={t('trips.leave.description')}
        cancelLabel={t('trips.leave.stay')}
        confirmLabel={t('trips.leave.confirm')}
        danger
        onConfirm={() => blocker.proceed?.()}
      />
    </FormShell>
  )
}

/**
 * Lựa chọn của hai ô chọn. Xe bảo dưỡng vẫn hiện, kèm lý do, nhưng không chọn được (D-53) — trừ xe chuyến đang dùng, để form sửa
 * không mất giá trị. Tài xế: người dùng vai trò tài xế đang hoạt động; tài xế đang gán mà tài khoản đã khoá vẫn hiện, không chọn lại được.
 */
function formChoices(data: TripFormOptions | undefined, existing: Trip | undefined, t: TFunction) {
  const vehicles: SelectOption[] = (data?.vehicles ?? []).map(({ vehicle, status }) => {
    const maintenance = status === 'maintenance'
    return {
      value: vehicle.id,
      label: maintenance ? t('trips.create.vehicleMaintenance', { name: vehicle.name }) : vehicle.name,
      disabled: maintenance && vehicle.id !== existing?.vehicleId,
    }
  })
  const drivers: SelectOption[] = (data?.drivers ?? [])
    .filter((user) => user.status === 'active' || user.id === existing?.driverId)
    .toSorted((a, b) => compareText(a.fullName, b.fullName))
    .map((user) => user.status === 'active'
      ? { value: user.id, label: user.fullName }
      : { value: user.id, label: t('trips.create.driverSuspended', { name: user.fullName }), disabled: true })
  return { vehicles, drivers: [{ value: UNASSIGNED, label: t('trips.create.unassigned') }, ...drivers] }
}
