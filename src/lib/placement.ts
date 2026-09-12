import type { Packaging, Placement, VehicleSpec } from '@/types/load-plan'

/** Mô tả vị trí kiện bằng lời cho panel bên phải và danh sách kiện ghim. */

export const PACKAGING_LABELS: Record<Packaging, string> = {
  carton: 'Thùng carton',
  pallet: 'Pallet',
  crate: 'Thùng gỗ',
}

/** Hai kiện có chồng lấn mặt sàn (x, y) hay không. */
function footprintsOverlap(a: Placement, b: Placement): boolean {
  return (
    a.position.x < b.position.x + b.lengthMm &&
    b.position.x < a.position.x + a.lengthMm &&
    a.position.y < b.position.y + b.widthMm &&
    b.position.y < a.position.y + a.widthMm
  )
}

/** Kiện nằm ngay dưới: đỉnh cao nhất trong số kiện có đỉnh ≤ đáy kiện này. */
export function findBelow(p: Placement, all: Placement[]): Placement | undefined {
  let best: Placement | undefined
  for (const q of all) {
    if (q.id === p.id || !footprintsOverlap(p, q)) continue
    const top = q.position.z + q.heightMm
    if (top > p.position.z) continue
    if (!best || top > best.position.z + best.heightMm) best = q
  }
  return best
}

/** Kiện nằm ngay trên: đáy thấp nhất trong số kiện có đáy ≥ đỉnh kiện này. */
export function findAbove(p: Placement, all: Placement[]): Placement | undefined {
  const top = p.position.z + p.heightMm
  let best: Placement | undefined
  for (const q of all) {
    if (q.id === p.id || !footprintsOverlap(p, q)) continue
    if (q.position.z < top) continue
    if (!best || q.position.z < best.position.z) best = q
  }
  return best
}

/** Số lớp = 1 + số kiện xếp chồng bên dưới. */
export function layerOf(p: Placement, all: Placement[]): number {
  let layer = 1
  let current: Placement | undefined = p
  while (current) {
    current = findBelow(current, all)
    if (current) layer += 1
    if (layer > all.length) break
  }
  return layer
}

/** "Sàn · sát vách trước", "Lớp 2 · bên trái"… cho danh sách kiện ghim. */
export function describeWhere(
  p: Placement,
  all: Placement[],
  vehicle: VehicleSpec,
): string {
  const layer = layerOf(p, all)
  const layerLabel = layer === 1 ? 'Sàn' : `Lớp ${layer}`

  const centerY = p.position.y + p.widthMm / 2
  let side: string
  if (p.position.x < 1500) side = 'sát vách trước'
  else if (p.position.x + p.lengthMm > vehicle.innerLengthMm - 1500) side = 'gần cửa sau'
  else if (centerY < vehicle.innerWidthMm / 3) side = 'bên trái'
  else if (centerY > (vehicle.innerWidthMm * 2) / 3) side = 'bên phải'
  else side = 'giữa thùng'

  return `${layerLabel} · ${side}`
}
