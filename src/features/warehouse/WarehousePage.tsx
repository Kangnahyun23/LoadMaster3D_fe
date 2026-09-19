import { useSearchParams } from 'react-router'
import { LoadingStepPage } from './LoadingStepPage'
import { WarehouseTripsPage } from './WarehouseTripsPage'

/**
 * `/kho` (LM-086): không có `?chuyen` là danh sách chuyến cần xếp — màn chính của nhân viên kho; có `?chuyen=<mã>` là phiên xếp
 * của chuyến đó. `key` theo mã chuyến để đổi chuyến là dựng phiên mới, không mang lớp phủ hay hộp thoại sang.
 */
export function WarehousePage() {
  const [search] = useSearchParams()
  const tripId = search.get('chuyen')
  return tripId ? <LoadingStepPage key={tripId} tripId={tripId} /> : <WarehouseTripsPage />
}
