import { CameraControls } from '@react-three/drei'
import { useEffect, useRef, type ComponentRef } from 'react'
import type { CameraPreset } from '@/types/load-plan'
import type { Vec3 } from './units'

/**
 * Điều khiển camera bằng camera-controls (qua drei). Gốc thế giới là tâm
 * thùng nên mọi preset đều nhìn về (0,0,0). Chuyển góc 500ms giảm tốc
 * (mục 8); bật "giảm chuyển động" thì nhảy thẳng.
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
}: {
  preset: CameraPreset
  reducedMotion: boolean
}) {
  const controlsRef = useRef<ComponentRef<typeof CameraControls>>(null)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const [x, y, z] = PRESET_POSITIONS[preset]
    void controls.setLookAt(x, y, z, 0, 0, 0, !reducedMotion)
  }, [preset, reducedMotion])

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      smoothTime={reducedMotion ? 0.05 : SMOOTH_TIME}
      minDistance={3}
      maxDistance={26}
      minPolarAngle={0.02}
      maxPolarAngle={Math.PI / 2 - 0.03}
      dollySpeed={0.6}
    />
  )
}
