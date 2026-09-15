import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import type { VehicleConfig } from '@/domain/models'
import { formatInteger } from '@/lib/format'
import type { ApprovalCheck } from '../ApprovePlanDialog'
import { accessibilitySummary, stopOrderConsistent } from './operations-model'

export function operationApprovalChecks(placements: readonly ScenePlacement[], vehicle: VehicleConfig, edited: boolean): ApprovalCheck[] {
  const consistent = stopOrderConsistent(placements)
  const checks: ApprovalCheck[] = [{ tone: consistent ? 'success' : 'warning', text: consistent
    ? 'Thứ tự xếp phù hợp thứ tự điểm giao' : 'Thứ tự xếp chưa phù hợp thứ tự điểm giao' }]
  const count = accessibilitySummary(placements, vehicle)
  checks.push({ tone: 'warning', text: count
    ? `${formatInteger(count)} kiện có khả năng bị cản đường khi bắt đầu điểm giao (ước lượng hình học)`
    : 'Chưa thấy giao cắt hành lang dỡ thẳng; chưa xác nhận khả năng dỡ thực tế' })
  // Spec 7.10: không có số tải trục khi backend chưa tính (LM-037), nên Duyệt không kiểm tải trục.
  if (edited) checks.push({ tone: 'warning', text: 'Có chỉnh sửa thủ công' })
  return checks
}
