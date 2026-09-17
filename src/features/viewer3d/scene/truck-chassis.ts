import { BoxGeometry, CylinderGeometry, SphereGeometry, type BufferGeometry } from 'three'
import type { SceneMaterials } from './materials'
import { CAB_X, WHEEL_RADIUS, WHEEL_Y, type TruckLayout } from './truck-layout'
import { tintGeometry } from './tint-geometry'

type Point = [number, number, number]

/**
 * Khung gầm minh hoạ (AGENTS mục 7): khung sườn, dầm ngang, trục, vi sai, nhíp, giảm chấn, các-đăng, động cơ/hộp số,
 * bình nhiên liệu, bình hơi, ắc quy, ống xả, lốp dự phòng, chắn bùn và gầm thùng. Mọi phần gộp vào hình học chi tiết
 * có màu theo đỉnh (một draw call) — nhìn được khi xoay camera xuống dưới gầm. Không phải dữ liệu trục có thẩm quyền.
 */
export function addChassisParts(parts: BufferGeometry[], layout: TruckLayout, length: number, width: number, m: SceneMaterials) {
  const box = (size: Point, position: Point, color: string) =>
    parts.push(tintGeometry(new BoxGeometry(...size).translate(...position), color))
  /** Trụ theo trục x, y hoặc z. */
  const cylinder = (radius: number, span: number, axis: 'x' | 'y' | 'z', position: Point, color: string, segments = 16) => {
    const geometry = new CylinderGeometry(radius, radius, span, segments)
    if (axis === 'x') geometry.rotateZ(Math.PI / 2)
    if (axis === 'z') geometry.rotateX(Math.PI / 2)
    parts.push(tintGeometry(geometry.translate(...position), color))
  }
  const { frame, axles, driveshaft } = layout
  const frameLength = frame.toX - frame.fromX
  const frameMid = (frame.fromX + frame.toX) / 2
  const mid = width / 2

  // Gầm thùng: tấm đáy, dầm ngang và hai thanh đỡ dọc nằm trên khung sườn.
  box([length, 0.012, width], [length / 2, -0.03, mid], m.wall)
  for (let x = 0.3; x < length; x += 0.6) box([0.06, 0.07, width - 0.06], [x, -0.07, mid], m.skirt)
  for (const z of frame.railZ) box([length, 0.06, 0.12], [length / 2, -0.12, z], m.skirt)

  // Khung sườn chữ C: bản bụng + hai cánh, và dầm ngang.
  for (const [i, z] of frame.railZ.entries()) {
    const outward = i === 0 ? -1 : 1
    box([frameLength, 0.24, 0.02], [frameMid, -0.27, z], m.chassis)
    for (const y of [-0.16, -0.38]) box([frameLength, 0.02, 0.09], [frameMid, y, z + outward * 0.035], m.chassis)
  }
  for (let x = frame.fromX + 0.25; x < frame.toX; x += 1.1) box([0.08, 0.14, frame.railZ[1] - frame.railZ[0]], [x, -0.27, mid], m.metal)

  // Cản trước và móc kéo.
  box([0.12, 0.08, 0.2], [frame.fromX + 0.05, -0.33, mid], m.metal)

  for (const axle of axles) {
    if (axle.kind === 'steer') {
      // Dầm cầu trước chữ I, thanh giằng lái và cam lái hai đầu.
      box([0.1, 0.13, width - 0.5], [axle.x, WHEEL_Y + 0.02, mid], m.metal)
      cylinder(0.025, width - 0.6, 'z', [axle.x + 0.22, WHEEL_Y - 0.05, mid], m.metal, 8)
      for (const z of [0.36, width - 0.36]) cylinder(0.07, 0.22, 'y', [axle.x, WHEEL_Y, z], m.chassis, 12)
    } else {
      // Vỏ cầu sau, vi sai hình cầu và cổ bánh răng quả dứa hướng về các-đăng.
      cylinder(0.075, width - 0.2, 'z', [axle.x, WHEEL_Y, mid], m.metal)
      parts.push(tintGeometry(new SphereGeometry(0.2, 16, 12).scale(1, 0.9, 1.1).translate(axle.x, WHEEL_Y, mid), m.chassis))
      cylinder(0.08, 0.26, 'x', [axle.x - 0.24, WHEEL_Y + 0.02, mid], m.chassis, 12)
    }
    for (const z of frame.railZ) {
      // Bó nhíp lá: các lá ngắn dần về phía dưới, quang nhíp và hai tai treo lên khung sườn.
      ;[1.2, 1.0, 0.8, 0.6].forEach((leaf, i) => box([leaf, 0.022, 0.08], [axle.x, WHEEL_Y + 0.17 - i * 0.026, z], m.metal))
      for (const dx of [-0.08, 0.08]) box([0.025, 0.2, 0.1], [axle.x + dx, WHEEL_Y + 0.11, z], m.chassis)
      for (const dx of [-0.6, 0.6]) box([0.06, 0.14, 0.06], [axle.x + dx, -0.46, z], m.chassis)
      // Giảm chấn.
      cylinder(0.035, 0.32, 'y', [axle.x + 0.3, WHEEL_Y + 0.22, z + (z < mid ? -0.12 : 0.12)], m.light, 10)
    }
  }

  // Động cơ, hộp số, và các-đăng nghiêng từ hộp số xuống từng cầu chủ động, có khớp chữ thập hai đầu.
  box([1.0, 0.5, 0.72], [CAB_X + 0.05, -0.2, mid], m.chassis)
  box([0.55, 0.34, 0.44], [CAB_X + 0.75, -0.3, mid], m.metal)
  for (const segment of driveshaft) {
    const fromY = segment.fromX === CAB_X + 0.7 ? -0.34 : WHEEL_Y + 0.02
    const toY = WHEEL_Y + 0.02
    const dx = segment.toX - 0.38 - (segment.fromX + 0.1), dy = toY - fromY
    const shaft = new CylinderGeometry(0.045, 0.045, Math.hypot(dx, dy), 12).rotateZ(Math.PI / 2 + Math.atan2(dy, dx))
    parts.push(tintGeometry(shaft.translate(segment.fromX + 0.1 + dx / 2, fromY + dy / 2, mid), m.metal))
    for (const [x, y] of [[segment.fromX + 0.1, fromY], [segment.toX - 0.38, toY]] as const) box([0.07, 0.1, 0.1], [x, y, mid], m.chassis)
  }

  // Bình nhiên liệu có đai, ắc quy, hai bình hơi, bầu giảm thanh và ống xả, lốp dự phòng treo dưới khung.
  const [leftRail, rightRail] = frame.railZ
  const fuelX = Math.max(CAB_X + 1.9, length * 0.2)
  cylinder(0.25, 1.1, 'x', [fuelX, -0.46, leftRail - 0.42], m.metal, 20)
  for (const dx of [-0.35, 0.35]) box([0.04, 0.52, 0.52], [fuelX + dx, -0.46, leftRail - 0.42], m.chassis)
  box([0.6, 0.36, 0.38], [fuelX, -0.42, rightRail + 0.36], m.chassis)
  box([0.62, 0.04, 0.4], [fuelX, -0.22, rightRail + 0.36], m.metal)
  for (const dz of [-0.2, 0.2]) cylinder(0.1, 0.8, 'x', [length * 0.38, -0.34, mid + dz], m.light, 14)
  cylinder(0.14, 0.75, 'x', [CAB_X + 1.5, -0.46, rightRail + 0.3], m.metal, 16)
  cylinder(0.04, 0.55, 'z', [CAB_X + 1.9, -0.5, rightRail + 0.6], m.chassis, 8)
  cylinder(0.44, 0.26, 'y', [length * 0.55, -0.5, mid], m.wheel, 24)
  cylinder(0.26, 0.27, 'y', [length * 0.55, -0.5, mid], m.metal, 16)

  // Chắn bùn trên các cầu chủ động, thanh chắn hông giữa hai cụm bánh.
  const drive = axles.filter((axle) => axle.kind === 'drive')
  if (drive.length) {
    const first = drive[0]!.x - 0.62, last = drive.at(-1)!.x + 0.62
    for (const z of [0.36, width - 0.36]) {
      box([last - first, 0.03, 0.74], [(first + last) / 2, WHEEL_Y + WHEEL_RADIUS + 0.06, z], m.chassis)
      for (const x of [first, last]) box([0.03, 0.3, 0.74], [x, WHEEL_Y + WHEEL_RADIUS - 0.08, z], m.chassis)
    }
    const steer = axles.find((axle) => axle.kind === 'steer')
    const guardFrom = (steer?.x ?? CAB_X) + 0.8, guardTo = first - 0.1
    if (guardTo > guardFrom) {
      for (const z of [0.02, width - 0.02]) {
        for (const y of [-0.3, -0.52]) box([guardTo - guardFrom, 0.07, 0.04], [(guardFrom + guardTo) / 2, y, z], m.metal)
        for (let x = guardFrom + 0.05; x <= guardTo; x += 1.2) box([0.05, 0.3, 0.04], [x, -0.41, z], m.chassis)
      }
    }
  }
}
