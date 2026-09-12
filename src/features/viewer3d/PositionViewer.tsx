import { CameraControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentRef } from 'react'
import {
  BoxGeometry,
  Color,
  EdgesGeometry,
  InstancedMesh,
  Object3D,
  PerspectiveCamera,
} from 'three'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { readToken } from '@/lib/tokens'
import type { CameraPreset, Placement, VehicleSpec } from '@/types/load-plan'
import { Container } from './scene/Container'
import { sceneMaterials } from './scene/materials'
import { SceneLighting } from './scene/SceneLighting'
import { boxCenter, boxSize, containerCenter, containerSize } from './scene/units'
import { usePerformanceFlags } from './usePerformanceFlags'

/**
 * Ô "Vị trí trong thùng xe" của màn máy tính bảng kho — xoay được bằng tay.
 *
 * Khác với màn xem phương án đầy đủ: không có cabin, không cắt lớp, không
 * chọn kiện. Kiện đã xếp để màu xám trầm, kiện đang xếp màu `--highlight`
 * kèm viền vẽ đè lên mọi thứ (depthTest tắt) nên dù bị vùi giữa đống hàng
 * vẫn thấy rõ vị trí.
 */

const PRESETS: ReadonlyArray<{ value: CameraPreset; label: string }> = [
  { value: 'goc-cheo', label: 'Góc chéo' },
  { value: 'tren', label: 'Trên' },
  { value: 'ben-hong', label: 'Bên hông' },
  { value: 'cua-sau', label: 'Cửa sau' },
]

/** Hướng nhìn của từng preset; khoảng cách do fitToBox tự tính. */
const DIRECTIONS: Record<CameraPreset, [number, number, number]> = {
  'goc-cheo': [1, 0.8, 0.95],
  tren: [0.001, 1, 0.04],
  'ben-hong': [0.001, 0.3, 1],
  'cua-sau': [1, 0.3, 0.04],
  truoc: [-1, 0.5, 0.04],
}

const dummy = new Object3D()

export function PositionViewer({
  placements,
  current,
  vehicle,
}: {
  placements: Placement[]
  current: Placement
  vehicle: VehicleSpec
}) {
  const [preset, setPreset] = useState<CameraPreset>('goc-cheo')
  const flags = usePerformanceFlags()
  const materials = useMemo(() => sceneMaterials(), [])
  const [cx, cy, cz] = containerCenter(vehicle)

  const placed = useMemo(
    () => placements.filter((p) => p.step < current.step),
    [placements, current.step],
  )

  return (
    <div className="relative h-full overflow-hidden rounded-md bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)]">
      <Canvas
        dpr={flags.dpr}
        flat
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 40, near: 0.1, far: 120 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <SceneLighting shadows={false} />
        <PanelCameraRig preset={preset} vehicle={vehicle} reducedMotion={flags.reducedMotion} />

        <group position={[-cx, -cy, -cz]}>
          <Container vehicle={vehicle} materials={materials} />
          <PlacedCargo placements={placed} />
          <CurrentPackage placement={current} />
        </group>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
        <span className="text-body-lg font-medium text-white/70">Vị trí trong thùng xe</span>
        <span className="inline-flex items-center gap-1.5 text-body-lg font-medium text-highlight">
          <span aria-hidden className="size-2.5 rounded-xs bg-highlight shadow-[0_0_8px_var(--highlight)]" />
          Kiện này
        </span>
      </div>

      {/* Lớp phủ không chặn thao tác kéo; chỉ riêng nhóm nút nhận sự kiện. */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-col items-center gap-2">
        <SegmentedControl
          className="pointer-events-auto"
          ariaLabel="Góc nhìn thùng xe"
          options={PRESETS}
          value={preset}
          onChange={setPreset}
        />
        <span className="text-caption text-white/45">Kéo để xoay · chụm hai ngón để phóng to</span>
      </div>
    </div>
  )
}

/** Chừa mép quanh thùng xe để không dính sát viền panel. */
const FIT_MARGIN = 1.12

/**
 * Camera cho panel hẹp. Tự tính khoảng cách sao cho cả thùng xe vừa khung
 * theo đúng tỉ lệ của panel, rồi mới đặt hướng nhìn của preset.
 *
 * Không dùng `fitToBox` của camera-controls vì nó xoay camera về nhìn thẳng
 * vào mặt gần nhất, làm mất góc chéo.
 */
function PanelCameraRig({
  preset,
  vehicle,
  reducedMotion,
}: {
  preset: CameraPreset
  vehicle: VehicleSpec
  reducedMotion: boolean
}) {
  const controlsRef = useRef<ComponentRef<typeof CameraControls>>(null)
  const size = useThree((state) => state.size)
  const camera = useThree((state) => state.camera)

  /** Bán kính hình cầu bao quanh thùng xe. */
  const radius = useMemo(() => {
    const { length, height, width } = containerSize(vehicle)
    return Math.hypot(length, height, width) / 2
  }, [vehicle])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || !(camera instanceof PerspectiveCamera)) return

    const verticalFov = (camera.fov * Math.PI) / 180
    const aspect = size.width / size.height
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect)
    // Lấy trục nào chật hơn làm chuẩn, thường là trục ngang với panel cao hẹp.
    const distance =
      Math.max(
        radius / Math.sin(verticalFov / 2),
        radius / Math.sin(horizontalFov / 2),
      ) * FIT_MARGIN

    const [dx, dy, dz] = DIRECTIONS[preset]
    const length = Math.hypot(dx, dy, dz)
    void controls.setLookAt(
      (dx / length) * distance,
      (dy / length) * distance,
      (dz / length) * distance,
      0,
      0,
      0,
      !reducedMotion,
    )
  }, [preset, radius, size.width, size.height, camera, reducedMotion])

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      smoothTime={reducedMotion ? 0.05 : 0.3}
      minDistance={2}
      maxDistance={60}
      minPolarAngle={0.02}
      maxPolarAngle={Math.PI / 2 - 0.03}
      dollySpeed={0.6}
    />
  )
}

/** Kiện đã xếp: một InstancedMesh, xám trầm để kiện đang xếp nổi lên. */
function PlacedCargo({ placements }: { placements: Placement[] }) {
  const meshRef = useRef<InstancedMesh>(null)
  const count = placements.length
  const color = useMemo(
    () => new Color(readToken('--text-3') || '#6b7280').multiplyScalar(1.25),
    [],
  )

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    placements.forEach((placement, index) => {
      const [x, y, z] = boxCenter(placement)
      const [l, h, w] = boxSize(placement)
      dummy.position.set(x, y, z)
      dummy.scale.set(l, h, w)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [placements])

  if (count === 0) return null

  return (
    <instancedMesh key={count} ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.02} />
    </instancedMesh>
  )
}

/** Kiện đang xếp: khối đặc màu nổi bật + viền luôn vẽ đè lên mọi thứ. */
function CurrentPackage({ placement }: { placement: Placement }) {
  const position = boxCenter(placement)
  const size = boxSize(placement)
  const highlight = readToken('--highlight') || '#facc15'
  const edges = useMemo(() => new EdgesGeometry(new BoxGeometry(1, 1, 1)), [])

  return (
    <group position={position} scale={size}>
      <mesh renderOrder={2}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={highlight}
          emissive={highlight}
          emissiveIntensity={0.4}
          roughness={0.5}
          toneMapped={false}
          depthTest={false}
        />
      </mesh>
      {/* depthTest tắt + renderOrder cao: thấy được cả khi bị hàng khác che */}
      <lineSegments geometry={edges} renderOrder={3}>
        <lineBasicMaterial color="#ffffff" depthTest={false} toneMapped={false} />
      </lineSegments>
    </group>
  )
}
