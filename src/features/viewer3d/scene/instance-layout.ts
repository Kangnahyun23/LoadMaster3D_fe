import type { Placement } from '@/types/load-plan'

/** GPU slots are a private index, never the order of a filtered UI list. */
export function createInstanceLayout(placements: readonly Placement[]) {
  const placementById = new Map(placements.map((placement) => [placement.id, placement]))
  if (placementById.size !== placements.length) throw new Error('Mã kiện trong scene bị trùng')
  const instanceToPlacementId = [...placementById.keys()].sort()
  const placementIdToInstance = new Map(instanceToPlacementId.map((id, index) => [id, index]))
  return { instanceToPlacementId, placementIdToInstance, placementById }
}

export type InstanceLayout = ReturnType<typeof createInstanceLayout>

export function sameGeometry(a: Placement | undefined, b: Placement): boolean {
  return a !== undefined && a.position.x === b.position.x && a.position.y === b.position.y &&
    a.position.z === b.position.z && a.lengthMm === b.lengthMm &&
    a.widthMm === b.widthMm && a.heightMm === b.heightMm
}

export function cargoVisibility(placement: Placement, step: number, sliceMm: number) {
  if (placement.step > step) return 'hidden'
  return placement.position.x + placement.lengthMm > sliceMm ? 'dim' : 'opaque'
}
