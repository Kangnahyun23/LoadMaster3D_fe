import { describe, expect, test } from 'vitest'
import { SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import { obstacleTopLoadKg, topLoadKg } from '@/domain/constraints'
import type { VehicleObstacle } from '@/domain/models'
import { placed, stackGraphOf as graphOf, stackingProfile as profile } from '@/test/placements'

test('three 30 kg cartons stacked straight: the middle one carries 30 kg and the bottom one 60 kg', () => {
  const graph = graphOf(
    [placed('BOTTOM', [0, 0, 0], [120, 60, 45]), placed('MIDDLE', [0, 0, 45], [120, 60, 45]), placed('TOP', [0, 0, 90], [120, 60, 45])],
    { BOTTOM: profile(30), MIDDLE: profile(30), TOP: profile(30) },
  )
  expect(['TOP', 'MIDDLE', 'BOTTOM'].map((id) => topLoadKg(graph, id))).toStrictEqual([0, 30, 60])
})

test('a 40 kg package resting evenly on two packages puts 20 kg on each', () => {
  const graph = graphOf(
    [placed('LEFT', [0, 0, 0], [60, 60, 45]), placed('RIGHT', [60, 0, 0], [60, 60, 45]), placed('BRIDGE', [30, 0, 45], [60, 60, 30])],
    { LEFT: profile(20), RIGHT: profile(20), BRIDGE: profile(40) },
  )
  expect([topLoadKg(graph, 'LEFT'), topLoadKg(graph, 'RIGHT')]).toStrictEqual([20, 20])
})

test('the load splits by contact area: 45 × 40 and 15 × 40 cm under a 30 kg package carry 22.5 and 7.5 kg', () => {
  const graph = graphOf(
    [placed('WIDE', [0, 0, 0], [45, 40, 45]), placed('NARROW', [45, 0, 0], [30, 40, 45]), placed('UPPER', [0, 0, 45], [60, 40, 30])],
    { WIDE: profile(10), NARROW: profile(10), UPPER: profile(30) },
  )
  expect([topLoadKg(graph, 'WIDE'), topLoadKg(graph, 'NARROW')]).toStrictEqual([22.5, 7.5])
})

describe('a carton half on the Spec wheel arch OBS-001 (x 0..120, y 0..30, 45 cm tall) and half on a carton beside it', () => {
  // UPPER 120 × 60 cm at z 45 touches 120 × 30 cm of the arch top and 120 × 30 cm of BESIDE (y 30..60)
  const placements = [placed('BESIDE', [0, 30, 0], [120, 30, 45]), placed('UPPER', [0, 0, 45], [120, 60, 45])]
  const profiles = { BESIDE: profile(10), UPPER: profile(30) }
  const [wheelArch] = SPEC_TRUCK_6M.obstacles as [VehicleObstacle]

  test('a load-bearing arch takes half of the 30 kg, so the carton beside it carries 15 kg', () => {
    const graph = graphOf(placements, profiles, { ...SPEC_TRUCK_6M, obstacles: [{ ...wheelArch, loadBearing: true }] })
    expect([topLoadKg(graph, 'BESIDE'), obstacleTopLoadKg(graph, 'OBS-001')]).toStrictEqual([15, 15])
  })

  test('the non-load-bearing Spec arch takes nothing, so the carton beside it carries all 30 kg', () => {
    const graph = graphOf(placements, profiles, SPEC_TRUCK_6M)
    expect([topLoadKg(graph, 'BESIDE'), obstacleTopLoadKg(graph, 'OBS-001')]).toStrictEqual([30, 0])
  })
})
