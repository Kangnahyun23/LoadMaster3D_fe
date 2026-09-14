import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { ExtrudeGeometry, InstancedMesh, Object3D, Shape } from 'three'
import type { VehicleSpec } from '@/types/load-plan'
import type { SceneMaterials } from './materials'
import { containerSize } from './units'
import { truckDetails, truckWheel } from './truck-geometry'

const cabX = -1

/** Cosmetic vehicle representation. Wheel locations are not authoritative axle data. */
export function TruckCab({ vehicle, materials, shadows }: {
  vehicle: VehicleSpec; materials: SceneMaterials; shadows: boolean
}) {
  const { length: L, width: W } = containerSize(vehicle)
  const wheels = useRef<InstancedMesh>(null)
  const detail = useMemo(() => truckDetails(L, W, cabX, materials), [L, W, materials])
  const wheel = useMemo(() => truckWheel(materials), [materials])
  const body = useMemo(() => {
    const profile = new Shape()
    profile.moveTo(-0.75, 0.35); profile.lineTo(0.75, 0.35)
    profile.lineTo(0.75, 2.3); profile.lineTo(-0.46, 2.3)
    profile.lineTo(-0.75, 1.35); profile.closePath()
    return new ExtrudeGeometry(profile, { depth: W - 0.12, bevelEnabled: true, bevelSegments: 1,
      steps: 1, bevelSize: 0.04, bevelThickness: 0.025 }).translate(cabX, 0, 0.06)
  }, [W])
  useLayoutEffect(() => {
    if (!wheels.current) return
    const dummy = new Object3D()
    let i = 0
    for (const x of [cabX, L * 0.72, L * 0.72 + 1.15]) for (const z of [0.2, W - 0.2]) {
      dummy.position.set(x, -0.6, z); dummy.rotation.set(Math.PI / 2, 0, 0); dummy.updateMatrix()
      wheels.current.setMatrixAt(i++, dummy.matrix)
    }
    wheels.current.instanceMatrix.needsUpdate = true
    wheels.current.computeBoundingSphere()
  }, [L, W])
  useEffect(() => () => { detail.dispose(); wheel.dispose(); body.dispose() }, [detail, wheel, body])
  return <group name="vehicle-decoration">
    <mesh geometry={body} castShadow={shadows}>
      <meshStandardMaterial color={materials.cab} roughness={0.45} metalness={0.18} />
    </mesh>
    <mesh position={[cabX - 0.616, 1.8, W / 2]} rotation={[0, 0, -0.297]}>
      <boxGeometry args={[0.018, 0.78, W - 0.45]} />
      <meshStandardMaterial color={materials.windshield} roughness={0.18} metalness={0.45} />
    </mesh>
    <mesh position={[(L - 1.75) / 2, -0.15, W / 2]} castShadow={shadows}>
      <boxGeometry args={[L + 1.85, 0.3, W - 0.6]} />
      <meshStandardMaterial color={materials.chassis} roughness={0.9} />
    </mesh>
    <mesh name="vehicle-details" geometry={detail} castShadow={shadows}>
      <meshStandardMaterial vertexColors roughness={0.56} metalness={0.3} />
    </mesh>
    <instancedMesh name="vehicle-wheels" ref={wheels} args={[wheel, undefined, 6]} castShadow={shadows}>
      <meshStandardMaterial vertexColors roughness={0.78} metalness={0.12} />
    </instancedMesh>
    {shadows ? <mesh rotation={[-Math.PI / 2, 0, 0]} position={[L / 2, -1.11, W / 2]} receiveShadow>
      <planeGeometry args={[60, 60]} /><shadowMaterial transparent opacity={0.2} />
    </mesh> : null}
  </group>
}
