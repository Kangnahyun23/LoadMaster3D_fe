import { Html } from '@react-three/drei'
import { Color, DoubleSide } from 'three'
import { useMemo } from 'react'
import { readToken } from '@/lib/tokens'
import { stopColor } from '@/lib/stops'
import type { Placement, VehicleSpec } from '@/types/load-plan'
import { cargoCenterOfMass, stopDistribution } from './operations-model'
import { MM } from '../scene/units'

export function RearDoorCue({ vehicle }: { vehicle: VehicleSpec }) {
  const x = vehicle.innerLengthMm * MM, z = vehicle.innerWidthMm * MM / 2
  const points = useMemo(() => new Float32Array([
    x, 0.03, z, x + 0.9, 0.03, z,
    x + 0.9, 0.03, z, x + 0.65, 0.03, z - 0.15,
    x + 0.9, 0.03, z, x + 0.65, 0.03, z + 0.15,
  ]), [x, z])
  return <group>
    <lineSegments raycast={() => null}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry>
      <lineBasicMaterial color={readToken('--bg')} />
    </lineSegments>
    <Html position={[x + 0.7, 0.05, z]} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <span className="block -translate-x-1/2 rounded-sm bg-panel-dark px-2 py-1 text-body whitespace-nowrap text-bg">Cửa sau · Hướng dỡ</span>
    </Html>
  </group>
}

/** One colored mesh, even when stop placements are interleaved in every bin. */
export function StopRibbon({ placements, vehicle }: { placements: readonly Placement[]; vehicle: VehicleSpec }) {
  const buffers = useMemo(() => {
    const vertices: number[] = [], colors: number[] = [], color = new Color()
    const z = vehicle.innerWidthMm * MM + 0.12
    for (const bin of stopDistribution(placements, vehicle.innerLengthMm)) {
      let offset = 0
      for (const part of bin.portions) {
        const x1 = bin.fromMm * MM, x2 = bin.toMm * MM - 0.01
        const z1 = z + offset * 0.3, z2 = z + (offset + part.ratio) * 0.3
        vertices.push(x1, 0.01, z1, x2, 0.01, z1, x2, 0.01, z2, x1, 0.01, z1, x2, 0.01, z2, x1, 0.01, z2)
        color.set(stopColor(part.stop))
        for (let i = 0; i < 6; i++) colors.push(color.r, color.g, color.b)
        offset += part.ratio
      }
    }
    return { positions: new Float32Array(vertices), colors: new Float32Array(colors) }
  }, [placements, vehicle])
  return <mesh name="stop-distribution" raycast={() => null}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[buffers.positions, 3]} />
      <bufferAttribute attach="attributes-color" args={[buffers.colors, 3]} />
    </bufferGeometry>
    <meshBasicMaterial vertexColors side={DoubleSide} />
  </mesh>
}

export function CargoMassMarker({ placements }: { placements: readonly Placement[] }) {
  const mass = useMemo(() => cargoCenterOfMass(placements), [placements])
  const points = useMemo(() => new Float32Array([0, 0, 0, 0, (mass?.position.z ?? 0) * MM, 0]), [mass])
  if (!mass) return null
  const color = readToken('--highlight')
  return <group name="cargo-center-of-mass" position={[mass.position.x * MM, 0, mass.position.y * MM]}>
    <mesh position={[0, mass.position.z * MM, 0]} raycast={() => null}>
      <sphereGeometry args={[0.07, 12, 8]} /><meshBasicMaterial color={color} />
    </mesh>
    <lineSegments raycast={() => null}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry>
      <lineBasicMaterial color={color} />
    </lineSegments>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} raycast={() => null}>
      <ringGeometry args={[0.06, 0.09, 16]} /><meshBasicMaterial color={color} side={DoubleSide} />
    </mesh>
    <Html position={[0, mass.position.z * MM + 0.12, 0]} zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
      <span className="block -translate-x-1/2 rounded-sm bg-panel-dark px-2 py-1 text-body whitespace-nowrap text-bg">Tâm khối lượng hàng</span>
    </Html>
  </group>
}
