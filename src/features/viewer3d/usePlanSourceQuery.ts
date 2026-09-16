import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PlacementPatch } from '@/domain/constraints'
import { approvePlanRevision, fetchPlanSource } from './viewer-api'

/** Phương án của chuyến qua TanStack Query; component không gọi `viewer-api.ts` trực tiếp (mục 9). */
export function usePlanSourceQuery(tripId: string, ref?: string) {
  return useQuery({
    queryKey: ['trips', tripId, 'plan', { ref }],
    queryFn: () => fetchPlanSource(tripId, ref),
  })
}

/** Duyệt phương án: xong thì làm mới revision của chuyến (Planner đọc bản approved) và bảng điều khiển. */
export function useApproveRevisionMutation(tripId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ revisionId, patches }: { revisionId: string; patches: readonly PlacementPatch[] }) => approvePlanRevision(revisionId, patches),
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: ['trips', tripId] }),
      client.invalidateQueries({ queryKey: ['dashboard'] }),
    ]),
  })
}
