import { useLayoutEffect, useMemo, useRef } from 'react'
import { InstancedMesh, Object3D } from 'three'
import type { VehicleSpec } from '@/types/load-plan'
import type { SceneMaterials } from './materials'
import { containerSize } from './units'

/**
 * Đầu kéo, khung gầm, bánh xe và mặt đất nhận bóng.
 * Sáu bánh dùng một InstancedMesh — thêm đúng một draw call.
 */

const CAB_LENGTH = 1.5
const CAB_GAP = 0.25
const CAB_FLOOR = 0.35
const CAB_HEIGHT = 1.95
const WHEEL_RADIUS = 0.5
const WHEEL_WIDTH = 0.32
const CHASSIS_HEIGHT = 0.3
/** Mặt đất nằm dưới đáy bánh xe */
const GROUND_Y = -(CHASSIS_HEIGHT + WHEEL_RADIUS * 2 - 0.2)

const dummy = new Object3D()

export function TruckCab({
  vehicle,
  materials,
}: {
  vehicle: VehicleSpec
  materials: SceneMaterials
}) {
  const { length: L, width: W } = containerSize(vehicle)
  const wheelsRef = useRef<InstancedMesh>(null)

  const cabX = -CAB_GAP - CAB_LENGTH / 2
  const wheelY = -CHASSIS_HEIGHT - WHEEL_RADIUS + 0.2

  const wheelPositions = useMemo(
    () => [
      [cabX, wheelY, 0.22],
      [cabX, wheelY, W - 0.22],
      [L * 0.72, wheelY, 0.2],
      [L * 0.72, wheelY, W - 0.2],
      [L * 0.72 + 1.15, wheelY, 0.2],
      [L * 0.72 + 1.15, wheelY, W - 0.2],
    ],
    [cabX, wheelY, L, W],
  )

  useLayoutEffect(() => {
    const mesh = wheelsRef.current
    if (!mesh) return
    wheelPositions.forEach(([x, y, z], i) => {
      dummy.position.set(x ?? 0, y ?? 0, z ?? 0)
      dummy.rotation.set(Math.PI / 2, 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [wheelPositions])

  return (
    <group>
      {/* Cabin */}
      <mesh position={[cabX, CAB_FLOOR + CAB_HEIGHT / 2, W / 2]} castShadow>
        <boxGeometry args={[CAB_LENGTH, CAB_HEIGHT, W - 0.1]} />
        <meshStandardMaterial color={materials.cab} roughness={0.6} metalness={0.15} />
      </mesh>

      {/* Kính chắn gió phía trước cabin */}
      <mesh position={[cabX - CAB_LENGTH / 2 - 0.005, CAB_FLOOR + 1.45, W / 2]}>
        <boxGeometry args={[0.01, 0.7, W - 0.5]} />
        <meshStandardMaterial
          color={materials.windshield}
          transparent
          opacity={0.55}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Khung gầm chạy suốt từ cabin tới đuôi */}
      <mesh
        position={[(L + 0.1 - (cabX - CAB_LENGTH / 2)) / 2 + (cabX - CAB_LENGTH / 2), -CHASSIS_HEIGHT / 2, W / 2]}
        castShadow
      >
        <boxGeometry args={[L + 0.1 - (cabX - CAB_LENGTH / 2), CHASSIS_HEIGHT, W - 0.6]} />
        <meshStandardMaterial color={materials.chassis} roughness={0.9} />
      </mesh>

      {/* Sáu bánh xe */}
      <instancedMesh ref={wheelsRef} args={[undefined, undefined, wheelPositions.length]} castShadow>
        <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 24]} />
        <meshStandardMaterial color={materials.wheel} roughness={0.95} />
      </instancedMesh>

      {/* Mặt đất chỉ hiện bóng đổ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[L / 2, GROUND_Y, W / 2]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial transparent opacity={0.45} />
      </mesh>
    </group>
  )
}
