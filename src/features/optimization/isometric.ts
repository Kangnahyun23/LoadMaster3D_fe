import {
  boxFaces,
  createProjector,
  roofOutline,
  sortByDepth,
  type IsoBox,
  type IsoFace,
} from '@/lib/isometric'

/**
 * Ảnh xem trước trong modal tối ưu: thùng xe cố định + bốn khoang hàng theo
 * điểm giao. Phần toán chiếu nằm ở `lib/isometric.ts`, dùng chung với màn
 * so sánh phương án.
 */

const SCALE = 30
/** Đẩy hình lên cho cân trong khung 232px. */
const Y_OFFSET = -40

const project = createProjector(SCALE, 0, Y_OFFSET)

export type Face = IsoFace

/** Kích thước thùng tính bằng mét. */
export const CONTAINER = { length: 7.2, width: 2.35, height: 2.4 }

/** Sàn và hai vách xa của thùng xe — mờ, chỉ để định hình. */
export function containerFaces(): Face[] {
  const { length: l, width: w, height: h } = CONTAINER
  const stroke = 'rgba(255,255,255,.18)'
  return [
    { points: [project(0, 0, 0), project(l, 0, 0), project(l, w, 0), project(0, w, 0)].join(' '), fill: 'rgba(255,255,255,.06)', stroke, strokeWidth: 0.6, depth: -1 },
    { points: [project(0, 0, 0), project(0, w, 0), project(0, w, h), project(0, 0, h)].join(' '), fill: 'rgba(255,255,255,.05)', stroke, strokeWidth: 0.6, depth: -1 },
    { points: [project(0, 0, 0), project(l, 0, 0), project(l, 0, h), project(0, 0, h)].join(' '), fill: 'rgba(255,255,255,.04)', stroke, strokeWidth: 0.6, depth: -1 },
  ]
}

/** Đường viền mép trên và cạnh sau của thùng. */
export function containerOutline(): string {
  const { length: l, width: w, height: h } = CONTAINER
  return [
    roofOutline(CONTAINER, project),
    project(l, 0, h),
    project(l, 0, 0),
    project(l, w, 0),
    project(l, w, h),
    project(0, w, h),
  ].join(' ')
}

/**
 * Bốn khoang hàng theo điểm giao: điểm giao cuối nằm sâu nhất trong thùng
 * nên được xếp ở phía trong, điểm giao đầu nằm sát cửa sau.
 */
const SEGMENTS = [
  { startX: 0.05, length: 1.55, color: '#F0E442' },
  { startX: 1.7, length: 1.7, color: '#009E73' },
  { startX: 3.5, length: 1.9, color: '#56B4E9' },
  { startX: 5.5, length: 1.35, color: '#E69F00' },
] as const

const ROW_Y = [0.05, 1.22]
const ROW_WIDTH = 1.08
const BASE_HEIGHT = 1.12
const UPPER_Z = 1.17

/**
 * Sinh các kiện hàng.
 * `full` = phương án đã hoàn tất (xếp gần kín), `partial` = đang chạy dở.
 */
export function cargoFaces(fill: 'partial' | 'full'): Face[] {
  const boxes: IsoBox[] = []

  SEGMENTS.forEach((segment, segmentIndex) => {
    const columns = segmentIndex === 2 ? 2 : 1
    const columnLength = (segment.length - (columns - 1) * 0.08) / columns

    for (let column = 0; column < columns; column++) {
      const x = segment.startX + column * (columnLength + 0.08)

      ROW_Y.forEach((y, rowIndex) => {
        boxes.push({ x, y, z: 0, length: columnLength, width: ROW_WIDTH, height: BASE_HEIGHT, color: segment.color })

        const hasUpperLayer =
          fill === 'full'
            ? !(segmentIndex === 3 && rowIndex === 1 && column === 0)
            : segmentIndex <= 1 || (segmentIndex === 2 && column === 0 && rowIndex === 0)

        if (hasUpperLayer) {
          boxes.push({ x, y, z: UPPER_Z, length: columnLength, width: ROW_WIDTH, height: segmentIndex === 0 ? 1.05 : 0.9, color: segment.color })
        }
      })
    }
  })

  return sortByDepth(boxes.flatMap((box) => boxFaces(box, project, { stroke: 'rgba(0,0,0,.35)' })))
}
