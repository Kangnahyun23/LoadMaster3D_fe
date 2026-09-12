import { Color } from 'three'
import { readToken } from '@/lib/tokens'

/**
 * Màu vật liệu của thùng xe và đầu kéo, suy ra từ token vùng 3D
 * (`--canvas-*`, `--panel-dark`, `--border-dark`) thay vì hex tự đặt.
 */
export type SceneMaterials = {
  floor: string
  wall: string
  skirt: string
  cab: string
  chassis: string
  wheel: string
  windshield: string
  outline: string
}

function derive(token: `--${string}`, fallback: string, factor: number): string {
  const color = new Color(readToken(token) || fallback).multiplyScalar(factor)
  return `#${color.getHexString()}`
}

export function sceneMaterials(): SceneMaterials {
  const info = new Color(readToken('--info') || '#0891b2')
  const bg = new Color(readToken('--bg') || '#ffffff')

  return {
    floor: derive('--border-dark', '#2d323b', 1.55),
    wall: derive('--border-dark', '#2d323b', 1.25),
    skirt: derive('--border-dark', '#2d323b', 1.9),
    cab: derive('--border-dark', '#2d323b', 1.7),
    chassis: derive('--panel-dark', '#1e2228', 0.9),
    wheel: derive('--canvas-2', '#0f1115', 1.1),
    windshield: `#${info.lerp(bg, 0.45).getHexString()}`,
    outline: derive('--canvas-2', '#0f1115', 1),
  }
}
