import { useQuery } from '@tanstack/react-query'
import { fetchTrips } from './trips-api'

/** Danh sách chuyến qua TanStack Query — component không gọi API trực tiếp (mục 9). */
export function useTripsQuery({ empty = false }: { empty?: boolean } = {}) {
  return useQuery({
    queryKey: ['trips', { empty }],
    queryFn: () => fetchTrips({ empty }),
  })
}
