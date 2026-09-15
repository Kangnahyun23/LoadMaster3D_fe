import { useQuery } from '@tanstack/react-query'
import { fetchPlanSource } from './viewer-api'

/** Phương án của chuyến qua TanStack Query; component không gọi `viewer-api.ts` trực tiếp (mục 9). */
export function usePlanSourceQuery(tripId: string, jobId?: string) {
  return useQuery({
    queryKey: ['trips', tripId, 'plan', { jobId }],
    queryFn: () => fetchPlanSource(tripId, jobId),
  })
}
