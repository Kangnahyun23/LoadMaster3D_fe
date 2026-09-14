import { BoxGeometry, BufferAttribute, Color, CylinderGeometry, type BufferGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { SceneMaterials } from './materials'

type Point = [number, number, number]
/** Cosmetic parts share vertex colors and one material/draw. Never axle geometry. */
export function truckDetails(length: number, width: number, cabX: number, m: SceneMaterials) {
  const parts: BufferGeometry[] = []
  const add = (size: Point, position: Point, color: string) => {
    parts.push(tintGeometry(new BoxGeometry(...size).translate(...position), color))
  }
  const front = cabX - 0.75
  // Grille, bumper, split headlamps, visor and plate recess.
  add([0.05, 0.35, width - 0.7], [front - 0.01, 0.84, width / 2], m.chassis)
  for (let i = 0; i < 4; i++) add([0.06, 0.018, width - 0.78], [front - 0.04, 0.71 + i * 0.075, width / 2], m.metal)
  add([0.16, 0.22, width - 0.02], [front - 0.05, 0.39, width / 2], m.metal)
  add([0.17, 0.08, width], [front + 0.2, 2.28, width / 2], m.cab)
  add([0.02, 0.12, 0.38], [front - 0.14, 0.39, width / 2], m.chassis)
  for (const side of [-1, 1]) {
    const z = side < 0 ? 0 : width
    add([0.045, 0.18, 0.3], [front - 0.04, 0.6, z - side * 0.25], m.light)
    // Side windows, door seam/handle, mirrors and two non-slip steps.
    add([0.92, 0.63, 0.018], [cabX + 0.12, 1.76, z - side * 0.042], m.windshield)
    add([0.02, 1.52, 0.02], [cabX + 0.65, 1.27, z - side * 0.04], m.skirt)
    add([0.2, 0.045, 0.04], [cabX + 0.43, 1.3, z - side * 0.02], m.chassis)
    add([0.04, 0.04, 0.28], [cabX - 0.35, 1.55, z + side * 0.1], m.metal)
    add([0.15, 0.35, 0.1], [cabX - 0.35, 1.67, z + side * 0.25], m.chassis)
    add([0.12, 0.29, 0.015], [cabX - 0.35, 1.67, z + side * 0.305], m.metal)
    for (let i = 0; i < 2; i++) add([0.5, 0.06, 0.24], [cabX + 0.52, 0.18 - i * 0.19, z - side * 0.01], m.metal)
    // Underbody tanks, side guard rails and rear mudflaps.
    add([1.1, 0.38, 0.44], [length * 0.18, -0.45, z - side * 0.35], m.metal)
    for (let i = 0; i < 2; i++) add([length * 0.36, 0.07, 0.08], [length * 0.4, -0.37 - i * 0.22, z - side * 0.15], m.metal)
    add([0.07, 0.54, 0.42], [length * 0.72 + 1.7, -0.62, z - side * 0.2], m.wheel)
    add([0.06, 0.13, 0.3], [length + 0.12, -0.18, z - side * 0.25], m.tailLight)
  }
  add([0.18, 0.15, width - 0.3], [length + 0.16, -0.65, width / 2], m.metal)
  const geometry = mergeGeometries(parts)!
  parts.forEach((part) => part.dispose())
  return geometry
}

export function tintGeometry(geometry: BufferGeometry, value: string) {
  const color = new Color(value), count = geometry.getAttribute('position').count
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) colors.set([color.r, color.g, color.b], i * 3)
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
  return geometry
}

/** Tire, rim, hub and bolts repeated as a single instanced geometry for six wheels. */
export function truckWheel(m: SceneMaterials) {
  const parts = [tintGeometry(new CylinderGeometry(0.5, 0.5, 0.32, 24), m.wheel)]
  for (const side of [-1, 1]) {
    parts.push(tintGeometry(new CylinderGeometry(0.31, 0.31, 0.035, 20).translate(0, side * 0.168, 0), m.metal))
    parts.push(tintGeometry(new CylinderGeometry(0.13, 0.13, 0.055, 12).translate(0, side * 0.194, 0), m.chassis))
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4
      parts.push(tintGeometry(new CylinderGeometry(0.025, 0.025, 0.02, 6)
        .translate(Math.cos(angle) * 0.22, side * 0.195, Math.sin(angle) * 0.22), m.light))
    }
  }
  const geometry = mergeGeometries(parts)!
  parts.forEach((part) => part.dispose())
  return geometry
}
