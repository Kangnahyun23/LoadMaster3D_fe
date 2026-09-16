import { ChevronLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useT } from '@/lib/i18n'
import { useVehicleQuery } from './useVehiclesQuery'
import { VehicleForm } from './VehicleForm'

/**
 * Trang cấu hình xe (D-17, D-38): `/doi-xe/moi` thêm xe mới, `/doi-xe/:vehicleId` sửa xe đang có.
 * Chỗ dành cho xem trước 3D thùng xe (LM-042) nằm trong `VehicleForm`, chưa dựng ở issue này —
 * `features/fleet` chưa import `three`.
 */
export function VehicleDetailPage() {
  const t = useT()
  const { vehicleId } = useParams()
  const query = useVehicleQuery(vehicleId ?? '')

  if (vehicleId === undefined) return <VehicleForm />

  if (query.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center p-8" role="status" aria-label={t('fleet.detail.loading')}>
        <Spinner />
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-body text-text-2">{t('fleet.detail.notFound', { id: vehicleId })}</p>
        <Button variant="secondary" asChild>
          <Link to="/doi-xe">
            <ChevronLeft strokeWidth={1.5} />
            {t('fleet.detail.back')}
          </Link>
        </Button>
      </div>
    )
  }

  // `key` để form nạp lại giá trị mặc định khi chuyển sang xe khác
  return <VehicleForm key={query.data.id} vehicle={query.data} />
}
