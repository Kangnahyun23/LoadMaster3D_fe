import { easings, useSpring } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useRef, type RefObject } from 'react'
import { DynamicDrawUsage, type InstancedMesh } from 'three'
import type { Placement } from '@/types/load-plan'
import type { AnimationQuality } from '../usePerformanceFlags'
import { cargoBounds, DROP_HEIGHT, HULL_PADDING, writeCargoMatrix } from './cargo-buffers'
import { cargoVisibility, sameGeometry, type InstanceLayout } from './instance-layout'
import type { SceneSemantics } from '../operations/scene-semantics'

export type CargoMeshes = {
  opaque: RefObject<InstancedMesh | null>
  dim: RefObject<InstancedMesh | null>
  hull: RefObject<InstancedMesh | null>
}
type CachedSlot = { placement: Placement; visibility: ReturnType<typeof cargoVisibility>; hullVisible: boolean }
const DROP_DURATION_MS = 500
const REDUCED_DROP_HEIGHT = 0.16

/** Keep high frequency spring writes outside React. Only changed GPU slots upload. */
export function useCargoMatrices({
  meshes, layout, placements, step, sliceMm, outlines, reducedMotion, animationQuality, hiddenId, semantics,
}: {
  meshes: CargoMeshes
  layout: InstanceLayout
  placements: readonly Placement[]
  step: number
  sliceMm: number
  outlines: boolean
  reducedMotion: boolean
  animationQuality: AnimationQuality
  hiddenId?: string | null
  semantics?: SceneSemantics
}) {
  const invalidate = useThree((state) => state.invalidate)
  const cache = useRef<CachedSlot[]>([])
  const previousMeshes = useRef<Array<InstancedMesh | null>>([])
  const previousStep = useRef(step)
  const animation = useRef<{ id: string; height: number } | null>(null)
  const [spring, api] = useSpring(() => ({ t: 1 }))

  useLayoutEffect(() => {
    const opaque = meshes.opaque.current
    const dim = meshes.dim.current
    const hull = meshes.hull.current
    if (!opaque || !dim) return
    const currentMeshes = [opaque, dim, hull]
    const recreated = currentMeshes.some((mesh, index) => mesh !== previousMeshes.current[index])
    const interruptedId = animation.current?.id
    animation.current = null
    api.stop()
    api.set({ t: 1 })
    let geometryChanged = recreated || cache.current.length !== placements.length

    const nextCache = layout.instanceToPlacementId.map((id, index): CachedSlot => {
      const placement = layout.placementById.get(id)!
      const semantic = semantics?.appearanceById.get(id)
      let visibility = semantic?.visibility ?? cargoVisibility(placement, step, sliceMm)
      if (id === hiddenId) visibility = 'hidden'
      else if (visibility === 'opaque' && placement.position.x + placement.lengthMm > sliceMm) visibility = 'dim'
      const hullVisible = visibility === 'opaque' && (outlines || semantic?.tone === 'blocker')
      const before = cache.current[index]
      const geometryDiffers = before?.placement.id !== id || !sameGeometry(before?.placement, placement)
      geometryChanged ||= geometryDiffers
      if (recreated || geometryDiffers || before?.visibility !== visibility || before?.hullVisible !== hullVisible || interruptedId === id) {
        writeCargoMatrix(opaque, index, placement, visibility === 'opaque')
        writeCargoMatrix(dim, index, placement, visibility === 'dim')
        if (hull) writeCargoMatrix(hull, index, placement, hullVisible, 0, HULL_PADDING)
      }
      return { placement, visibility, hullVisible }
    })
    if (geometryChanged) {
      const bounds = cargoBounds(placements)
      for (const mesh of currentMeshes) {
        if (!mesh) continue
        mesh.boundingSphere = bounds
        mesh.instanceMatrix.setUsage(DynamicDrawUsage)
      }
    }
    cache.current = nextCache
    previousMeshes.current = currentMeshes

    // Restore the interrupted box before starting another. Scrubs never leave
    // a floating instance, even when 4× playback interrupts a 500ms spring.
    if (step === previousStep.current + 1 && !reducedMotion && animationQuality !== 'none') {
      const placement = placements.find((p) => p.step === step)
      if (placement && placement.id !== hiddenId && (!semantics || semantics.appearanceById.get(placement.id)?.visibility === 'opaque')) {
        const height = animationQuality === 'full' ? DROP_HEIGHT : REDUCED_DROP_HEIGHT
        animation.current = { id: placement.id, height }
        const index = layout.placementIdToInstance.get(placement.id)!
        const beyond = cargoVisibility(placement, step, sliceMm) === 'dim'
        writeCargoMatrix(beyond ? dim : opaque, index, placement, true, height)
        if (hull && !beyond && outlines) writeCargoMatrix(hull, index, placement, true, height, HULL_PADDING)
        invalidate()
        void api.start({
          from: { t: 0 }, to: { t: 1 },
          config: { duration: DROP_DURATION_MS, easing: easings.easeOutCubic },
        })
      }
    }
    previousStep.current = step
    invalidate()
  }, [meshes, layout, placements, step, sliceMm, outlines, reducedMotion, animationQuality, hiddenId, semantics, api, invalidate])

  useFrame(() => {
    const active = animation.current
    if (!active) return
    const placement = layout.placementById.get(active.id)
    const index = layout.placementIdToInstance.get(active.id)
    const opaque = meshes.opaque.current
    const dim = meshes.dim.current
    if (!placement || index === undefined || !opaque || !dim) {
      animation.current = null
      return
    }
    const t = spring.t.get()
    const offset = (1 - t) * active.height
    const beyond = cargoVisibility(placement, step, sliceMm) === 'dim'
    writeCargoMatrix(beyond ? dim : opaque, index, placement, true, offset)
    if (meshes.hull.current && !beyond && outlines) {
      writeCargoMatrix(meshes.hull.current, index, placement, true, offset, HULL_PADDING)
    }
    if (t >= 1) animation.current = null
    else invalidate()
  })
}
