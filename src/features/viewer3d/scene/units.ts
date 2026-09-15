import type { VehicleConfig, VehicleObstacle } from '@/domain/models'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'

/**
 * Đổi hệ toạ độ nghiệp vụ Spec (cm; x dài, y ngang, z cao) sang Three.js
 * (m; Y hướng lên). Đây là chỗ duy nhất biết về phép đổi này (Spec mục 10, LM-031).
 *
 *   three.x = xCm × 0,01      chiều dài, vách trước tại 0, cửa sau tại L
 *   three.y = zCm × 0,01      chiều cao
 *   three.z = yCm × 0,01      chiều ngang, vách trái tại 0
 */
export const SCENE_SCALE = 0.01

export type Vec3 = [number, number, number]

/** cm nghiệp vụ → đơn vị scene. */
export const toScene = (centimeters: number) => centimeters * SCENE_SCALE
/** Đơn vị scene → cm nghiệp vụ (chưa làm tròn; editor commit qua `roundCm`). */
export const fromScene = (sceneUnits: number) => sceneUnits / SCENE_SCALE

export function boxCenter(p: ScenePlacement): Vec3 {
  return [
    toScene(p.position.x + p.lengthCm / 2),
    toScene(p.position.z + p.heightCm / 2),
    toScene(p.position.y + p.widthCm / 2),
  ]
}

/** Kích thước theo trục Three.js: [dài, cao, ngang] */
export function boxSize(p: ScenePlacement): Vec3 {
  return [toScene(p.lengthCm), toScene(p.heightCm), toScene(p.widthCm)]
}

/** Hộp cm của vật cản: góc (x, y, z) sát vách trước – vách trái – sàn và ba kích thước theo trục nghiệp vụ. */
export type ObstacleBox = Pick<VehicleObstacle, 'xCm' | 'yCm' | 'zCm' | 'lengthCm' | 'widthCm' | 'heightCm'>

/** Tâm vật cản theo trục Three.js (LM-033). */
export function obstacleCenter(o: ObstacleBox): Vec3 {
  return [toScene(o.xCm + o.lengthCm / 2), toScene(o.zCm + o.heightCm / 2), toScene(o.yCm + o.widthCm / 2)]
}

/** Kích thước vật cản theo trục Three.js: [dài, cao, ngang] */
export function obstacleSize(o: ObstacleBox): Vec3 {
  return [toScene(o.lengthCm), toScene(o.heightCm), toScene(o.widthCm)]
}

/** Hai góc đối của hộp vật cản trong scene: [min, max]. Dùng cho viền, không đổi đơn vị ở nơi khác. */
export function obstacleCorners(o: ObstacleBox): [Vec3, Vec3] {
  return [
    [toScene(o.xCm), toScene(o.zCm), toScene(o.yCm)],
    [toScene(o.xCm + o.lengthCm), toScene(o.zCm + o.heightCm), toScene(o.yCm + o.widthCm)],
  ]
}

export function containerSize(v: Pick<VehicleConfig, 'innerLengthCm' | 'innerWidthCm' | 'innerHeightCm'>) {
  return {
    length: toScene(v.innerLengthCm),
    height: toScene(v.innerHeightCm),
    width: toScene(v.innerWidthCm),
  }
}

export function containerCenter(v: Pick<VehicleConfig, 'innerLengthCm' | 'innerWidthCm' | 'innerHeightCm'>): Vec3 {
  const { length, height, width } = containerSize(v)
  return [length / 2, height / 2, width / 2]
}
