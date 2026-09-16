import { useQuery } from '@tanstack/react-query'
import { fetchDriverPlan } from './driver-api'

/** Phương án đã duyệt cho tài xế; đọc lại mỗi lần mở màn để thấy bản vừa Duyệt. Component không gọi `driver-api.ts` trực tiếp (mục 9). */
export function useDriverPlanQuery(tripId?: string) {
  return useQuery({ queryKey: ['trips', 'driver', { tripId }], queryFn: () => fetchDriverPlan(tripId), staleTime: 0 })
}
