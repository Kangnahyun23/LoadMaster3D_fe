import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
import { createColorContext } from './colors'
import { CameraRig } from './scene/CameraRig'
import { CargoInstances } from './scene/CargoInstances'
import { Container } from './scene/Container'
import { sceneMaterials } from './scene/materials'
import { PerfProbe, type PerfSample } from './scene/PerfProbe'
import { SceneLighting } from './scene/SceneLighting'
import { SelectionLabel } from './scene/SelectionLabel'
import { TruckCab } from './scene/TruckCab'
import { containerCenter } from './scene/units'
import type { LoadPlan } from '@/types/load-plan'
import type { LoadPlanViewerState } from './useLoadPlanViewer'
import type { PerformanceFlags } from './usePerformanceFlags'

/**
 * Canvas Three.js của màn xem phương án. Nền trong suốt để gradient tối
 * của khung bao (CSS) lộ ra — vùng 3D luôn tối (mục 7).
 * Cả scene được dời sao cho tâm thùng nằm ở gốc thế giới: đèn và camera
 * đều quy về (0,0,0), không cần tính lại khi đổi xe.
 */
export function LoadPlanViewer({
  plan,
  state,
  flags,
  onPerfSample,
}: {
  plan: LoadPlan
  state: LoadPlanViewerState
  flags: PerformanceFlags
  onPerfSample?: (sample: PerfSample) => void
}) {
  const materials = useMemo(() => sceneMaterials(), [])
  const colorContext = useMemo(() => createColorContext(plan), [plan])
  const [cx, cy, cz] = containerCenter(plan.vehicle)

  return (
    <Canvas
      dpr={flags.dpr}
      // 'percentage' = PCFShadowMap; PCFSoft đã bị three r186 gỡ bỏ.
      shadows={flags.shadows ? 'percentage' : false}
      // Không tone-mapping: giữ đúng sắc 8 màu điểm giao, không bị ACES kéo lệch.
      flat
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 38, near: 0.1, far: 120, position: [8.5, 5.2, 7] }}
      onPointerMissed={() => state.select(null)}
      style={{ position: 'absolute', inset: 0 }}
    >
      <SceneLighting shadows={flags.shadows} />
      <CameraRig preset={state.cameraPreset} reducedMotion={flags.reducedMotion} />

      <group position={[-cx, -cy, -cz]}>
        <Container vehicle={plan.vehicle} materials={materials} />
        <TruckCab vehicle={plan.vehicle} materials={materials} />
        <CargoInstances
          placements={state.placements}
          colorMode={state.colorMode}
          colorContext={colorContext}
          sliceMm={state.sliceMm}
          step={state.step}
          selectedId={state.selectedId}
          onSelect={state.select}
          outlines={flags.outlines}
          outlineColor={materials.outline}
          reducedMotion={flags.reducedMotion}
        />
        {state.selected ? <SelectionLabel placement={state.selected} /> : null}
      </group>

      {onPerfSample ? <PerfProbe onSample={onPerfSample} /> : null}
    </Canvas>
  )
}
