import { useQuery } from '@tanstack/react-query'
import { fetchWarehousePlan } from './warehouse-api'

/**
 * Phương án đã duyệt cho màn kho; component không gọi `warehouse-api.ts` trực tiếp (mục 9).
 * `staleTime: 0`: vừa Duyệt ở Planner rồi mở kho thì phải đọc lại bản duyệt mới, không dùng cache 30 s.
 */
export function useWarehousePlanQuery(tripId?: string) {
  return useQuery({
    queryKey: ['warehouse', 'plan', { tripId }],
    queryFn: () => fetchWarehousePlan(tripId),
    staleTime: 0,
  })
}
