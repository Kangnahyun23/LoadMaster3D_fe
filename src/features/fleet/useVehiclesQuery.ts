import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { VehicleConfig } from '@/domain/models'
import { deleteVehicle, fetchVehicle, fetchVehicles, saveVehicle } from './vehicles-api'

/**
 * Hook Query của Đội xe (D-06): component chỉ gọi vào đây, không gọi `vehicles-api.ts`.
 * Ghi xong thì vô hiệu hoá cache danh sách và chi tiết, nên danh sách tự cập nhật mà không tải lại trang.
 */

const VEHICLES_KEY = ['vehicles'] as const

function vehicleKey(id: string) {
  return [...VEHICLES_KEY, id] as const
}

export function useVehiclesQuery() {
  return useQuery({ queryKey: VEHICLES_KEY, queryFn: fetchVehicles })
}

/** `id` rỗng (trang thêm xe) thì không gọi kho. */
export function useVehicleQuery(id: string) {
  return useQuery({
    queryKey: vehicleKey(id),
    queryFn: () => fetchVehicle(id),
    enabled: id !== '',
  })
}

export function useSaveVehicleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vehicle: VehicleConfig) => saveVehicle(vehicle),
    onSuccess: async (saved) => {
      queryClient.setQueryData(vehicleKey(saved.id), saved)
      // Số xe trên bảng điều khiển (LM-052) cũng đổi.
      await Promise.all([queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }), queryClient.invalidateQueries({ queryKey: ['dashboard'] })])
    },
  })
}

export function useDeleteVehicleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: vehicleKey(id) })
      // Số xe trên bảng điều khiển (LM-052) cũng đổi.
      await Promise.all([queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }), queryClient.invalidateQueries({ queryKey: ['dashboard'] })])
    },
  })
}
