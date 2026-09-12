import { createColumnHelper } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDimensions, formatInteger } from '@/lib/format'
import type { VehicleFormValues } from './vehicle-form.schema'
import { VehicleFormDialog } from './VehicleFormDialog'
import {
  BODY_TYPE_LABELS,
  VEHICLE_STATUS_LABELS,
  VEHICLES,
  type Vehicle,
  type VehicleStatus,
} from './vehicles.mock'

const STATUS_TONE: Record<VehicleStatus, 'success' | 'cyan' | 'warning' | 'neutral'> = {
  san_sang: 'success',
  dang_chay: 'cyan',
  bao_duong: 'warning',
  ngung: 'neutral',
}

const helper = createColumnHelper<BaseTableFeatures, Vehicle>()
const mono = 'font-mono text-caption'

const columns = helper.columns([
  helper.accessor('plate', {
    header: 'Biển số',
    meta: { width: '130px' } satisfies ColumnMeta,
    cell: (info) => <span className={mono}>{info.getValue()}</span>,
  }),
  helper.accessor('name', {
    header: 'Xe',
    cell: (info) => (
      <span className="block truncate">
        {info.getValue()}{' '}
        <span className="text-text-3">{BODY_TYPE_LABELS[info.row.original.bodyType]}</span>
      </span>
    ),
  }),
  helper.accessor('innerLengthMm', {
    header: 'Lòng thùng (D × R × C)',
    meta: { align: 'right', width: '220px' } satisfies ColumnMeta,
    cell: (info) => {
      const v = info.row.original
      return (
        <span className={mono}>
          {formatDimensions(v.innerLengthMm, v.innerWidthMm, v.innerHeightMm).replace(' mm', '')}{' '}
          <span className="text-text-3">mm</span>
        </span>
      )
    },
  }),
  helper.accessor('payloadKg', {
    header: 'Tải trọng',
    meta: { align: 'right', width: '120px' } satisfies ColumnMeta,
    cell: (info) => (
      <span className={mono}>
        {formatInteger(info.getValue())} <span className="text-text-3">kg</span>
      </span>
    ),
  }),
  helper.accessor('assignedDriver', {
    header: 'Tài xế',
    meta: { width: '170px' } satisfies ColumnMeta,
    cell: (info) => {
      const driver = info.getValue()
      return driver ? (
        <span className="block truncate">{driver}</span>
      ) : (
        <span className="text-text-3">Chưa gán</span>
      )
    },
  }),
  helper.accessor('status', {
    header: 'Trạng thái',
    meta: { width: '160px' } satisfies ColumnMeta,
    cell: (info) => (
      <Badge tone={STATUS_TONE[info.getValue()]} dot={info.getValue() === 'dang_chay'}>
        {VEHICLE_STATUS_LABELS[info.getValue()]}
      </Badge>
    ),
  }),
])

/**
 * Đội xe — danh sách phương tiện, thêm và sửa bằng hộp thoại form.
 * Dữ liệu giữ ở state màn này; khi nối backend sẽ chuyển sang TanStack Query.
 */
export function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES)
  const [editing, setEditing] = useState<Vehicle | undefined>(undefined)
  const [dialogOpen, setDialogOpen] = useState(false)

  function openCreate() {
    setEditing(undefined)
    setDialogOpen(true)
  }

  function openEdit(vehicle: Vehicle) {
    setEditing(vehicle)
    setDialogOpen(true)
  }

  function handleSubmit(values: VehicleFormValues) {
    const base = {
      name: values.name,
      plate: values.plate,
      bodyType: values.bodyType,
      innerLengthMm: values.innerLengthMm,
      innerWidthMm: values.innerWidthMm,
      innerHeightMm: values.innerHeightMm,
      payloadKg: values.payloadKg,
      depot: values.depot,
      status: values.status,
      assignedDriver: values.assignedDriver?.trim() ? values.assignedDriver.trim() : null,
    }

    if (editing) {
      const updated: Vehicle = {
        ...editing,
        ...base,
        frontAxle: { ...editing.frontAxle, capacityKg: values.frontAxleKg },
        rearAxle: { ...editing.rearAxle, capacityKg: values.rearAxleKg },
      }
      setVehicles((current) => current.map((v) => (v.id === editing.id ? updated : v)))
      toast.success(`Đã cập nhật xe ${values.plate}`)
      return
    }

    const created: Vehicle = {
      id: `XE-${String(vehicles.length + 1).padStart(4, '0')}`,
      ...base,
      frontAxle: { loadKg: 0, capacityKg: values.frontAxleKg },
      rearAxle: { loadKg: 0, capacityKg: values.rearAxleKg },
    }
    setVehicles((current) => [created, ...current])
    toast.success(`Đã thêm xe ${values.plate} vào đội`)
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center justify-between gap-4 border-b border-border bg-bg px-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-h2 font-semibold">Đội xe</h1>
          <span className="font-mono text-caption text-text-3">
            {formatInteger(vehicles.length)} xe
          </span>
        </div>
        <Button variant="primary" className="h-9 px-3.5" onClick={openCreate}>
          <Plus strokeWidth={1.5} />
          Thêm xe
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="overflow-hidden rounded-md border border-border bg-bg">
          <DataTable
            data={vehicles}
            columns={columns}
            density="comfortable"
            onRowClick={openEdit}
          />
        </div>
        <p className="mt-3 text-caption text-text-3">Bấm vào một dòng để sửa thông tin xe.</p>
      </div>

      <VehicleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vehicle={editing}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
