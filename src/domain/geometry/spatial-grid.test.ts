import { expect, test } from 'vitest'
import { createSpatialGrid, roundCm, type Box, type SpatialGrid } from '@/domain/geometry'

/** PRNG tất định (mulberry32) để bộ hộp ngẫu nhiên giống nhau ở mọi lần chạy. */
function random(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomBox(next: () => number): Box {
  const size = () => roundCm(20 + next() * 100)
  const lengthCm = size(), widthCm = size(), heightCm = size()
  return {
    xCm: roundCm(next() * (600 - lengthCm)), yCm: roundCm(next() * (240 - widthCm)), zCm: roundCm(next() * (250 - heightCm)),
    lengthCm, widthCm, heightCm,
  }
}

function allQueries(grid: SpatialGrid, entries: ReadonlyMap<string, Box>) {
  return [...entries].map(([id, query]) => [
    grid.queryAabb(query, { excludeId: id }), grid.queryBelow(query, { excludeId: id }),
    grid.queryAbove(query, { excludeId: id }), grid.queryRearCorridor(query, { excludeId: id }),
  ])
}

function box(xCm: number, yCm: number, zCm: number, lengthCm = 60, widthCm = 40, heightCm = 40): Box {
  return { xCm, yCm, zCm, lengthCm, widthCm, heightCm }
}

test('queryAabb returns the ids of stored boxes that overlap the query box', () => {
  const grid = createSpatialGrid([
    { id: 'A', box: box(0, 0, 0) },
    { id: 'B', box: box(200, 0, 0) },
    { id: 'C', box: box(400, 100, 0) },
  ])
  expect(grid.queryAabb(box(180, 20, 10))).toStrictEqual(['B'])
})

test('queryAabb can leave out the stored box being checked against the others', () => {
  const grid = createSpatialGrid([
    { id: 'A', box: box(0, 0, 0) },
    { id: 'B', box: box(30, 20, 0) },
  ])
  expect(grid.queryAabb(box(0, 0, 0), { excludeId: 'A' })).toStrictEqual(['B'])
})

test('queryBelow returns boxes whose top face touches the bottom of the query box within 0.2 cm', () => {
  const grid = createSpatialGrid([
    { id: 'support', box: box(0, 0, 0) }, // top at 40
    { id: 'nearly', box: box(30, 0, 0, 60, 40, 39.9) }, // top at 39.9, inside the 0.2 cm contact tolerance
    { id: 'gap', box: box(0, 20, 0, 60, 40, 39) }, // top at 39, a 1 cm gap
    { id: 'beside', box: box(0, 40, 0) }, // touches only along the side y = 40
  ])
  expect(grid.queryBelow(box(10, 0, 40))).toStrictEqual(['support', 'nearly'])
})

test('queryAbove returns boxes resting on the top face of the query box', () => {
  const grid = createSpatialGrid([
    { id: 'resting', box: box(20, 10, 40) }, // bottom at 40, the query top
    { id: 'lifted', box: box(0, 0, 41) }, // bottom 1 cm above the top
    { id: 'underneath', box: box(0, 0, -40) }, // below the query, not above it
  ])
  expect(grid.queryAbove(box(0, 0, 0))).toStrictEqual(['resting'])
})

test('queryRearCorridor returns boxes between the rear face of the query box and the rear door that cross its Y–Z section', () => {
  const grid = createSpatialGrid([
    { id: 'far', box: box(400, 20, 10) }, // in line, far towards the door
    { id: 'near', box: box(60, 0, 0) }, // starts exactly at the rear face x = 60
    { id: 'alongside', box: box(100, 40, 0) }, // only touches the corridor side y = 40
    { id: 'overhead', box: box(100, 0, 40) }, // only touches the corridor top z = 40
    { id: 'deeper', box: box(-60, 0, 0) }, // towards the front wall, not the door
  ])
  expect(grid.queryRearCorridor(box(0, 0, 0))).toStrictEqual(['far', 'near'])
})

test('update moves a stored box: it is found at its new place and no longer at the old one', () => {
  const grid = createSpatialGrid([{ id: 'A', box: box(0, 0, 0) }])
  grid.update('A', box(300, 100, 0))
  expect([grid.queryAabb(box(10, 10, 10)), grid.queryAabb(box(310, 110, 10))]).toStrictEqual([[], ['A']])
})

test('remove takes a box out of every query', () => {
  const grid = createSpatialGrid([
    { id: 'A', box: box(0, 0, 0) },
    { id: 'B', box: box(0, 0, 40) },
  ])
  grid.remove('B')
  expect([grid.queryAabb(box(0, 0, 40)), grid.queryAbove(box(0, 0, 0))]).toStrictEqual([[], []])
})

test('results stay in insertion order after a box is removed and another is added', () => {
  const grid = createSpatialGrid([
    { id: 'A', box: box(400, 0, 0) },
    { id: 'B', box: box(200, 0, 0) },
    { id: 'C', box: box(300, 0, 0) },
  ])
  grid.remove('A')
  grid.update('D', box(0, 0, 0))
  expect(grid.queryAabb(box(0, 0, 0, 400))).toStrictEqual(['B', 'C', 'D'])
})

test('a 50 cm grid answers every query exactly like a single-cell grid, before and after 200 moves', () => {
  const next = random(20260915)
  const entries = new Map<string, Box>(Array.from({ length: 1000 }, (_, i) => [`B${i}`, randomBox(next)]))
  const list = [...entries].map(([id, box]) => ({ id, box }))
  const fine = createSpatialGrid(list, 50)
  const scan = createSpatialGrid(list, 1e9)
  expect(allQueries(fine, entries)).toStrictEqual(allQueries(scan, entries))

  for (let i = 0; i < 200; i++) {
    const id = `B${Math.floor(next() * 1000)}`
    const moved = randomBox(next)
    entries.set(id, moved)
    fine.update(id, moved)
    scan.update(id, moved)
  }
  expect(allQueries(fine, entries)).toStrictEqual(allQueries(scan, entries))
})
