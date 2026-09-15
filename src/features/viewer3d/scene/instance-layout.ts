import type { ScenePlacement } from '@/features/viewer3d/scene-input'

/** GPU slots are a private index, never the order of a filtered UI list. */
export function createInstanceLayout(placements: readonly ScenePlacement[]) {
  const placementById = new Map(placements.map((placement) => [placement.id, placement]))
  if (placementById.size !== placements.length) throw new Error('Mã kiện trong scene bị trùng')
  const instanceToPlacementId = [...placementById.keys()].sort()
  const placementIdToInstance = new Map(instanceToPlacementId.map((id, index) => [id, index]))
  return { instanceToPlacementId, placementIdToInstance, placementById }
}

export type InstanceLayout = ReturnType<typeof createInstanceLayout>

export function sameGeometry(a: ScenePlacement | undefined, b: ScenePlacement): boolean {
  return a !== undefined && a.position.x === b.position.x && a.position.y === b.position.y &&
    a.position.z === b.position.z && a.lengthCm === b.lengthCm &&
    a.widthCm === b.widthCm && a.heightCm === b.heightCm
}

export function cargoVisibility(placement: ScenePlacement, step: number, sliceCm: number) {
  if (placement.step > step) return 'hidden'
  return placement.position.x + placement.lengthCm > sliceCm ? 'dim' : 'opaque'
}
