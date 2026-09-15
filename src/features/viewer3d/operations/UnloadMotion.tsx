import { easings, useSpring } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { Mesh, MeshStandardMaterial } from 'three'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import type { VehicleConfig } from '@/domain/models'
import { stopColor } from '@/lib/stops'
import { readToken } from '@/lib/tokens'
import { boxCenter, boxSize, SCENE_SCALE } from '../scene/units'
import type { AnimationQuality } from '../usePerformanceFlags'
import { potentialBlockers } from './operations-model'

export type UnloadMotionStep = { placement: ScenePlacement | undefined; cursor: number; durationMs: number }

/** One temporary visual for a completed step; never a draggable/pickable placement.
 * A blocked corridor fades in place, so animation cannot imply proven accessibility.
 */
export function UnloadMotion({ motion, remaining, vehicle, quality, reducedMotion }: {
  motion: UnloadMotionStep; remaining: readonly ScenePlacement[]; vehicle: VehicleConfig
  quality: AnimationQuality; reducedMotion: boolean
}) {
  const mesh = useRef<Mesh>(null), material = useRef<MeshStandardMaterial>(null)
  const previous = useRef({ cursor: motion.cursor, quality, reducedMotion })
  const active = useRef<{ x: number; distance: number } | null>(null)
  const invalidate = useThree((s) => s.invalidate)
  const [spring, api] = useSpring(() => ({ t: 1 }))
  useLayoutEffect(() => {
    const before = previous.current
    if (before.cursor === motion.cursor && before.quality === quality && before.reducedMotion === reducedMotion) return
    previous.current = { cursor: motion.cursor, quality, reducedMotion }
    api.stop(); active.current = null
    if (!mesh.current || !material.current) return
    mesh.current.visible = false
    const p = motion.placement
    if (!p || motion.cursor !== before.cursor + 1 || (quality === 'none' && !reducedMotion)) { invalidate(); return }
    const blocked = potentialBlockers(p, remaining, vehicle).length > 0
    const [x, y, z] = boxCenter(p)
    mesh.current.position.set(x, y, z); mesh.current.scale.set(...boxSize(p)); mesh.current.visible = true
    material.current.color.set(blocked ? readToken('--warning') : stopColor(p.stop))
    material.current.opacity = 0.85
    const distance = reducedMotion || blocked ? 0 : quality === 'full'
      ? (vehicle.innerLengthCm + p.lengthCm) * SCENE_SCALE - x : 0.35
    active.current = { x, distance }
    void api.start({ from: { t: 0 }, to: { t: 1 },
      config: { duration: reducedMotion ? 100 : motion.durationMs, easing: easings.easeInOutCubic } })
    invalidate()
  }, [motion, remaining, vehicle, quality, reducedMotion, api, invalidate])
  useFrame(() => {
    if (!active.current || !mesh.current || !material.current) return
    const t = spring.t.get()
    mesh.current.position.x = active.current.x + active.current.distance * t
    material.current.opacity = 0.85 * (1 - t * t)
    if (t >= 1) { mesh.current.visible = false; active.current = null }
    else invalidate()
  })
  return <mesh name="unloading-motion" ref={mesh} visible={false} raycast={() => null}>
    <boxGeometry /><meshStandardMaterial ref={material} transparent depthWrite={false} roughness={0.8} />
  </mesh>
}
