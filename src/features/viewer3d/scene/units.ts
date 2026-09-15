import type { VehicleConfig } from '@/domain/models'
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
