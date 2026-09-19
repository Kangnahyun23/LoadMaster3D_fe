import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'
import { changePassword, saveProfile } from './profile-api'

/**
 * Lưu họ tên, số điện thoại của chính mình: đọc lại người dùng của phiên (tên trên nav rail đổi ngay) và làm mới mọi màn đang
 * mở — tên người xuất hiện ở danh sách người dùng, chuyến (tài xế) và nhật ký.
 */
export function useSaveProfileMutation() {
  const { refreshUser } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveProfile,
    onSuccess: () => {
      refreshUser()
      void queryClient.invalidateQueries()
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({ mutationFn: changePassword })
}
