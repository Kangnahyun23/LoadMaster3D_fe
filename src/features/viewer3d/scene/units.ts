import type { Placement, VehicleSpec } from '@/types/load-plan'

/**
 * Đổi hệ toạ độ nghiệp vụ (mm; x dài, y ngang, z cao) sang Three.js
 * (m; Y hướng lên). Đây là chỗ duy nhất biết về phép đổi này.
 *
 *   three.x = x_mm / 1000      chiều dài, vách trước tại 0, cửa sau tại L
 *   three.y = z_mm / 1000      chiều cao
 *   three.z = y_mm / 1000      chiều ngang, vách trái tại 0
 */
export const MM = 0.001

export type Vec3 = [number, number, number]

export function boxCenter(p: Placement): Vec3 {
  return [
    (p.position.x + p.lengthMm / 2) * MM,
    (p.position.z + p.heightMm / 2) * MM,
    (p.position.y + p.widthMm / 2) * MM,
  ]
}

/** Kích thước theo trục Three.js: [dài, cao, ngang] */
export function boxSize(p: Placement): Vec3 {
  return [p.lengthMm * MM, p.heightMm * MM, p.widthMm * MM]
}

export function containerSize(v: VehicleSpec) {
  return {
    length: v.innerLengthMm * MM,
    height: v.innerHeightMm * MM,
    width: v.innerWidthMm * MM,
  }
}

export function containerCenter(v: VehicleSpec): Vec3 {
  const { length, height, width } = containerSize(v)
  return [length / 2, height / 2, width / 2]
}
