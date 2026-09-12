import { toast } from 'sonner'

/**
 * Báo cho người dùng biết chức năng đã có trên giao diện nhưng chưa nối
 * backend, thay vì để nút bấm vào không phản hồi gì.
 * Xoá lời gọi khi chức năng tương ứng được nối thật.
 */
export function notifyPendingFeature(feature: string, detail?: string) {
  toast.info(`${feature} chưa khả dụng`, {
    description: detail ?? 'Chức năng này chờ nối với backend.',
  })
}
