import { useMemo } from 'react'
import { adaptResult, type ViewerSceneModel } from '@/features/viewer3d/scene-input'
import type { Revision, Trip } from '@/lib/mock-db'

/**
 * Scene cm của phương án kho đang xếp (LM-030), dựng lại chỉ khi phương án hoặc điểm giao đổi. Mỗi bước ghi làm đổi `trip.loading`
 * và đọc lại chuyến; nhờ structural sharing của TanStack Query, `stops` và `plan` giữ nguyên tham chiếu nên khung 3D không dựng lại.
 */
export function useSessionModel(trip: Trip, plan: Revision): ViewerSceneModel {
  const { id, stops, inputVersion } = trip
  return useMemo(() => adaptResult({ trip: { id, stops, inputVersion }, revision: plan }), [id, stops, inputVersion, plan])
}
