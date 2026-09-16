import type { VehicleConfig } from '@/domain/models'
import type { ScenePlacement } from '../scene-input'

/**
 * Quan hệ trên/dưới của kiện trong scene cm, cho panel và mô tả vị trí bằng lời. Chỉ là chỉ dẫn đọc, không phải kiểm nâng đỡ
 * (domain làm việc đó).
 */

/** Gần vách trước / gần cửa sau trong khoảng này thì mô tả theo đầu thùng. */
const END_ZONE_CM = 150

function footprintsOverlap(a: ScenePlacement, b: ScenePlacement): boolean {
  return (
    a.position.x < b.position.x + b.lengthCm &&
    b.position.x < a.position.x + a.lengthCm &&
    a.position.y < b.position.y + b.widthCm &&
    b.position.y < a.position.y + a.widthCm
  )
}

/** Kiện nằm ngay dưới: đỉnh cao nhất trong số kiện có đỉnh ≤ đáy kiện này. */
export function findBelow(p: ScenePlacement, all: readonly ScenePlacement[]): ScenePlacement | undefined {
  let best: ScenePlacement | undefined
  for (const q of all) {
    if (q.id === p.id || !footprintsOverlap(p, q)) continue
    const top = q.position.z + q.heightCm
    if (top > p.position.z) continue
    if (!best || top > best.position.z + best.heightCm) best = q
  }
  return best
}

/** Kiện nằm ngay trên: đáy thấp nhất trong số kiện có đáy ≥ đỉnh kiện này. */
export function findAbove(p: ScenePlacement, all: readonly ScenePlacement[]): ScenePlacement | undefined {
  const top = p.position.z + p.heightCm
  let best: ScenePlacement | undefined
  for (const q of all) {
    if (q.id === p.id || !footprintsOverlap(p, q)) continue
    if (q.position.z < top) continue
    if (!best || q.position.z < best.position.z) best = q
  }
  return best
}

/** Số lớp = 1 + số kiện xếp chồng bên dưới. */
export function layerOf(p: ScenePlacement, all: readonly ScenePlacement[]): number {
  let layer = 1
  let current: ScenePlacement | undefined = p
  while (current) {
    current = findBelow(current, all)
    if (current) layer += 1
    if (layer > all.length) break
  }
  return layer
}

/** "Sàn · sát vách trước", "Lớp 2 · bên trái"… cho danh sách kiện ghim. */
export function describeWhere(p: ScenePlacement, all: readonly ScenePlacement[], vehicle: VehicleConfig): string {
  const layer = layerOf(p, all)
  const layerLabel = layer === 1 ? 'Sàn' : `Lớp ${layer}`
  const centerY = p.position.y + p.widthCm / 2
  let side: string
  if (p.position.x < END_ZONE_CM) side = 'sát vách trước'
  else if (p.position.x + p.lengthCm > vehicle.innerLengthCm - END_ZONE_CM) side = 'gần cửa sau'
  else if (centerY < vehicle.innerWidthCm / 3) side = 'bên trái'
  else if (centerY > (vehicle.innerWidthCm * 2) / 3) side = 'bên phải'
  else side = 'giữa thùng'
  return `${layerLabel} · ${side}`
}
