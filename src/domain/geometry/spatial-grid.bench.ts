import { test } from 'vitest'
import { createSpatialGrid, overlaps, roundCm, type Box, type SpatialEntry } from '@/domain/geometry'

/** Cùng PRNG tất định với test đối chiếu để số đo lặp lại được. */
function random(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomEntries(count: number): SpatialEntry[] {
  const next = random(20260915)
  return Array.from({ length: count }, (_, i) => {
    const size = () => roundCm(20 + next() * 100)
    const lengthCm = size(), widthCm = size(), heightCm = size()
    const box: Box = {
      xCm: roundCm(next() * (600 - lengthCm)), yCm: roundCm(next() * (240 - widthCm)), zCm: roundCm(next() * (250 - heightCm)),
      lengthCm, widthCm, heightCm,
    }
    return { id: `B${i}`, box }
  })
}

const ENTRIES = randomEntries(1000)

/**
 * Gần phương án thật: 1.000 thùng 40 × 30 × 25 cm xếp kín theo hàng/tầng trong Truck 6m (600 × 240 × 250 cm),
 * chạm mặt nhau, không chồng lấn. Dữ liệu ngẫu nhiên ở trên chồng chéo dày đặc nên là trường hợp xấu nhất.
 */
function packedEntries(count: number): SpatialEntry[] {
  const perRow = 600 / 40, perLayer = perRow * (240 / 30)
  return Array.from({ length: count }, (_, i) => {
    const box: Box = {
      xCm: (i % perRow) * 40, yCm: (Math.floor(i / perRow) % 8) * 30, zCm: Math.floor(i / perLayer) * 25,
      lengthCm: 40, widthCm: 30, heightCm: 25,
    }
    return { id: `P${i}`, box }
  })
}

const PACKED = packedEntries(1000)

test('1.000 thùng xếp kín — kiểm chồng lấn và tìm kiện đỡ cho mọi thùng', async ({ bench }) => {
  const grid = createSpatialGrid(PACKED)
  await bench.compare(
    bench('lưới 50 cm: queryAabb + queryBelow × 1.000', () => {
      for (const { id, box } of PACKED) {
        grid.queryAabb(box, { excludeId: id })
        grid.queryBelow(box, { excludeId: id })
      }
    }),
    bench('quét thẳng: overlaps × 999.000', () => {
      for (const a of PACKED) for (const b of PACKED) if (a.id !== b.id) overlaps(a.box, b.box)
    }),
  )
})

// Vitest 5: `bench` lấy từ context của test; `bench.compare` in bảng so sánh.
test('1.000 hộp — kiểm chồng lấn cho mọi hộp', async ({ bench }) => {
  const grid = createSpatialGrid(ENTRIES)
  await bench.compare(
    bench('lưới 50 cm: queryAabb × 1.000', () => {
      for (const { id, box } of ENTRIES) grid.queryAabb(box, { excludeId: id })
    }),
    bench('quét thẳng: overlaps × 999.000', () => {
      for (const a of ENTRIES) for (const b of ENTRIES) if (a.id !== b.id) overlaps(a.box, b.box)
    }),
  )
})

test('1.000 hộp — một lần thả trong editor', async ({ bench }) => {
  const grid = createSpatialGrid(ENTRIES)
  const { id, box } = ENTRIES[0]!
  const moved: Box = { ...box, xCm: roundCm((box.xCm + 37.3) % 480) }
  await bench('update + 4 truy vấn láng giềng', () => {
    grid.update(id, moved)
    grid.queryAabb(moved, { excludeId: id })
    grid.queryBelow(moved, { excludeId: id })
    grid.queryAbove(moved, { excludeId: id })
    grid.queryRearCorridor(moved, { excludeId: id })
  }).run()
})

test('dựng lưới 1.000 hộp', async ({ bench }) => {
  await bench('createSpatialGrid', () => {
    createSpatialGrid(ENTRIES)
  }).run()
})
