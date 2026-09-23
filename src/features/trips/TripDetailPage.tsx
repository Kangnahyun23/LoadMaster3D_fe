import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { TripLockBanner } from '@/components/TripLockBanner'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useCan } from '@/features/auth/useCan'
import type { CargoPackage } from '@/domain/models'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { CargoSummaryCard } from './CargoSummaryCard'
import { FragileNote } from './FragileNote'
import { PackageFormPanel } from './PackageFormPanel'
import { PackageImportDialog } from './PackageImportDialog'
import { emptyPackage } from './package-defaults'
import { PackagesTable } from './PackagesTable'
import { RouteDiagram } from './RouteDiagram'
import { StopList } from './StopList'
import { cargoSummary, stopRows, type StopRow } from './trip-summary'
import { TripDetailHeader } from './TripDetailHeader'
import { TripProgressCard } from './TripProgressCard'
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
 * Chi tiết chuyến hàng (LM-043 → LM-046, LM-088, LM-093, LM-095, LM-097): sơ đồ tuyến, xe và tài xế, thứ tự điểm giao kéo thả, tóm
 * tắt hàng, tiến trình, bảng kiện và nhập kiện từ file.
 * Dữ liệu đọc từ mock repository qua Query. Chỉ sửa được khi có quyền và chuyến còn lập kế hoạch (D-41, D-45); từ lúc kho bắt đầu
 * xếp, banner nói lý do và mọi thao tác sửa ẩn đi.
 */
export function TripDetailPage() {
  const { tripId = '' } = useParams()
  const t = useT()
  const can = useCan()
  const query = useTripDetailQuery(tripId)
  const stopsMutation = useTripStopsMutation(tripId)
  const removeStop = useRemoveStopMutation(tripId)
  const savePackage = useSavePackageMutation(tripId)
  const deletePackage = useDeletePackageMutation(tripId)
  const duplicatePackage = useDuplicatePackageMutation(tripId)
  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState<CargoPackage | null>(null)
  const [importing, setImporting] = useState(false)
  // Điểm giao đang lọc bảng kiện: cột điểm giao bên trái và ô chọn trên bảng dùng chung (V2)
  const [stopFilter, setStopFilter] = useState<number | null>(null)

  const trip = query.data?.trip
  const vehicle = query.data?.vehicle
  // Quản lý xem chuyến chỉ đọc (D-41); từ lúc kho bắt đầu xếp, xe, điểm giao và kiện bị khoá (D-45)
  const editable = can('trips.edit') && trip?.phase === 'planning'
  const stops = useMemo<StopRow[]>(() => (trip ? stopRows(trip.stops, trip.packages) : []), [trip])
  const summary = useMemo(() => (trip && vehicle ? cargoSummary(trip.packages, vehicle) : null), [trip, vehicle])
  const delivered = trip?.phase === 'delivering' || trip?.phase === 'completed'
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
      <TripDetailHeader tripId={tripId} detail={query.data} />

      {query.isPending ? (
        <div role="status" aria-label={t('trips.detail.loading')} className="grid flex-1 place-items-center"><Spinner /></div>
      ) : !trip || !vehicle || !summary ? (
        <div className="flex flex-1 flex-col items-start gap-3 px-shell py-8">
          <h2 className="text-h2 font-semibold">{t('trips.detail.notFound', { id: tripId })}</h2>
          <Button variant="secondary" asChild><Link to="/chuyen">{t('common.backToTrips')}</Link></Button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto px-shell pt-6 pb-8">
          <TripLockBanner trip={trip} />
          {/* V2: tiến trình ngang chiếm cả hàng (tới 7 mốc); sơ đồ tuyến gập được để bảng kiện lên cao */}
          <TripProgressCard trip={trip} />
          {/* Dấu đã giao chỉ khi chuyến đang giao hoặc đã hoàn thành (LM-097) — khi đó sơ đồ mở sẵn */}
          <RouteDiagram
            collapsible
            defaultOpen={delivered}
            stops={stops}
            delivery={delivered ? trip.delivery : undefined}
          />

          {/*
            V2: trái là tóm tắt hàng và thứ tự điểm giao (bấm để lọc bảng), giữa là bảng kiện, phải là phương tiện; chọn một kiện thì
            cột phải thành panel kiện (xem + form). Từ 1.536 px đủ ba cột như V2; 1.280–1.535 px thẻ phương tiện xuống dưới cột trái để
            bảng kiện giữ ~1.050 px (ba cột ở 1.366 px chỉ còn ~650 px, tên kiện bị cắt). Hẹp hơn thì xếp chồng một cột (LM-095).
            Vị trí đổi bằng grid-template-areas, không dựng thẻ hai lần.
          */}
          <div className={cn('grid items-start gap-5', editing
            ? 'xl:grid-cols-[272px_minmax(0,1fr)_336px] xl:[grid-template-areas:"left_main_side"]'
            : 'xl:grid-cols-[272px_minmax(0,1fr)] xl:[grid-template-areas:"left_main"_"side_main"] 2xl:grid-cols-[272px_minmax(0,1fr)_336px] 2xl:[grid-template-areas:"left_main_side"]')}>
            <div className="flex min-w-0 flex-col gap-4 xl:[grid-area:left]">
              <CargoSummaryCard summary={summary} />
              <StopList
                stops={stops}
                readOnly={!editable}
                onReorder={(next) => stopsMutation.mutate(next)}
                onRemove={handleRemoveStop}
                selectedStop={stopFilter}
                onSelectStop={setStopFilter}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-3 xl:[grid-area:main]">
              <PackagesTable
                packages={trip.packages}
                vehicle={vehicle}
                stops={stops}
                selectedId={editing?.id ?? null}
                onSelect={(pkg) => setEditing(editing?.id === pkg.id ? null : pkg)}
                onAdd={editable ? () => setEditing(emptyPackage(trip.packages, stops[0]?.number ?? 1)) : undefined}
                onImport={editable ? () => setImporting(true) : undefined}
                stopFilter={stopFilter}
                onStopFilterChange={setStopFilter}
              />
              {editable ? <PackageImportDialog trip={trip} vehicle={vehicle} open={importing} onOpenChange={setImporting} /> : null}
            </div>

            {editing ? (
              <div className="min-w-0 xl:sticky xl:top-0 xl:[grid-area:side]">
              <PackageFormPanel
                key={editing.id}
                value={editing}
                vehicle={vehicle}
                stops={stops}
                readOnly={!editable}
                onSave={handleSave}
                onDelete={trip.packages.some((pkg) => pkg.id === editing.id)
                  ? (pkg) => deletePackage.mutate(pkg.id, { onSuccess: () => setEditing(null) })
                  : undefined}
                onDuplicate={trip.packages.some((pkg) => pkg.id === editing.id) ? handleDuplicate : undefined}
                onClose={() => setEditing(null)}
              />
              </div>
            ) : (
              <div className="flex min-w-0 flex-col gap-4 xl:[grid-area:side]">
                <VehicleCard vehicle={vehicle} tripId={tripId} driverId={trip.driverId} driver={query.data?.driver} canChange={editable} usage={summary} />
                <FragileNote packages={trip.packages} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
