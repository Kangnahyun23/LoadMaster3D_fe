import type { VehicleObstacle } from '@/domain/models'
import { obstacleCorners, type ObstacleBox } from './units'

/**
 * Dữ liệu thuần cho `ObstacleInstances` (LM-033): không import Three.js để test được trong node.
 *
 * - `RESERVED_ZONE` vẽ có vạch chéo và nhìn xuyên được (shader bỏ điểm ảnh giữa các vạch), mọi loại khác vẽ đặc.
 * - Màu chỉ phân biệt `loadBearing`: `--obstacle` không chịu tải, `--obstacle-bearing` chịu tải.
 */
export type ObstacleStyle = 'solid' | 'hatched'

export function obstacleStyle(obstacle: Pick<VehicleObstacle, 'type'>): ObstacleStyle {
  return obstacle.type === 'RESERVED_ZONE' ? 'hatched' : 'solid'
}

export function obstacleColorToken(obstacle: Pick<VehicleObstacle, 'loadBearing'>): '--obstacle' | '--obstacle-bearing' {
  return obstacle.loadBearing ? '--obstacle-bearing' : '--obstacle'
}

/** 12 cạnh, mỗi cạnh 2 đỉnh — số đỉnh của viền cho một vật cản. */
export const OBSTACLE_EDGE_VERTICES = 24

/**
 * Toạ độ scene của toàn bộ cạnh hộp, gộp vào một buffer để mọi vật cản dùng chung một draw call `LineSegments`.
 * Mỗi vật cản đúng `OBSTACLE_EDGE_VERTICES` đỉnh, theo thứ tự danh sách.
 */
export function obstacleEdgePositions(obstacles: readonly ObstacleBox[]): Float32Array {
  const positions = new Float32Array(obstacles.length * OBSTACLE_EDGE_VERTICES * 3)
  let offset = 0
  for (const obstacle of obstacles) {
    const [min, max] = obstacleCorners(obstacle)
    const corner = (bits: number) => [bits & 1 ? max[0] : min[0], bits & 2 ? max[1] : min[1], bits & 4 ? max[2] : min[2]]
    // Mỗi cạnh nối hai góc chỉ khác nhau đúng một trục.
    for (let from = 0; from < 8; from++) {
      for (const axis of [1, 2, 4]) {
        if (from & axis) continue
        positions.set(corner(from), offset)
        positions.set(corner(from | axis), offset + 3)
        offset += 6
      }
    }
  }
  return positions
}
