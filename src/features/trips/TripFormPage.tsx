import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Plus, Save, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import type { Trip } from '@/lib/mock-db'
import { useFormat, useT } from '@/lib/i18n'
import { createTripFormSchema, type TripFormValues } from './trip-form.schema'
import { useCreateTripMutation, useTripDetailQuery, useUpdateTripFrameMutation, useVehicleOptionsQuery } from './useTripsQuery'

/**
 * Tạo mới hoặc sửa khung chuyến (LM-053): ghi thật vào kho qua mutation, không báo thành công giả.
 * Tạo: tên, xe, điểm giao theo thứ tự. Sửa: tên và xe; điểm giao và kiện sửa ở Chi tiết chuyến.
 */
export function TripFormPage() {
  const { tripId = '' } = useParams()
  const t = useT()
  const detail = useTripDetailQuery(tripId)
  if (tripId === '') return <TripForm />
  if (detail.isPending) return <FormShell title={t('trips.create.editTitle', { id: tripId })} backTo={`/chuyen/${tripId}`} />
  if (!detail.data) {
    return (
      <FormShell title={t('trips.create.editTitle', { id: tripId })} backTo="/chuyen">
        <p role="alert" className="text-body text-danger">{t('trips.create.notFound', { id: tripId })}</p>
      </FormShell>
    )
  }
  return <TripForm key={detail.data.trip.id} existing={detail.data.trip} />
}

function FormShell({ title, backTo, children }: { title: string; backTo: string; children?: React.ReactNode }) {
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
  const vehicles = useVehicleOptionsQuery()
  const create = useCreateTripMutation()
  const update = useUpdateTripFrameMutation(existing?.id ?? '')
  const schema = useMemo(() => createTripFormSchema(t, { withStops: !existing }), [t, existing])

  const form = useForm<TripFormValues>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? { name: existing.name, vehicleId: existing.vehicleId, stops: [] }
      : { name: '', vehicleId: '', stops: [{ name: '', address: '' }] },
  })
  const stops = useFieldArray({ control: form.control, name: 'stops' })
  const vehicleId = useWatch({ control: form.control, name: 'vehicleId' })
  const selectedVehicle = vehicles.data?.find((vehicle) => vehicle.id === vehicleId)
  const errors = form.formState.errors
  const backTo = existing ? `/chuyen/${existing.id}` : '/chuyen'
  const pending = create.isPending || update.isPending

  function handleSubmit(values: TripFormValues) {
    const onError = () => toast.error(t('trips.create.failed'))
    if (existing) {
      update.mutate({ name: values.name, vehicleId: values.vehicleId }, {
        onSuccess: (trip) => { toast.success(t('trips.create.saved', { id: trip.id })); void navigate(`/chuyen/${trip.id}`) },
        onError,
      })
      return
    }
    create.mutate(values, {
      onSuccess: (trip) => { toast.success(t('trips.create.created', { id: trip.id })); void navigate(`/chuyen/${trip.id}`) },
      onError,
    })
  }

  return (
    <FormShell title={existing ? t('trips.create.editTitle', { id: existing.id }) : t('trips.create.title')} backTo={backTo}>
      <form noValidate onSubmit={form.handleSubmit(handleSubmit)} className="flex max-w-160 flex-col gap-5">
        <Card className="flex flex-col gap-4 p-5">
          <Input label={t('trips.create.name')} placeholder={t('trips.create.namePlaceholder')} error={errors.name?.message} {...form.register('name')} />
          <SelectField
            control={form.control}
            name="vehicleId"
            label={t('trips.create.vehicle')}
            placeholder={t('trips.create.vehiclePlaceholder')}
            options={(vehicles.data ?? []).map((vehicle) => ({ value: vehicle.id, label: vehicle.name }))}
            hint={t('trips.create.vehicleHint')}
          />
          {selectedVehicle ? (
            <dl className="grid grid-cols-2 gap-3 rounded-md border border-border bg-surface p-4">
              <div className="flex flex-col gap-0.5">
                <dt className="text-caption text-text-3">{t('trips.create.cargoSpace')}</dt>
                <dd className="font-mono text-body font-medium">
                  {format.dimensions(selectedVehicle.innerLengthCm, selectedVehicle.innerWidthCm, selectedVehicle.innerHeightCm)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-caption text-text-3">{t('trips.create.payload')}</dt>
                <dd className="font-mono text-body font-medium">{format.weight(selectedVehicle.maxPayloadKg)}</dd>
              </div>
            </dl>
          ) : null}
        </Card>

        {existing ? <p className="text-body text-text-2">{t('trips.create.editStopsHint')}</p> : (
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-h3 font-semibold">{t('trips.create.stopsTitle')}</h2>
              <p className="text-caption text-text-3">{t('trips.create.stopsHint')}</p>
            </div>
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {stops.fields.map((field, index) => (
                <li key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                  <Input label={t('trips.create.stopName', { number: index + 1 })} error={errors.stops?.[index]?.name?.message} {...form.register(`stops.${index}.name`)} />
                  <Input label={t('trips.create.stopAddress', { number: index + 1 })} error={errors.stops?.[index]?.address?.message} {...form.register(`stops.${index}.address`)} />
                  <Button type="button" variant="ghost" className="size-10 px-0" aria-label={t('trips.create.removeStop', { number: index + 1 })}
                    disabled={stops.fields.length === 1} onClick={() => stops.remove(index)}>
                    <Trash2 strokeWidth={1.5} />
                  </Button>
                </li>
              ))}
            </ol>
            {errors.stops?.root?.message ?? errors.stops?.message ? (
              <p role="alert" className="text-caption text-danger">{errors.stops?.root?.message ?? errors.stops?.message}</p>
            ) : null}
            <Button type="button" variant="secondary" className="self-start" onClick={() => stops.append({ name: '', address: '' })}>
              <Plus strokeWidth={1.5} />
              {t('trips.create.addStop')}
            </Button>
          </Card>
        )}

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
    </FormShell>
  )
}
