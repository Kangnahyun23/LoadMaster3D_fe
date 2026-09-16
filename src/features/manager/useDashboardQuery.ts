import { useQuery } from '@tanstack/react-query'
import { fetchDashboardSummary } from './dashboard-api'

/** Số liệu bảng điều khiển qua TanStack Query; component không gọi `dashboard-api.ts` trực tiếp (mục 9). */
export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardSummary,
  })
}
