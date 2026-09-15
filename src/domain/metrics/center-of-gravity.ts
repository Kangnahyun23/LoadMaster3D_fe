import type { ConstraintIssue } from '@/domain/constraints'
import { gt, roundCm } from '@/domain/geometry'
import type { PackagePlacement, VehicleConfig } from '@/domain/models'

export type PointCm = { x: number; y: number; z: number }

/** D-36: ngưỡng cảnh báo trọng tâm — chỉ khai báo ở đây. Tỷ lệ theo kích thước trong thùng. */
export const COG_THRESHOLDS = { lateralRatio: 0.1, heightRatio: 0.5 } as const

type CenterOfGravityIssue = ConstraintIssue<'COG_LATERAL' | 'COG_HIGH'>

/**
 * Cảnh báo (không chặn) khi trọng tâm hàng lệch khỏi đường giữa thùng quá `lateralRatio` chiều rộng,
 * hoặc cao hơn `heightRatio` chiều cao trong thùng. Đúng bằng ngưỡng thì không cảnh báo.
 * So sánh trên số chưa làm tròn; `params` làm tròn 0,1 cm để hiển thị.
 */
export function checkCenterOfGravity(
  vehicle: Pick<VehicleConfig, 'innerWidthCm' | 'innerHeightCm'>,
  centerOfGravityCm: PointCm,
): CenterOfGravityIssue[] {
  const issues: CenterOfGravityIssue[] = []
  const offsetCm = Math.abs(centerOfGravityCm.y - vehicle.innerWidthCm / 2)
  const lateralLimitCm = vehicle.innerWidthCm * COG_THRESHOLDS.lateralRatio
  if (gt(offsetCm, lateralLimitCm)) {
    issues.push({
      code: 'COG_LATERAL',
      severity: 'warning',
      params: { offsetCm: roundCm(offsetCm), limitCm: roundCm(lateralLimitCm) },
    })
  }
  const heightLimitCm = vehicle.innerHeightCm * COG_THRESHOLDS.heightRatio
  if (gt(centerOfGravityCm.z, heightLimitCm)) {
    issues.push({
      code: 'COG_HIGH',
      severity: 'warning',
      params: { heightCm: roundCm(centerOfGravityCm.z), limitCm: roundCm(heightLimitCm) },
    })
  }
  return issues
}

/**
 * Spec 7.9: trọng tâm hàng = tổng (khối lượng × tâm hộp) / tổng khối lượng, theo từng trục, cm.
 * Tâm hàng đã xếp, không phải trọng tâm toàn xe (AGENTS mục 7).
 */
export function centerOfGravity(
  placements: readonly PackagePlacement[],
  weightOf: (placement: PackagePlacement) => number,
): PointCm | undefined {
  let totalKg = 0, x = 0, y = 0, z = 0
  for (const p of placements) {
    const kg = weightOf(p)
    totalKg += kg
    x += kg * (p.xCm + p.placedLengthCm / 2)
    y += kg * (p.yCm + p.placedWidthCm / 2)
    z += kg * (p.zCm + p.placedHeightCm / 2)
  }
  if (!(totalKg > 0)) return undefined
  return { x: x / totalKg, y: y / totalKg, z: z / totalKg }
}
