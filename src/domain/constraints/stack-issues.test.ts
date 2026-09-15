import { describe, expect, test } from 'vitest'
import { stackIssues } from '@/domain/constraints'
import { SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { VehicleConfig, VehicleObstacle } from '@/domain/models'
import { placed, stackGraphOf, stackingProfile, type Triple } from '@/test/placements'

const CARTON: Triple = [120, 60, 45]

/** A straight column at x 300 of `count` cartons, `C1` on the floor and `C<count>` on top. */
function column(count: number) {
  return Array.from({ length: count }, (_, index) => placed(`C${index + 1}`, [300, 0, 45 * index], CARTON))
}

test('five 30 kg cartons rated for 90 kg on top: only the bottom one, carrying 120 kg, is overloaded', () => {
  const profiles = Object.fromEntries(column(5).map(({ packageInstanceId }) => [packageInstanceId, stackingProfile(30, { maxTopLoadKg: 90 })]))
  expect(stackIssues(stackGraphOf(column(5), profiles))).toStrictEqual([
    { code: 'TOP_LOAD_EXCEEDED', severity: 'error', packageInstanceId: 'C1', params: { loadKg: 120, maxKg: 90 } },
  ])
})

test('a package rated 0 kg on top, like HIGH fragility glass in Spec 7.8, bears no load at all: a 0.5 kg box on it is an error', () => {
  const graph = stackGraphOf([placed('GLASS', [300, 0, 0], CARTON), placed('LEAFLETS', [300, 0, 45], [40, 30, 10])], {
    GLASS: stackingProfile(12, { maxTopLoadKg: 0 }),
    LEAFLETS: stackingProfile(0.5),
  })
  expect(stackIssues(graph)).toStrictEqual([
    { code: 'TOP_LOAD_EXCEEDED', severity: 'error', packageInstanceId: 'GLASS', params: { loadKg: 0.5, maxKg: 0 } },
  ])
})

test('four Carton A allowed 3 layers in one column: every carton of the column is in a 4-layer stack', () => {
  const profiles = Object.fromEntries(column(4).map(({ packageInstanceId }) => [packageInstanceId, stackingProfile(30, { maxStackCount: 3 })]))
  expect(stackIssues(stackGraphOf(column(4), profiles))).toStrictEqual(
    ['C1', 'C2', 'C3', 'C4'].map((packageInstanceId) => ({
      code: 'STACK_COUNT_EXCEEDED',
      severity: 'error',
      packageInstanceId,
      params: { layers: 4, maxStackCount: 3 },
    })),
  )
})

test('in a 3-layer column only the package whose own limit is lower than 3 layers is reported', () => {
  const profiles = { C1: stackingProfile(30), C2: stackingProfile(30, { maxStackCount: 2 }), C3: stackingProfile(30, { maxStackCount: 3 }) }
  expect(stackIssues(stackGraphOf(column(3), profiles))).toStrictEqual([
    { code: 'STACK_COUNT_EXCEEDED', severity: 'error', packageInstanceId: 'C2', params: { layers: 3, maxStackCount: 2 } },
  ])
})

test('a package bridging a 1-carton and a 2-carton column counts the taller one: 3 layers', () => {
  const placements = [
    placed('SHORT', [300, 0, 0], [60, 60, 90]),
    placed('LOW', [360, 0, 0], [60, 60, 45]),
    placed('HIGH', [360, 0, 45], [60, 60, 45]),
    placed('BRIDGE', [300, 0, 90], CARTON),
  ]
  const profiles = { SHORT: stackingProfile(20), LOW: stackingProfile(20), HIGH: stackingProfile(20), BRIDGE: stackingProfile(20, { maxStackCount: 2 }) }
  expect(stackIssues(stackGraphOf(placements, profiles))).toStrictEqual([
    { code: 'STACK_COUNT_EXCEEDED', severity: 'error', packageInstanceId: 'BRIDGE', params: { layers: 3, maxStackCount: 2 } },
  ])
})

describe('a 30 kg carton lying on the whole top of a load-bearing wheel arch (120 × 30 cm, 45 cm tall)', () => {
  const [wheelArch] = SPEC_TRUCK_6M.obstacles as [VehicleObstacle]
  const onArch = [placed('ON-ARCH', [0, 0, 45], [120, 30, 30])]
  const truckWithArch = (maxTopLoadKg?: number): VehicleConfig => ({
    ...SPEC_TRUCK_6M,
    obstacles: [{ ...wheelArch, loadBearing: true, ...(maxTopLoadKg === undefined ? {} : { maxTopLoadKg }) }],
  })

  test('overloads an arch rated for 20 kg: the obstacle is the subject, in relatedIds', () => {
    expect(stackIssues(stackGraphOf(onArch, { 'ON-ARCH': stackingProfile(30) }, truckWithArch(20)))).toStrictEqual([
      { code: 'TOP_LOAD_EXCEEDED', severity: 'error', relatedIds: ['OBS-001'], params: { loadKg: 30, maxKg: 20 } },
    ])
  })

  test('is fine on a load-bearing arch with no rating: a blank maxTopLoadKg means no limit', () => {
    expect(stackIssues(stackGraphOf(onArch, { 'ON-ARCH': stackingProfile(30) }, truckWithArch()))).toStrictEqual([])
  })
})

test('a non-stackable package with packages on it reports NOT_STACKABLE with them, not a 0 kg top load as well', () => {
  const graph = stackGraphOf(
    [placed('DRUM', [300, 0, 0], CARTON), placed('ON-LEFT', [300, 0, 45], [60, 60, 30]), placed('ON-RIGHT', [360, 0, 45], [60, 60, 30])],
    { DRUM: stackingProfile(80, { stackable: false, maxTopLoadKg: 0 }), 'ON-LEFT': stackingProfile(5), 'ON-RIGHT': stackingProfile(5) },
  )
  expect(stackIssues(graph)).toStrictEqual([
    { code: 'NOT_STACKABLE', severity: 'error', packageInstanceId: 'DRUM', relatedIds: ['ON-LEFT', 'ON-RIGHT'], params: {} },
  ])
})
