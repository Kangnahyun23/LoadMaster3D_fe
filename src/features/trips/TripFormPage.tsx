import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Save } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SelectField, type SelectOption } from '@/components/ui/SelectField'
import { Textarea } from '@/components/ui/Textarea'
import { formatDimensions, formatInteger } from '@/lib/format'
import {
  displayDateToIso,
  tripFormSchema,
  type TripFormValues,
} from './trip-form.schema'
import { TRIPS } from './trip-list.mock'
import { TRIP_VEHICLES } from './trip-vehicles.mock'

const VEHICLE_OPTIONS: SelectOption[] = TRIP_VEHICLES.filter(
  (vehicle) => vehicle.status !== 'ngung',
).map((vehicle) => ({
  value: vehicle.id,
  label: `${vehicle.name} · ${vehicle.plate}`,
}))

const DEPOTS = ['Kho Long Bình', 'Kho Sóng Thần', 'Cảng Cát Lái']

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Tạo mới hoặc sửa chuyến. Bước này chỉ khai báo khung chuyến (ngày, kho,
 * xe); đơn hàng và điểm giao thêm ở màn chi tiết sau khi lưu.
 */
export function TripFormPage() {
  const params = useParams()
  const navigate = useNavigate()
  const existing = TRIPS.find((trip) => trip.id === params.tripId)
  const isEdit = Boolean(existing)

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: existing
      ? {
          date: displayDateToIso(existing.date),
          depot: existing.route.split('→')[0]?.trim() ?? DEPOTS[0] ?? '',
          vehicleId: TRIP_VEHICLES.find((v) => v.plate === existing.plate)?.id ?? '',
          note: '',
        }
      : { date: todayIso(), depot: DEPOTS[0] ?? '', vehicleId: '', note: '' },
  })

  const vehicleId = useWatch({ control: form.control, name: 'vehicleId' })
  const selectedVehicle = TRIP_VEHICLES.find((v) => v.id === vehicleId)
  const errors = form.formState.errors

  function onSubmit(values: TripFormValues) {
    const vehicle = TRIP_VEHICLES.find((v) => v.id === values.vehicleId)

    if (isEdit && existing) {
      toast.success(`Đã lưu chuyến ${existing.id}`)
      void navigate(`/chuyen/${existing.id}`)
      return
    }

    // Backend sẽ sinh mã chuyến thật; ở đây tạm suy từ ngày chạy.
    const id = `TRIP-${values.date.replaceAll('-', '').slice(0, 4)}-${values.date.replaceAll('-', '').slice(4)}`
    toast.success(`Đã tạo chuyến ${id}`, {
      description: `${vehicle?.name ?? 'Xe'} · ${values.depot}. Thêm đơn hàng để chạy tối ưu.`,
    })
    void navigate('/chuyen')
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center gap-4 border-b border-border bg-bg px-6">
        <Link
          to={isEdit && existing ? `/chuyen/${existing.id}` : '/chuyen'}
          aria-label="Quay lại"
          className="grid size-9 place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
        </Link>
        <h1 className="text-h2 font-semibold">
          {isEdit ? `Sửa chuyến ${existing?.id}` : 'Tạo chuyến mới'}
        </h1>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-160 flex-col gap-5"
        >
          <Card className="flex flex-col gap-4 p-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ngày chạy"
                type="date"
                error={errors.date?.message}
                {...form.register('date')}
              />
              <SelectField
                control={form.control}
                name="depot"
                label="Kho xuất phát"
                options={DEPOTS.map((depot) => ({ value: depot, label: depot }))}
              />
            </div>

            <SelectField
              control={form.control}
              name="vehicleId"
              label="Xe"
              placeholder="Chọn xe trong đội"
              options={VEHICLE_OPTIONS}
              hint="Chỉ hiện xe đang khai thác. Thêm xe mới ở mục Đội xe."
            />

            {selectedVehicle ? (
              <dl className="grid grid-cols-3 gap-3 rounded-md border border-border bg-surface p-4">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-caption text-text-3">Lòng thùng</dt>
                  <dd className="font-mono text-body font-medium">
                    {formatDimensions(
                      selectedVehicle.innerLengthMm,
                      selectedVehicle.innerWidthMm,
                      selectedVehicle.innerHeightMm,
                    ).replace(' mm', '')}{' '}
                    <span className="font-normal text-text-3">mm</span>
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-caption text-text-3">Tải trọng</dt>
                  <dd className="font-mono text-body font-medium">
                    {formatInteger(selectedVehicle.payloadKg)}{' '}
                    <span className="font-normal text-text-3">kg</span>
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-caption text-text-3">Tài xế</dt>
                  <dd className="text-body">
                    {selectedVehicle.assignedDriver ?? (
                      <span className="text-text-3">Chưa gán</span>
                    )}
                  </dd>
                </div>
              </dl>
            ) : null}

            <Textarea
              label="Ghi chú"
              placeholder="Yêu cầu riêng của chuyến, ví dụ giờ giao cố định, hàng cần giữ lạnh…"
              hint="Không bắt buộc"
              error={errors.note?.message}
              {...form.register('note')}
            />
          </Card>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
              <Save strokeWidth={1.5} />
              {isEdit ? 'Lưu thay đổi' : 'Tạo chuyến'}
            </Button>
            <Button type="button" variant="secondary" asChild>
              <Link to={isEdit && existing ? `/chuyen/${existing.id}` : '/chuyen'}>Huỷ</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
