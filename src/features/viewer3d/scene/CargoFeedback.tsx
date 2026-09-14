import { Line } from '@react-three/drei'
import { animated, useSpring } from '@react-spring/three'
import { useThree } from '@react-three/fiber'
import { readToken } from '@/lib/tokens'
import type { Placement } from '@/types/load-plan'
import { boxCenter, boxSize, type Vec3 } from './units'
import { SelectionLabel } from './SelectionLabel'

const AnimatedLine = animated(Line)
const EDGES: Vec3[] = []
for (const x of [-0.5, 0.5]) for (const y of [-0.5, 0.5]) EDGES.push([x, y, -0.5], [x, y, 0.5])
for (const x of [-0.5, 0.5]) for (const z of [-0.5, 0.5]) EDGES.push([x, -0.5, z], [x, 0.5, z])
for (const y of [-0.5, 0.5]) for (const z of [-0.5, 0.5]) EDGES.push([-0.5, y, z], [0.5, y, z])

/** A bounded set of semantic outlines, never one React object for every cargo. */
export function CargoFeedback({ placement, role, reducedMotion, xray = false }: {
  placement: Placement; role: 'selected' | 'current' | 'next' | 'hover'; reducedMotion: boolean; xray?: boolean
}) {
  const invalidate = useThree((s) => s.invalidate)
  const spring = useSpring({ from: { opacity: 0.35 }, opacity: 1, config: { duration: reducedMotion ? 100 : 180 }, onChange: () => invalidate() })
  const color = readToken(role === 'next' ? '--info' : role === 'current' ? '--highlight' : '--bg')
  const size = boxSize(placement).map((v) => v + 0.008) as Vec3
  return <group name={`feedback-${role}`}>
    <AnimatedLine points={EDGES} segments position={boxCenter(placement)} scale={size} color={color}
      lineWidth={role === 'hover' ? 1.5 : 2.5} transparent opacity={spring.opacity} raycast={() => null} />
    {xray ? <Line points={EDGES} segments position={boxCenter(placement)} scale={size} color={color}
      lineWidth={1} transparent opacity={0.3} depthTest={false} depthWrite={false} raycast={() => null} /> : null}
    {role !== 'hover' ? <SelectionLabel placement={placement} role={role} /> : null}
  </group>
}
