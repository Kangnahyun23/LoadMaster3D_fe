import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import { readToken } from '@/lib/tokens'
import type { VehicleSpec } from '@/types/load-plan'
import { MM, type Vec3 } from '../scene/units'
import { EDITOR_RULES } from './geometry'

/** Major grid every ten snap cells: a single draw, readable at container scale. */
export function EditorFloorGrid({ vehicle }: { vehicle: VehicleSpec }) {
  const points = useMemo(() => {
    const vertices: number[] = []
    const length = vehicle.innerLengthMm * MM, width = vehicle.innerWidthMm * MM
    const spacing = EDITOR_RULES.gridMm * 10 * MM
    for (let x = 0; x <= length; x += spacing) vertices.push(x, 0.003, 0, x, 0.003, width)
    for (let z = 0; z <= width; z += spacing) vertices.push(0, 0.003, z, length, 0.003, z)
    return new Float32Array(vertices)
  }, [vehicle])
  return <lineSegments raycast={() => null}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry>
    <lineBasicMaterial color={readToken('--bg')} transparent opacity={0.22} depthWrite={false} />
  </lineSegments>
}

const AXIS_ENDPOINTS: { label: string; position: Vec3 }[] = [
  { label: 'X', position: [0.6, 0, 0] }, { label: 'Y', position: [0, 0, 0.6] }, { label: 'Z', position: [0, 0.6, 0] },
]
const AXIS_POINTS = new Float32Array(AXIS_ENDPOINTS.flatMap(({ position }) => [0, 0, 0, ...position]))

/** One selected set of guides, independent of cargo count. Labels identify axes without color coding. */
export function EditorAxes() {
  return <group>
    <lineSegments raycast={() => null}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[AXIS_POINTS, 3]} /></bufferGeometry>
      <lineBasicMaterial color={readToken('--bg')} />
    </lineSegments>
    {AXIS_ENDPOINTS.map(({ label, position }) => <Html key={label} position={position} zIndexRange={[19, 0]} style={{ pointerEvents: 'none' }}>
      <span className="block -translate-x-1/2 -translate-y-1/2 rounded-sm border border-border-dark bg-panel-dark px-2 py-1 font-mono text-body text-bg">{label}</span>
    </Html>)}
  </group>
}
