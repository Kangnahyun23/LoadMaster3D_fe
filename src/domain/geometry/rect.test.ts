import { expect, test } from 'vitest'
import { coveredArea, type Rect } from '@/domain/geometry'

/** The rectangle [u1, u2) × [v1, v2) in cm, on whichever plane the caller projects onto. */
function rect(u1: number, u2: number, v1: number, v2: number): Rect {
  return { u1, u2, v1, v2 }
}

test('a cover lying inside the target covers its own 40 × 30 = 1,200 cm²', () => {
  expect(coveredArea(rect(0, 100, 0, 50), [rect(20, 60, 10, 40)])).toBe(1200)
})

test('only the part of a cover inside the target counts: u 80..100 × v 30..50 = 400 cm² of a 70 × 60 cm cover', () => {
  expect(coveredArea(rect(0, 100, 0, 50), [rect(80, 150, 30, 90)])).toBe(400)
})

test('covers overlapping each other count the shared part once: 3,600 + 3,600 − 400 = 6,800 cm²', () => {
  // the two 60 × 60 cm covers share the square u 40..60 × v 40..60
  expect(coveredArea(rect(0, 100, 0, 100), [rect(0, 60, 0, 60), rect(40, 100, 40, 100)])).toBe(6800)
})

test('a cover that only shares an edge with the target covers nothing on either axis, even when the edge drifts', () => {
  // the target ends at 100.4 + 120.7 = 221.10000000000002: a raw comparison keeps a 1.7e-12 cm² sliver past 221.1
  const end = 100.4 + 120.7
  const areas = [
    coveredArea(rect(100.4, end, 0, 60), [rect(221.1, 300, 0, 60)]),
    coveredArea(rect(0, 60, 100.4, end), [rect(0, 60, 221.1, 300)]),
  ]
  expect(areas).toStrictEqual([0, 0])
})
