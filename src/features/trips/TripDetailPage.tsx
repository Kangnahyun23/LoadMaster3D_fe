import { ChevronLeft, Play } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { CargoPackage } from '@/domain/models'
import { useT } from '@/lib/i18n'
import { CargoSummaryCard } from './CargoSummaryCard'
import { PackageFormPanel } from './PackageFormPanel'
import { emptyPackage } from './package-defaults'
import { PackagesTable } from './PackagesTable'
import { StopList } from './StopList'
import { cargoSummary, stopRows, type StopRow } from './trip-summary'
import {
  useDeletePackageMutation,
  useDuplicatePackageMutation,
  useRemoveStopMutation,
  useSavePackageMutation,
  useTripDetailQuery,
  useTripStopsMutation,
} from './useTripsQuery'
import { VehicleCard } from './VehicleCard'

/**
 * Chi tiết chuyến hàng (LM-043, LM-044, LM-046): xe và tóm tắt hàng hoá, thứ tự điểm giao kéo thả, bảng kiện.
 * Dữ liệu đọc từ mock repository qua Query; hành động chính duy nhất là "Chạy tối ưu" (AGENTS mục 5).
 */
export function TripDetailPage() {
  const { tripId = '' } = useParams()
  const t = useT()
  const query = useTripDetailQuery(tripId)
  const stopsMutation = useTripStopsMutation(tripId)
  const removeStop = useRemoveStopMutation(tripId)
  const savePackage = useSavePackageMutation(tripId)
  const deletePackage = useDeletePackageMutation(tripId)
  const duplicatePackage = useDuplicatePackageMutation(tripId)
  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState<CargoPackage | null>(null)

  const trip = query.data?.trip
  const vehicle = query.data?.vehicle
  const stops = useMemo<StopRow[]>(() => (trip ? stopRows(trip.stops, trip.packages) : []), [trip])
  const summary = useMemo(() => (trip && vehicle ? cargoSummary(trip.packages, vehicle) : null), [trip, vehicle])
  // `?kien=<mã>` mở panel của kiện đó — liên kết từ validation summary của Thiết lập tối ưu (LM-047).
  const linkedId = searchParams.get('kien')
  const editing = draft ?? trip?.packages.find((pkg) => pkg.id === linkedId) ?? null
  function setEditing(next: CargoPackage | null) {
    setDraft(next)
    if (linkedId !== null) setSearchParams((params) => { params.delete('kien'); return params }, { replace: true })
  }

  function handleRemoveStop(stop: StopRow) {
    removeStop.mutate(stop.id, {
      onSuccess: (result) => {
        if (result.allowed) toast.success(t('trips.stops.removed', { name: stop.name }))
        else toast.error(t('trips.stops.removeBlocked', { name: stop.name, count: result.affectedInstances }))
      },
    })
  }

  function handleSave(pkg: CargoPackage, keepOpen: boolean) {
    savePackage.mutate(pkg, {
      onSuccess: () => {
        toast.success(t('trips.form.saved', { id: pkg.id }))
        setEditing(keepOpen ? emptyPackage(trip?.packages ?? [], pkg.deliveryStop) : null)
      },
    })
  }

  function handleDuplicate(pkg: CargoPackage) {
    duplicatePackage.mutate(pkg.id, {
      onSuccess: (copy) => { toast.success(t('trips.form.duplicated', { id: copy.id })); setEditing(copy) },
    })
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center gap-4 border-b border-border bg-bg px-8">
        <Link
          to="/chuyen"
          aria-label="Quay lại danh sách chuyến"
          className="grid size-9 place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
        </Link>

        <div className="flex min-w-0 items-center gap-3">
          <h1 className="font-mono text-[22px] leading-8 font-semibold tracking-[-0.02em]">{tripId}</h1>
          {trip ? <span className="truncate text-body text-text-2">{trip.name}</span> : null}
        </div>

        <div className="flex-1" />

        <Button variant="primary" asChild>
          <Link to={`/chuyen/${tripId}/toi-uu${searchParams.get('mo-phong') === 'loi' ? '?mo-phong=loi' : ''}`}>
            <Play strokeWidth={1.5} />
            Chạy tối ưu
          </Link>
        </Button>
      </header>

      {query.isPending ? (
        <div role="status" aria-label="Đang tải chuyến" className="grid flex-1 place-items-center"><Spinner /></div>
      ) : !trip || !vehicle || !summary ? (
        <div className="flex flex-1 flex-col items-start gap-3 p-8">
          <h2 className="text-h2 font-semibold">Không tìm thấy chuyến {tripId}</h2>
          <Button variant="secondary" asChild><Link to="/chuyen">Về danh sách chuyến</Link></Button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-wrap items-start gap-6 overflow-auto px-8 pt-6 pb-8">
          <div className="flex w-80 flex-col gap-4">
            <VehicleCard vehicle={vehicle} tripId={tripId} />
            <CargoSummaryCard summary={summary} />
          </div>

          <div className="w-80"><StopList
            stops={stops}
            onReorder={(next) => stopsMutation.mutate(next)}
            onRemove={handleRemoveStop}
          /></div>

          <div className="flex h-full min-h-0 min-w-80 flex-1 flex-col gap-3">
            <div className="flex items-baseline gap-2 px-1">
              <h2 className="text-h3 font-semibold">{t('trips.packages.title')}</h2>
              <span className="font-mono text-caption text-text-3">
                {t('trips.stops.count', { count: summary.lines })}
              </span>
            </div>
            <PackagesTable
              packages={trip.packages}
              vehicle={vehicle}
              stops={stops}
              selectedId={editing?.id ?? null}
              onSelect={(pkg) => setEditing(editing?.id === pkg.id ? null : pkg)}
              onAdd={() => setEditing(emptyPackage(trip.packages, stops[0]?.number ?? 1))}
            />
          </div>

          {editing ? (
            <PackageFormPanel
              key={editing.id}
              value={editing}
              vehicle={vehicle}
              stops={stops}
              onSave={handleSave}
              onDelete={trip.packages.some((pkg) => pkg.id === editing.id)
                ? (pkg) => deletePackage.mutate(pkg.id, { onSuccess: () => setEditing(null) })
                : undefined}
              onDuplicate={trip.packages.some((pkg) => pkg.id === editing.id) ? handleDuplicate : undefined}
              onClose={() => setEditing(null)}
            />
          ) : null}
        </div>
      )}

    </div>
  )
}
