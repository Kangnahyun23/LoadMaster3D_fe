import { Line } from '@react-three/drei'
import { DoubleSide } from 'three'
import type { VehicleSpec } from '@/types/load-plan'
import type { SceneMaterials } from './materials'
import { containerSize, type Vec3 } from './units'

/**
 * Thùng xe: sàn, ba vách, gờ thấp hai bên, viền nóc đứt nét và hai cánh cửa
 * sau mở ~110°. Vách dùng mặt đơn với pháp tuyến hướng vào trong nên vách
 * gần camera tự biến mất — nhìn từ góc nào cũng thấy hàng bên trong.
 */

const DOOR_ANGLE = (110 * Math.PI) / 180
const DOOR_THICKNESS = 0.03
const SKIRT_HEIGHT = 0.28
const EDGE_COLOR = '#ffffff'

export function Container({
  vehicle,
  materials,
}: {
  vehicle: VehicleSpec
  materials: SceneMaterials
}) {
  const { length: L, height: H, width: W } = containerSize(vehicle)

  const roofRectangle: Vec3[] = [
    [0, H, 0],
    [L, H, 0],
    [L, H, W],
    [0, H, W],
    [0, H, 0],
  ]
  const verticalEdges: Vec3[] = [
    [L, H, 0], [L, 0, 0],
    [L, H, W], [L, 0, W],
    [0, H, W], [0, 0, W],
    [0, H, 0], [0, 0, 0],
  ]

  return (
    <group>
      {/* Sàn — pháp tuyến hướng lên */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[L / 2, 0, W / 2]} receiveShadow>
        <planeGeometry args={[L, W]} />
        <meshStandardMaterial color={materials.floor} roughness={0.92} metalness={0.05} />
      </mesh>

      {/* Vách trước x=0 — pháp tuyến +X */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[0, H / 2, W / 2]} receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={materials.wall} roughness={0.9} />
      </mesh>

      {/* Vách trái z=0 — pháp tuyến +Z */}
      <mesh position={[L / 2, H / 2, 0]} receiveShadow>
        <planeGeometry args={[L, H]} />
        <meshStandardMaterial color={materials.wall} roughness={0.9} />
      </mesh>

      {/* Vách phải z=W — pháp tuyến −Z */}
      <mesh rotation={[0, Math.PI, 0]} position={[L / 2, H / 2, W]} receiveShadow>
        <planeGeometry args={[L, H]} />
        <meshStandardMaterial color={materials.wall} roughness={0.9} />
      </mesh>

      {/* Gờ thấp hai bên và ngưỡng cửa — nhìn thấy từ mọi phía để định hình thùng */}
      <mesh position={[L / 2, SKIRT_HEIGHT / 2, 0]}>
        <boxGeometry args={[L, SKIRT_HEIGHT, DOOR_THICKNESS]} />
        <meshStandardMaterial color={materials.skirt} side={DoubleSide} />
      </mesh>
      <mesh position={[L / 2, SKIRT_HEIGHT / 2, W]}>
        <boxGeometry args={[L, SKIRT_HEIGHT, DOOR_THICKNESS]} />
        <meshStandardMaterial color={materials.skirt} side={DoubleSide} />
      </mesh>
      <mesh position={[L, 0.03, W / 2]}>
        <boxGeometry args={[DOOR_THICKNESS, 0.06, W]} />
        <meshStandardMaterial color={materials.skirt} />
      </mesh>

      {/* Viền nóc và cạnh đứng đứt nét */}
      <Line points={roofRectangle} color={EDGE_COLOR} transparent opacity={0.28} lineWidth={1} dashed dashSize={0.08} gapSize={0.06} />
      <Line points={verticalEdges} segments color={EDGE_COLOR} transparent opacity={0.22} lineWidth={1} dashed dashSize={0.08} gapSize={0.06} />

      {/* Cửa sau, bản lề tại hai góc, mở ra ngoài */}
      <group position={[L, 0, 0]} rotation={[0, DOOR_ANGLE, 0]}>
        <mesh position={[DOOR_THICKNESS / 2, H / 2, W / 4]} castShadow>
          <boxGeometry args={[DOOR_THICKNESS, H, W / 2]} />
          <meshStandardMaterial color={materials.wall} roughness={0.85} />
        </mesh>
      </group>
      <group position={[L, 0, W]} rotation={[0, -DOOR_ANGLE, 0]}>
        <mesh position={[DOOR_THICKNESS / 2, H / 2, -W / 4]} castShadow>
          <boxGeometry args={[DOOR_THICKNESS, H, W / 2]} />
          <meshStandardMaterial color={materials.wall} roughness={0.85} />
        </mesh>
      </group>
    </group>
  )
}
