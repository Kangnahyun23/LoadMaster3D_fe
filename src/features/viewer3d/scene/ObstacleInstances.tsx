import { useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry, BufferAttribute, BufferGeometry, Color, DoubleSide, InstancedBufferAttribute, InstancedMesh, Matrix4, Quaternion, Vector3,
  type MeshStandardMaterial,
} from 'three'
import type { VehicleObstacle } from '@/domain/models'
import { readToken } from '@/lib/tokens'
import { obstacleColorToken, obstacleEdgePositions, obstacleStyle } from './obstacle-layout'
import { obstacleCenter, obstacleSize, toScene } from './units'

/** Khoảng cách giữa hai vạch của vùng dành riêng, cm nghiệp vụ. */
const HATCH_SPACING_CM = 12
const HATCH_DENSITY = 1 / toScene(HATCH_SPACING_CM)
const NO_RAYCAST = () => null

// Một thuộc tính trên từng instance, không thêm vật liệu hay draw call: 1 = vạch chéo, bỏ điểm ảnh giữa các vạch.
const applyObstacleHatch: MeshStandardMaterial['onBeforeCompile'] = (shader) => {
  shader.uniforms.obstacleHatchDensity = { value: HATCH_DENSITY }
  shader.vertexShader = 'attribute float obstacleHatch;\nvarying float vObstacleHatch;\nvarying vec3 vObstacleWorld;\n' + shader.vertexShader
  shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
vObstacleHatch = obstacleHatch;
#ifdef USE_INSTANCING
vObstacleWorld = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz;
#else
vObstacleWorld = (modelMatrix * vec4(position, 1.0)).xyz;
#endif`)
  shader.fragmentShader = 'uniform float obstacleHatchDensity;\nvarying float vObstacleHatch;\nvarying vec3 vObstacleWorld;\n' + shader.fragmentShader
  shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
if (vObstacleHatch > 0.5 && fract((vObstacleWorld.x + vObstacleWorld.y + vObstacleWorld.z) * obstacleHatchDensity) > 0.4) discard;`)
}

/**
 * Vật cản của thùng (LM-033): đúng hai draw call dù có 1 hay 20 vật cản — một `InstancedMesh` thân và một `LineSegments`
 * viền gộp; không có vật cản thì không vẽ gì. Không đổ bóng để shadow pass không thêm draw call.
 * `picking = false` (chế độ chỉnh sửa) tắt hẳn raycast; lúc kéo kiện editor còn tắt toàn bộ sự kiện R3F.
 */
export function ObstacleInstances({ obstacles, picking, onSelect, highlightedId = null }: {
  obstacles: readonly VehicleObstacle[]
  picking: boolean
  onSelect: (id: string) => void
  /** Vật cản tô `--highlight` (LM-042); chỉ đổi màu instance, không thêm draw call. */
  highlightedId?: string | null
}) {
  const body = useRef<InstancedMesh>(null)
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)
  const count = obstacles.length
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), [])
  const edges = useMemo(() => {
    const lines = new BufferGeometry()
    lines.setAttribute('position', new BufferAttribute(obstacleEdgePositions(obstacles), 3))
    return lines
  }, [obstacles])
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => edges.dispose(), [edges])

  useLayoutEffect(() => {
    geometry.setAttribute('obstacleHatch', new InstancedBufferAttribute(
      Float32Array.from(obstacles, (obstacle) => obstacleStyle(obstacle) === 'hatched' ? 1 : 0), 1))
    const mesh = body.current
    if (!mesh) return
    const matrix = new Matrix4(), rotation = new Quaternion()
    obstacles.forEach((obstacle, index) => {
      matrix.compose(new Vector3(...obstacleCenter(obstacle)), rotation, new Vector3(...obstacleSize(obstacle)))
      mesh.setMatrixAt(index, matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    // Dữ liệu tĩnh: bounds cho raycast tính một lần mỗi khi danh sách đổi.
    mesh.computeBoundingSphere()
    invalidate()
  }, [obstacles, geometry, invalidate])

  // Màu tách khỏi ma trận: đổi vật cản làm nổi chỉ ghi lại màu instance (LM-042).
  useLayoutEffect(() => {
    const mesh = body.current
    if (!mesh) return
    const color = new Color()
    obstacles.forEach((obstacle, index) => {
      mesh.setColorAt(index, color.set(readToken(obstacle.id === highlightedId ? '--highlight' : obstacleColorToken(obstacle))))
    })
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    invalidate()
  }, [obstacles, highlightedId, invalidate])

  useEffect(() => () => { gl.domElement.style.removeProperty('cursor') }, [gl])

  if (count === 0) return null

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const obstacle = event.instanceId === undefined ? undefined : obstacles[event.instanceId]
    if (obstacle) onSelect(obstacle.id)
  }
  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    if (event.pointerType === 'touch' || event.buttons) return
    event.stopPropagation()
    gl.domElement.style.setProperty('cursor', 'pointer')
  }
  const handleOut = () => { gl.domElement.style.removeProperty('cursor') }

  return <group name="vehicle-obstacles">
    <instancedMesh key={`obstacle-body-${count}`} ref={body} name="obstacle-body" args={[undefined, undefined, count]} geometry={geometry}
      frustumCulled={false} receiveShadow raycast={picking ? InstancedMesh.prototype.raycast : NO_RAYCAST}
      onClick={picking ? handleClick : undefined} onPointerOver={picking ? handleOver : undefined} onPointerOut={picking ? handleOut : undefined}>
      <meshStandardMaterial side={DoubleSide} roughness={0.85} metalness={0.05}
        onBeforeCompile={applyObstacleHatch} customProgramCacheKey={() => 'vehicle-obstacle-hatch-v1'} />
    </instancedMesh>
    <lineSegments name="obstacle-edges" geometry={edges} frustumCulled={false} raycast={NO_RAYCAST}>
      <lineBasicMaterial color={readToken('--bg')} transparent opacity={0.55} />
    </lineSegments>
  </group>
}
