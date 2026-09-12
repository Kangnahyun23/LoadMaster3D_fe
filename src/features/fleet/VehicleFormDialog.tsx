import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { optionsFromLabels, SelectField } from '@/components/ui/SelectField'
import { vehicleFormSchema, type VehicleFormValues } from './vehicle-form.schema'
import {
  BODY_TYPE_LABELS,
  VEHICLE_STATUS_LABELS,
  type Vehicle,
} from './vehicles.mock'

const BODY_TYPE_OPTIONS = optionsFromLabels(BODY_TYPE_LABELS)
const STATUS_OPTIONS = optionsFromLabels(VEHICLE_STATUS_LABELS)

const EMPTY: VehicleFormValues = {
  name: '',
  plate: '',
  bodyType: 'thung_kin',
  innerLengthMm: 6000,
  innerWidthMm: 2200,
  innerHeightMm: 2200,
  payloadKg: 5000,
  frontAxleKg: 2400,
  rearAxleKg: 3400,
  depot: '',
  status: 'san_sang',
  assignedDriver: '',
}

function toFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    name: vehicle.name,
    plate: vehicle.plate,
    bodyType: vehicle.bodyType,
    innerLengthMm: vehicle.innerLengthMm,
    innerWidthMm: vehicle.innerWidthMm,
    innerHeightMm: vehicle.innerHeightMm,
    payloadKg: vehicle.payloadKg,
    frontAxleKg: vehicle.frontAxle.capacityKg,
    rearAxleKg: vehicle.rearAxle.capacityKg,
    depot: vehicle.depot,
    status: vehicle.status,
    assignedDriver: vehicle.assignedDriver ?? '',
  }
}

/** Thêm hoặc sửa xe. Truyền `vehicle` để sửa, bỏ trống để thêm mới. */
export function VehicleFormDialog({
  open,
  onOpenChange,
  vehicle,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: Vehicle
  onSubmit: (values: VehicleFormValues) => void
}) {
  const isEdit = Boolean(vehicle)

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: EMPTY,
  })

  // Nạp lại giá trị mỗi lần mở, vì hộp thoại được dùng lại cho nhiều xe.
  const { reset } = form
  useEffect(() => {
    if (open) reset(vehicle ? toFormValues(vehicle) : EMPTY)
  }, [open, vehicle, reset])

  const errors = form.formState.errors

  function handleValid(values: VehicleFormValues) {
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-160">
        <form noValidate onSubmit={form.handleSubmit(handleValid)}>
          <div className="flex flex-col gap-5 px-6 pt-6">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-h2 font-semibold">
                {isEdit ? 'Sửa thông tin xe' : 'Thêm xe vào đội'}
              </DialogTitle>
              <DialogDescription className="text-body text-text-2">
                Kích thước lòng thùng và tải trọng là dữ liệu đầu vào của bộ tối ưu, nhập càng đúng
                phương án càng sát thực tế.
              </DialogDescription>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Tên xe" placeholder="Hyundai HD210" error={errors.name?.message} {...form.register('name')} />
              <Input label="Biển số" placeholder="60C-446.32" className="font-mono" error={errors.plate?.message} {...form.register('plate')} />
              <SelectField control={form.control} name="bodyType" label="Loại thùng" options={BODY_TYPE_OPTIONS} />
              <SelectField control={form.control} name="status" label="Trạng thái" options={STATUS_OPTIONS} />
            </div>

            <fieldset className="flex flex-col gap-3 rounded-md border border-border p-4">
              <legend className="px-1 text-caption font-medium text-text-3">Lòng thùng</legend>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Dài" numeric suffix="mm" error={errors.innerLengthMm?.message} {...form.register('innerLengthMm', { valueAsNumber: true })} />
                <Input label="Rộng" numeric suffix="mm" error={errors.innerWidthMm?.message} {...form.register('innerWidthMm', { valueAsNumber: true })} />
                <Input label="Cao" numeric suffix="mm" error={errors.innerHeightMm?.message} {...form.register('innerHeightMm', { valueAsNumber: true })} />
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-3 rounded-md border border-border p-4">
              <legend className="px-1 text-caption font-medium text-text-3">Tải trọng</legend>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Tải trọng" numeric suffix="kg" error={errors.payloadKg?.message} {...form.register('payloadKg', { valueAsNumber: true })} />
                <Input label="Trục trước" numeric suffix="kg" error={errors.frontAxleKg?.message} {...form.register('frontAxleKg', { valueAsNumber: true })} />
                <Input label="Trục sau" numeric suffix="kg" error={errors.rearAxleKg?.message} {...form.register('rearAxleKg', { valueAsNumber: true })} />
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Kho trực thuộc" placeholder="Kho Long Bình" error={errors.depot?.message} {...form.register('depot')} />
              <Input label="Tài xế thường chạy" placeholder="Bỏ trống nếu chưa gán" hint="Không bắt buộc" error={errors.assignedDriver?.message} {...form.register('assignedDriver')} />
            </div>
          </div>

          <DialogFooter className="justify-end px-6">
            <DialogClose asChild>
              <Button type="button" variant="secondary">Huỷ</Button>
            </DialogClose>
            <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
              {isEdit ? 'Lưu thay đổi' : 'Thêm xe'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
