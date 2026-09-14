import { useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BackSide, BoxGeometry, EdgesGeometry, type InstancedMesh } from 'three'
import { readToken } from '@/lib/tokens'
import type { ColorMode, Placement } from '@/types/load-plan'
import type { ColorContext } from '../colors'
import { createInstanceLayout } from './instance-layout'
import { useCargoMatrices } from './useCargoMatrices'
import type { AnimationQuality } from '../usePerformanceFlags'
import { useCargoColors } from './useCargoColors'
import { boxCenter, boxSize } from './units'
import type { SceneSemantics } from '../operations/scene-semantics'
import { createCargoSurface } from './cargo-surface'

type Props = {
  placements: readonly Placement[]
  colorMode: ColorMode
  colorContext: ColorContext
  sliceMm: number
  step: number
  selectedId: string | null
  onSelect: (id: string | null) => void
  outlines: boolean
  outlineColor: string
  reducedMotion: boolean
  animationQuality?: AnimationQuality
  hiddenId?: string | null
  semantics?: SceneSemantics
  xraySelection?: boolean
  surfaceDetail?: boolean
}

/** Three cargo draws at most: solid, ghost, inverted hull. One selected outline. */
export function CargoInstances({
  placements, colorMode, colorContext, sliceMm, step, selectedId, onSelect,
  outlines, outlineColor, reducedMotion, animationQuality = 'full', hiddenId, semantics, xraySelection = false, surfaceDetail = false,
}: Props) {
  const opaque = useRef<InstancedMesh>(null)
  const dim = useRef<InstancedMesh>(null)
  const hull = useRef<InstancedMesh>(null)
  const meshes = useMemo(() => ({ opaque, dim, hull }), [])
  const layout = useMemo(() => createInstanceLayout(placements), [placements])
  const gl = useThree((state) => state.gl)
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), [])
  const edges = useMemo(() => new EdgesGeometry(geometry), [geometry])
  const surface = useMemo(() => surfaceDetail ? createCargoSurface() : null, [surfaceDetail])
  useEffect(() => () => surface?.dispose(), [surface])
  const selectionColor = readToken('--bg')
  const selected = selectedId && selectedId !== hiddenId ? layout.placementById.get(selectedId) : undefined
  const count = layout.instanceToPlacementId.length
  const showHull = outlines || Boolean(semantics?.blockers.length)

  useCargoMatrices({ meshes, layout, placements, step, sliceMm, outlines, reducedMotion, animationQuality, hiddenId, semantics })
  useCargoColors(meshes, layout, colorMode, colorContext, outlineColor, showHull, semantics)

  useEffect(() => () => {
    geometry.dispose()
    edges.dispose()
    gl.domElement.style.removeProperty('cursor')
  }, [geometry, edges, gl])

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const id = event.instanceId === undefined ? undefined : layout.instanceToPlacementId[event.instanceId]
    if (id) onSelect(id)
  }
  const handleOver = () => gl.domElement.style.setProperty('cursor', 'pointer')
  const handleOut = () => gl.domElement.style.removeProperty('cursor')

  return (
    <group>
      <instancedMesh
        name="cargo-opaque"
        key={`opaque-${count}`}
        ref={opaque}
        args={[undefined, undefined, count]}
        geometry={geometry}
        frustumCulled={false}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        {surfaceDetail ? <meshStandardMaterial map={surface} roughness={0.86} metalness={0.02} /> : <meshLambertMaterial />}
      </instancedMesh>
      <instancedMesh
        name="cargo-dim"
        key={`dim-${count}`}
        ref={dim}
        args={[undefined, undefined, count]}
        geometry={geometry}
        frustumCulled={false}
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        {surfaceDetail ? <meshStandardMaterial transparent opacity={0.22} depthWrite={false} roughness={0.9} />
          : <meshLambertMaterial transparent opacity={0.22} depthWrite={false} />}
      </instancedMesh>
      {showHull ? (
        <instancedMesh
          name="cargo-hull"
          key={`hull-${count}`}
          ref={hull}
          args={[undefined, undefined, count]}
          geometry={geometry}
          frustumCulled={false}
        >
          <meshBasicMaterial side={BackSide} toneMapped={false} />
        </instancedMesh>
      ) : null}
      {selected ? (
        <lineSegments
          position={boxCenter(selected)}
          scale={boxSize(selected).map((value) => value + 0.004) as [number, number, number]}
          geometry={edges}
        >
          <lineBasicMaterial color={selectionColor} toneMapped={false} />
        </lineSegments>
      ) : null}
      {selected && xraySelection ? <lineSegments position={boxCenter(selected)} scale={boxSize(selected)} geometry={edges} renderOrder={3}>
        <lineBasicMaterial color={selectionColor} transparent opacity={0.35} depthTest={false} depthWrite={false} />
      </lineSegments> : null}
    </group>
  )
}
