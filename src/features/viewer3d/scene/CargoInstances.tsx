import { easings, useSpring } from '@react-spring/three'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  BackSide,
  BoxGeometry,
  Color,
  EdgesGeometry,
  InstancedMesh,
  Object3D,
} from 'three'
import { readToken } from '@/lib/tokens'
import { dimColor, placementColor, type ColorContext } from '../colors'
import type { ColorMode, Placement } from '@/types/load-plan'
import { boxCenter, boxSize } from './units'

/**
 * Toàn bộ kiện hàng vẽ bằng ba InstancedMesh, mỗi cái một draw call:
 *   - opaque: kiện trong lát cắt và đã xếp tới bước hiện tại
 *   - dim:    kiện ngoài lát cắt — mờ, tối, để giữ ngữ cảnh mà không che
 *   - hull:   vỏ ngược màu tối bao quanh kiện opaque, tạo viền cạnh thùng
 * Kiện chưa tới bước xếp bị co về scale 0 nên không tốn instance thêm.
 * Kiện vừa xếp rơi xuống vị trí bằng spring 500ms giảm tốc (mục 8).
 */

const dummy = new Object3D()
const scratchColor = new Color()
const HULL_PADDING = 0.012
const DROP_HEIGHT = 1.2
const DROP_DURATION_MS = 500
const REDUCED_DURATION_MS = 100

function setInstance(
  mesh: InstancedMesh,
  index: number,
  placement: Placement,
  visible: boolean,
  yOffset = 0,
  padding = 0,
) {
  if (visible) {
    const [cx, cy, cz] = boxCenter(placement)
    const [l, h, w] = boxSize(placement)
    dummy.position.set(cx, cy + yOffset, cz)
    dummy.scale.set(l + padding * 2, h + padding * 2, w + padding * 2)
  } else {
    dummy.position.set(0, -100, 0)
    dummy.scale.set(0, 0, 0)
  }
  dummy.rotation.set(0, 0, 0)
  dummy.updateMatrix()
  mesh.setMatrixAt(index, dummy.matrix)
}

function commit(mesh: InstancedMesh | null) {
  if (!mesh) return
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  mesh.computeBoundingSphere()
}

const isBeyondSlice = (p: Placement, sliceMm: number) =>
  p.position.x + p.lengthMm > sliceMm

type Props = {
  placements: Placement[]
  colorMode: ColorMode
  colorContext: ColorContext
  sliceMm: number
  step: number
  selectedId: string | null
  onSelect: (id: string | null) => void
  outlines: boolean
  outlineColor: string
  reducedMotion: boolean
}

export function CargoInstances({
  placements,
  colorMode,
  colorContext,
  sliceMm,
  step,
  selectedId,
  onSelect,
  outlines,
  outlineColor,
  reducedMotion,
}: Props) {
  const opaqueRef = useRef<InstancedMesh>(null)
  const dimRef = useRef<InstancedMesh>(null)
  const hullRef = useRef<InstancedMesh>(null)
  const gl = useThree((s) => s.gl)

  const count = placements.length
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), [])
  const edges = useMemo(() => new EdgesGeometry(geometry), [geometry])
  const selectionColor = readToken('--bg') || '#ffffff'

  const previousStep = useRef(step)
  const animatingIndex = useRef(-1)
  const [spring, api] = useSpring(() => ({
    t: 1,
    config: { duration: DROP_DURATION_MS, easing: easings.easeOutCubic },
  }))

  useLayoutEffect(() => {
    const opaque = opaqueRef.current
    const dim = dimRef.current
    const hull = hullRef.current
    if (!opaque || !dim) return

    placements.forEach((p, i) => {
      const placed = p.step <= step
      const beyond = isBeyondSlice(p, sliceMm)
      const hex = placementColor(p, colorMode, colorContext)

      setInstance(opaque, i, p, placed && !beyond)
      setInstance(dim, i, p, placed && beyond)
      if (hull) setInstance(hull, i, p, placed && !beyond, 0, HULL_PADDING)

      opaque.setColorAt(i, scratchColor.set(hex))
      dim.setColorAt(i, scratchColor.set(dimColor(hex)))
    })

    commit(opaque)
    commit(dim)
    commit(hull)

    // Tiến đúng một bước → kiện mới rơi xuống vị trí.
    if (step === previousStep.current + 1) {
      const index = placements.findIndex((p) => p.step === step)
      if (index >= 0) {
        animatingIndex.current = index
        api.start({
          from: { t: 0 },
          to: { t: 1 },
          config: {
            duration: reducedMotion ? REDUCED_DURATION_MS : DROP_DURATION_MS,
            easing: easings.easeOutCubic,
          },
        })
      }
    }
    previousStep.current = step
  }, [placements, colorMode, colorContext, sliceMm, step, api, reducedMotion])

  useFrame(() => {
    const index = animatingIndex.current
    if (index < 0) return
    const placement = placements[index]
    const opaque = opaqueRef.current
    const dim = dimRef.current
    if (!placement || !opaque || !dim) {
      animatingIndex.current = -1
      return
    }

    const t = spring.t.get()
    const yOffset = (1 - t) * DROP_HEIGHT
    const beyond = isBeyondSlice(placement, sliceMm)

    setInstance(beyond ? dim : opaque, index, placement, true, yOffset)
    commit(beyond ? dim : opaque)
    if (hullRef.current && !beyond) {
      setInstance(hullRef.current, index, placement, true, yOffset, HULL_PADDING)
      commit(hullRef.current)
    }
    if (t >= 1) animatingIndex.current = -1
  })

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const placement =
      event.instanceId === undefined ? undefined : placements[event.instanceId]
    if (placement) onSelect(placement.id)
  }
  // Con trỏ chuột nằm trên <canvas> do WebGL dựng, không có prop React nào
  // điều khiển được — buộc phải đặt trực tiếp lên DOM node của renderer.
  const setCursor = (cursor: string) => {
    gl.domElement.style.setProperty('cursor', cursor)
  }
  const handleOver = () => setCursor('pointer')
  const handleOut = () => setCursor('')

  const selected = placements.find((p) => p.id === selectedId)

  return (
    <group>
      <instancedMesh
        key={`opaque-${count}`}
        ref={opaqueRef}
        args={[undefined, undefined, count]}
        geometry={geometry}
        frustumCulled={false}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        <meshStandardMaterial roughness={0.78} metalness={0.04} />
      </instancedMesh>

      <instancedMesh
        key={`dim-${count}`}
        ref={dimRef}
        args={[undefined, undefined, count]}
        geometry={geometry}
        frustumCulled={false}
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        <meshStandardMaterial transparent opacity={0.22} depthWrite={false} roughness={0.9} />
      </instancedMesh>

      {outlines ? (
        <instancedMesh
          key={`hull-${count}`}
          ref={hullRef}
          args={[undefined, undefined, count]}
          geometry={geometry}
          frustumCulled={false}
        >
          <meshBasicMaterial color={outlineColor} side={BackSide} toneMapped={false} />
        </instancedMesh>
      ) : null}

      {selected ? (
        <lineSegments
          position={boxCenter(selected)}
          scale={boxSize(selected).map((v) => v + 0.004) as [number, number, number]}
          geometry={edges}
        >
          <lineBasicMaterial color={selectionColor} toneMapped={false} />
        </lineSegments>
      ) : null}
    </group>
  )
}
