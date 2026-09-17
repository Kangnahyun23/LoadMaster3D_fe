import { BufferAttribute, Color, type BufferGeometry } from 'three'

/** Gán màu theo đỉnh cho một phần hình học để nhiều phần gộp chung một vật liệu, một draw call. */
export function tintGeometry(geometry: BufferGeometry, value: string) {
  const color = new Color(value), count = geometry.getAttribute('position').count
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) colors.set([color.r, color.g, color.b], i * 3)
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
  return geometry
}
