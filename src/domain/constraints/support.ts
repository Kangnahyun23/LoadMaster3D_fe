import { gt, lt, type Box } from '@/domain/geometry'
import { obstacleToBox, placementToBox, type PackagePlacement } from '@/domain/models'
import { restsOn, touchesTop } from './contact'
import type { ConstraintIssue } from './issues'
import type { PlacementLayout } from './layout'

/** Hình chữ nhật trên mặt sàn, chiếm [x1, x2) × [y1, y2), cm. */
type Rect = { x1: number; x2: number; y1: number; y2: number }

/** Phần đáy `box` nằm trên đáy `support`; `null` khi hai đáy không giao nhau thật (chỉ chạm cạnh). */
function clipFootprint(box: Box, support: Box): Rect | null {
  const x1 = Math.max(box.xCm, support.xCm)
  const x2 = Math.min(box.xCm + box.lengthCm, support.xCm + support.lengthCm)
  const y1 = Math.max(box.yCm, support.yCm)
  const y2 = Math.min(box.yCm + box.widthCm, support.yCm + support.widthCm)
  return gt(x2, x1) && gt(y2, y1) ? { x1, x2, y1, y2 } : null
}

/** Độ dài hợp các đoạn Y của những hình chữ nhật phủ dải X [left, right). */
function coveredLength(rects: readonly Rect[], left: number, right: number): number {
  const spans = rects.filter(({ x1, x2 }) => lt(x1, right) && gt(x2, left)).sort((a, b) => a.y1 - b.y1)
  let covered = 0
  let end = -Infinity
  for (const { y1, y2 } of spans) {
    covered += Math.max(0, y2 - Math.max(end, y1))
    end = Math.max(end, y2)
  }
  return covered
}

/**
 * Diện tích hợp của các hình chữ nhật, cm²: quét theo các mép X, mỗi dải nhân bề rộng với độ dài hợp theo Y,
 * nên phần các mặt đỡ chồng nhau chỉ tính một lần. Dải hẹp hơn EPSILON (mép trôi dấu phẩy động) không phủ gì.
 */
function unionArea(rects: readonly Rect[]): number {
  const xs = [...new Set(rects.flatMap(({ x1, x2 }) => [x1, x2]))].sort((a, b) => a - b)
  let area = 0
  xs.forEach((right, index) => {
    const left = xs[index - 1]
    if (left !== undefined) area += (right - left) * coveredLength(rects, left, right)
  })
  return area
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
  const rects = supports.flatMap((support) => clipFootprint(box, support) ?? [])
  // Hợp diện tích không âm; chỉ chặn trên, vì mép trôi dấu phẩy động có thể đẩy tỷ lệ lên 1.0000000000000002
  return Math.min(1, unionArea(rects) / (box.lengthCm * box.widthCm))
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
