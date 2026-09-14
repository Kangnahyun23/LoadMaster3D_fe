import { Box3, InstancedMesh, Object3D, Sphere, Vector3 } from 'three'
import type { Placement } from '@/types/load-plan'
import { boxCenter, boxSize, MM } from './units'

export const HULL_PADDING = 0.012
export const DROP_HEIGHT = 1.2
const dummy = new Object3D()
const corner = new Vector3()

export function writeCargoMatrix(
  mesh: InstancedMesh, index: number, placement: Placement,
  visible: boolean, yOffset = 0, padding = 0,
) {
  if (visible) {
    const [x, y, z] = boxCenter(placement)
    const [length, height, width] = boxSize(placement)
    dummy.position.set(x, y + yOffset, z)
    dummy.scale.set(length + padding * 2, height + padding * 2, width + padding * 2)
  } else {
    dummy.position.set(0, 0, 0)
    dummy.scale.set(0, 0, 0)
  }
  dummy.updateMatrix()
  mesh.setMatrixAt(index, dummy.matrix)
  mesh.instanceMatrix.addUpdateRange(index * 16, 16)
  mesh.instanceMatrix.needsUpdate = true
}

/**
 * Frustum culling is disabled, but raycast still checks the mesh sphere.
 * Cover all effective boxes AND their drop path, including future cargo.
 * Rebuild only on geometry changes; step/slice/spring never scan bounds.
 */
export function cargoBounds(placements: readonly Placement[]): Sphere {
  const bounds = new Box3()
  for (const p of placements) {
    bounds.expandByPoint(corner.set(
      p.position.x * MM - HULL_PADDING,
      p.position.z * MM - HULL_PADDING,
      p.position.y * MM - HULL_PADDING,
    ))
    bounds.expandByPoint(corner.set(
      (p.position.x + p.lengthMm) * MM + HULL_PADDING,
      (p.position.z + p.heightMm) * MM + DROP_HEIGHT + HULL_PADDING,
      (p.position.y + p.widthMm) * MM + HULL_PADDING,
    ))
  }
  return placements.length ? bounds.getBoundingSphere(new Sphere()) : new Sphere(new Vector3(), 0)
}
