import { coveredArea, lt, type Box, type Rect } from '@/domain/geometry'
import { obstacleToBox, placementToBox, type PackagePlacement } from '@/domain/models'
import { restsOn, touchesTop } from './contact'
import type { ConstraintIssue } from './issues'
import type { PlacementLayout } from './layout'

/** Đáy hộp trên mặt sàn: u = X, v = Y. */
function footprint(box: Box): Rect {
  return { u1: box.xCm, u2: box.xCm + box.lengthCm, v1: box.yCm, v2: box.yCm + box.widthCm }
}

/**
 * Spec 7.7: tỷ lệ diện tích đáy kiện được đỡ, 0..1. Đáy chạm sàn (trong `CONTACT_TOLERANCE_CM`) được đỡ toàn bộ;
 * nếu không, mặt đỡ là mặt trên của kiện khác và của vật cản chịu tải chạm đáy trong dung sai.
 * Vật cản không chịu tải không đỡ (Spec 7.6, lỗi riêng `NON_BEARING_SUPPORT`).
 * `placement` có thể là vị trí thử của một kiện đã có trong `layout` (editor): vị trí cũ của chính nó không được tính.
 */
export function supportRatio(placement: PackagePlacement, layout: PlacementLayout): number {
  if (touchesTop(placement.zCm, 0)) return 1
  const box = placementToBox(placement)
  const supports = [
    ...layout.grid
      .queryBelow(box, { excludeId: placement.packageInstanceId })
      .map((id) => placementToBox(layout.placements.get(id)!)),
    ...layout.vehicle.obstacles
      .filter(({ loadBearing }) => loadBearing)
      .map(obstacleToBox)
      .filter((obstacleBox) => restsOn(box, obstacleBox)),
  ]
  // Hợp diện tích không âm; chỉ chặn trên, vì mép trôi dấu phẩy động có thể đẩy tỷ lệ lên 1.0000000000000002
  return Math.min(1, coveredArea(footprint(box), supports.map(footprint)) / (box.lengthCm * box.widthCm))
}

/** Spec 7.7: tỷ lệ đỡ dưới `minSupportRatio` của kiện gốc → `SUPPORT_BELOW_MIN` (cảnh báo), tham số là tỷ lệ thô 0..1. */
export function supportIssues(
  placement: PackagePlacement,
  minSupportRatio: number,
  layout: PlacementLayout,
): ConstraintIssue<'SUPPORT_BELOW_MIN'>[] {
  const ratio = supportRatio(placement, layout)
  if (!lt(ratio, minSupportRatio)) return []
  return [
    {
      code: 'SUPPORT_BELOW_MIN',
      severity: 'warning',
      packageInstanceId: placement.packageInstanceId,
      params: { ratio, required: minSupportRatio },
    },
  ]
}
