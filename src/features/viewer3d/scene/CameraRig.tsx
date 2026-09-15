import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { PerspectiveCamera, Vector3 } from 'three'
import { useEffect, useRef, type ComponentRef } from 'react'
import type { CameraPreset } from '@/types/load-plan'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import type { VehicleConfig } from '@/domain/models'
import { boxCenter, containerCenter, SCENE_SCALE, type Vec3 } from './units'

/**
 * Điều khiển camera bằng camera-controls (qua drei). Gốc thế giới là tâm
 * thùng nên mọi preset đều nhìn về (0,0,0). Chuyển góc 500ms giảm tốc
 * (mục 8); bật "giảm chuyển động" thì nhảy thẳng.
 *
 * Lệnh camera không transition không phát sự kiện nào của camera-controls, nên
 * `frameloop="demand"` không tự vẽ lại: sau mỗi lệnh đổi camera phải gọi
 * `invalidate()` (LM-056). Có transition thì lời gọi này gộp vào cùng frame.
 */

const PRESET_POSITIONS: Record<CameraPreset, Vec3> = {
  'goc-cheo': [8.5, 5.2, 7],
  // Đủ cao để nhìn qua nóc cabin vào trong thùng.
  truoc: [-7.5, 6.5, 0.001],
  'cua-sau': [10.5, 2.5, 0.001],
  'ben-hong': [0.001, 3, 9.5],
  tren: [0.001, 11, 0.01],
}

/** smoothTime của SmoothDamp ≈ 60% thời gian tới đích → ~500ms */
const SMOOTH_TIME = 0.3

export function CameraRig({
  preset,
  reducedMotion,
  focus,
  vehicle,
  fit = false,
  vehicleDecoration = false,
  onUserControl,
}: {
  preset: CameraPreset
  reducedMotion: boolean
  focus?: { placement: ScenePlacement; request: number; follow?: boolean } | null
  vehicle?: VehicleConfig
  fit?: boolean
  vehicleDecoration?: boolean
  onUserControl?: () => void
}) {
  const controlsRef = useRef<ComponentRef<typeof CameraControls>>(null)
  const applied = useRef<{ preset: CameraPreset; vehicle?: VehicleConfig } | null>(null)
  const size = useThree((state) => state.size)
  const camera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)
  const beforeFocus = useRef<{ position: Vector3; target: Vector3 } | null>(null)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || !size.width || !size.height) return
    // Responsive panels can resize the Canvas mid-orbit. Keep the user's pose;
    // only an explicit preset or a new vehicle requests a fresh framing.
    if (applied.current?.preset === preset && applied.current.vehicle === vehicle) return
    applied.current = { preset, vehicle }
    beforeFocus.current = null
    let [x, y, z] = PRESET_POSITIONS[preset]
    if (fit && vehicle && camera instanceof PerspectiveCamera) {
      const center = containerCenter(vehicle)
      const vfov = camera.fov * Math.PI / 180
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * size.width / Math.max(1, size.height))
      const direction = new Vector3(x, y, z).normalize()
      const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize()
      const up = new Vector3().crossVectors(direction, right).normalize()
      // Fit projected corners at the existing angle, not a length-dominated sphere.
      // This keeps a rear-door view readable on phones without fitToBox rotating it.
      let distance = 3
      const point = new Vector3()
      for (const px of [vehicleDecoration ? -1.85 : 0, center[0] * 2 + 1.2]) {
        for (const py of [vehicleDecoration ? -1.15 : 0, center[1] * 2 + 0.2]) {
          for (const pz of [-0.45, center[2] * 2 + 0.45]) {
            point.set(px - center[0], py - center[1], pz - center[2])
            const depth = point.dot(direction)
            distance = Math.max(distance, depth + Math.abs(point.dot(right)) * 1.16 / Math.tan(hfov / 2),
              depth + Math.abs(point.dot(up)) * 1.16 / Math.tan(vfov / 2))
          }
        }
      }
      const scale = distance / Math.hypot(x, y, z)
      x *= scale; y *= scale; z *= scale
    }
    void controls.setLookAt(x, y, z, 0, 0, 0, !reducedMotion)
    invalidate()
  }, [preset, reducedMotion, vehicle, fit, vehicleDecoration, size.width, size.height, camera, invalidate])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || !vehicle) return
    if (!focus) {
      const saved = beforeFocus.current
      beforeFocus.current = null
      if (saved) {
        void controls.setLookAt(saved.position.x, saved.position.y, saved.position.z, saved.target.x, saved.target.y, saved.target.z, !reducedMotion)
        invalidate()
      }
      return
    }
    const center = containerCenter(vehicle)
    const target = boxCenter(focus.placement).map((value, i) => value - center[i]!) as Vec3
    if (!beforeFocus.current) beforeFocus.current = { position: controls.getPosition(new Vector3()), target: controls.getTarget(new Vector3()) }
    // Keep orientation, with a contextual dolly rather than fitToBox's automatic rotation.
    void controls.moveTo(...target, !reducedMotion)
    const diagonal = Math.hypot(focus.placement.lengthCm, focus.placement.widthCm, focus.placement.heightCm) * SCENE_SCALE
    void controls.dollyTo(focus.follow ? Math.max(6, diagonal * 3) : Math.max(3, Math.min(6, diagonal * 3)), !reducedMotion)
    invalidate()
  }, [focus, vehicle, reducedMotion, invalidate])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const controls = controlsRef.current, saved = beforeFocus.current
      if (event.key !== 'Escape' || !controls?.enabled || !saved || (event.target instanceof Element && event.target.closest('[role="dialog"]'))) return
      beforeFocus.current = null
      onUserControl?.()
      void controls.setLookAt(saved.position.x, saved.position.y, saved.position.z, saved.target.x, saved.target.y, saved.target.z, !reducedMotion)
      invalidate()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onUserControl, reducedMotion, invalidate])

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      onControlStart={onUserControl}
      smoothTime={reducedMotion ? 0.05 : SMOOTH_TIME}
      minDistance={3}
      maxDistance={80}
      minPolarAngle={0.02}
      maxPolarAngle={Math.PI / 2 - 0.03}
      dollySpeed={0.6}
    />
  )
}
