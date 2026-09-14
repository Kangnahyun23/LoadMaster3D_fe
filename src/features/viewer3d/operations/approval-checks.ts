import type { Placement, VehicleSpec } from '@/types/load-plan'
import { formatInteger, formatRatioAsPercent } from '@/lib/format'
import type { ApprovalCheck } from '../ApprovePlanDialog'
import { accessibilitySummary, stopOrderConsistent } from './operations-model'

export function operationApprovalChecks(placements: readonly Placement[], vehicle: VehicleSpec, edited: boolean): ApprovalCheck[] {
  const consistent = stopOrderConsistent(placements)
  const checks: ApprovalCheck[] = [{ tone: consistent ? 'success' : 'warning', text: consistent
    ? 'Thứ tự xếp phù hợp thứ tự điểm giao' : 'Thứ tự xếp chưa phù hợp thứ tự điểm giao' }]
  const count = accessibilitySummary(placements, vehicle)
  checks.push({ tone: 'warning', text: count
    ? `${formatInteger(count)} kiện có khả năng bị cản đường khi bắt đầu điểm giao (ước lượng hình học)`
    : 'Chưa thấy giao cắt hành lang dỡ thẳng; chưa xác nhận khả năng dỡ thực tế' })
  for (const [label, axle] of [['Trục trước', vehicle.frontAxle], ['Trục sau', vehicle.rearAxle]] as const) {
    const ratio = axle.capacityKg > 0 ? axle.loadKg / axle.capacityKg : null
    checks.push({ tone: ratio === null ? 'warning' : ratio > 1 ? 'danger' : 'success', text: ratio === null
      ? `${label}: chưa có giới hạn tải hợp lệ` : `${label} ${ratio > 1 ? 'vượt' : 'nằm trong'} giới hạn phương án gốc (${formatRatioAsPercent(ratio)})` })
  }
  if (edited) checks.push({ tone: 'warning', text: 'Có chỉnh sửa thủ công; tải trục chưa được tính lại cho bản chỉnh sửa' })
  return checks
}
