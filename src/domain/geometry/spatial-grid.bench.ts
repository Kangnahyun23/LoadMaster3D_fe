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
