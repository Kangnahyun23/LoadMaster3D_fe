import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { fetchDashboardData } from './dashboard-api'
import { resolvePeriod, type PeriodSelection } from './dashboard-period'
import { summarizeDashboard, type DashboardData } from './dashboard-summary'

/**
 * Số liệu bảng điều khiển của kỳ đang chọn qua TanStack Query; component không gọi `dashboard-api.ts` trực tiếp (mục 9).
 * Dữ liệu kho nằm ở một khoá `['dashboard']` (mutation của chuyến làm mới khoá này); kỳ chỉ đổi phần `select`, nên đổi kỳ
 * tính lại ngay trên máy, không nhấp nháy trạng thái đang tải. Đọc lại mỗi lần mở màn: tiến độ kho và giao hàng đổi liên tục.
 */
export function useDashboardQuery({ preset, from, to }: PeriodSelection) {
  const select = useCallback(
    (data: DashboardData) => summarizeDashboard(data, resolvePeriod({ preset, from, to }, data.today)),
    [preset, from, to],
  )
  return useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboardData, select, staleTime: 0 })
}
