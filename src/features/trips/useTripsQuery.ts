import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { CargoPackage } from '@/domain/models'
import type { DeliveryStop } from '@/lib/mock-db'
import {
  createTrip,
  deletePackage,
  duplicateTripPackage,
  fetchPackages,
  fetchTripDetail,
  fetchTripRevisions,
  fetchTrips,
  fetchVehicleOptions,
  removeTripStop,
  savePackage,
  setTripVehicle,
  updateTripFrame,
  updateTripStops,
  type TripFrame,
} from './trips-api'

/** Chuyến và kiện qua TanStack Query — component không gọi API trực tiếp (mục 9). */

export function useTripsQuery() {
  // Trạng thái và tỷ lệ của từng dòng đổi theo mọi mutation của từng chuyến (khoá `['trips', tripId]`): đọc lại mỗi lần mở màn.
  return useQuery({ queryKey: ['trips', 'list'], queryFn: fetchTrips, staleTime: 0 })
}

export function useVehicleOptionsQuery() {
  return useQuery({ queryKey: ['vehicles'], queryFn: fetchVehicleOptions })
}

/** Tạo chuyến: làm mới danh sách chuyến và bảng điều khiển. */
export function useCreateTripMutation() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (frame: TripFrame) => createTrip(frame),
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: ['trips'] }),
      client.invalidateQueries({ queryKey: ['dashboard'] }),
    ]),
  })
}

export function useUpdateTripFrameMutation(tripId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (frame: Pick<TripFrame, 'name' | 'vehicleId'>) => updateTripFrame(tripId, frame),
    onSuccess: () => Promise.all([
      invalidateTrip(client, tripId),
      client.invalidateQueries({ queryKey: ['trips', 'list'] }),
    ]),
  })
}

export function useTripDetailQuery(tripId: string) {
  return useQuery({ queryKey: ['trips', tripId, 'detail'], queryFn: () => fetchTripDetail(tripId), enabled: tripId !== '' })
}

/** Khoá nằm dưới `['trips', tripId]` nên mọi mutation của chuyến và lần tối ưu mới đều làm mới danh sách này. */
export function useTripRevisionsQuery(tripId: string) {
  return useQuery({ queryKey: ['trips', tripId, 'revisions'], queryFn: () => fetchTripRevisions(tripId), enabled: tripId !== '' })
}

export function usePackagesQuery(tripId: string) {
  return useQuery({ queryKey: ['trips', tripId, 'packages'], queryFn: () => fetchPackages(tripId), enabled: tripId !== '' })
}

/**
 * Mọi thay đổi xe, điểm giao hay kiện đều đổi đầu vào tối ưu: làm mới cả chuyến, kiện và danh sách revision
 * (revision cũ thành lỗi thời theo `inputVersion`, D-31), và tổng kiện/khối lượng của bảng điều khiển (LM-052).
 */
function invalidateTrip(client: QueryClient, tripId: string) {
  return Promise.all([
    client.invalidateQueries({ queryKey: ['trips', tripId] }),
    client.invalidateQueries({ queryKey: ['dashboard'] }),
  ])
}

export function useTripStopsMutation(tripId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (stops: readonly DeliveryStop[]) => updateTripStops(tripId, stops),
    onSuccess: () => invalidateTrip(client, tripId),
  })
}

export function useRemoveStopMutation(tripId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (stopId: string) => removeTripStop(tripId, stopId),
    onSuccess: () => invalidateTrip(client, tripId),
  })
}

export function useTripVehicleMutation(tripId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (vehicleId: string) => setTripVehicle(tripId, vehicleId),
    onSuccess: () => invalidateTrip(client, tripId),
  })
}

export function useSavePackageMutation(tripId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (pkg: CargoPackage) => savePackage(tripId, pkg),
    onSuccess: () => invalidateTrip(client, tripId),
  })
}

export function useDeletePackageMutation(tripId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (packageId: string) => deletePackage(tripId, packageId),
    onSuccess: () => invalidateTrip(client, tripId),
  })
}

export function useDuplicatePackageMutation(tripId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (packageId: string) => duplicateTripPackage(tripId, packageId),
    onSuccess: () => invalidateTrip(client, tripId),
  })
}
