import { expect, test } from 'vitest'
import { loadingOrderIssues, recomputeOrders } from '@/domain/constraints'
import type { PackagePlacement } from '@/domain/models'
import { dropAt, placed, seededRandom, stackGraphOf, stackingProfile, type Triple } from '@/test/placements'

const CARTON: Triple = [120, 60, 45]

function withOrder(placement: PackagePlacement, loadingOrder: number): PackagePlacement {
  return { ...placement, loadingOrder }
}

function graphOf(placements: PackagePlacement[]) {
  return stackGraphOf(placements, Object.fromEntries(placements.map(({ packageInstanceId }) => [packageInstanceId, stackingProfile(20)])))
}

test('a carton loaded before the carton it rests on cannot be loaded in that order: warn with the late support', () => {
  const graph = graphOf([withOrder(placed('UNDER', [300, 0, 0], CARTON), 2), withOrder(placed('ON-TOP', [300, 0, 45], CARTON), 1)])
  expect(loadingOrderIssues(graph)).toStrictEqual([
    { code: 'LOADING_ORDER_INFEASIBLE', severity: 'warning', packageInstanceId: 'ON-TOP', relatedIds: ['UNDER'], params: {} },
  ])
})

/**
 * Hand layout (stop in the id): P1-ON-P3 rests on P3-DEEP, P2-HIGH on P5-BASE and P4-ON-P1 on P1-BASE; the rest are on the
 * floor. P4-ON-P1 ranks above its support when loading and P1-BASE above its load when unloading, so only the support
 * relation keeps them in order. P2-A and P2-B share stop, x and z, so only their IDs order them.
 */
const LAYOUT: Array<[id: string, stop: number, at: Triple]> = [
  ['P3-DEEP', 3, [0, 0, 0]],
  ['P3-NEAR', 3, [240, 0, 0]],
  ['P1-ON-P3', 1, [0, 0, 45]],
  ['P2-DEEP', 2, [0, 60, 0]],
  ['P2-B', 2, [120, 60, 0]],
  ['P2-A', 2, [120, 120, 0]],
  ['P2-HIGH', 2, [120, 180, 45]],
  ['P5-BASE', 5, [120, 180, 0]],
  ['P1-BASE', 1, [240, 60, 0]],
  ['P4-ON-P1', 4, [240, 60, 45]],
]
const LAYOUT_GRAPH = graphOf(LAYOUT.map(([id, , at]) => placed(id, at, CARTON)))
const LAYOUT_STOPS = new Map(LAYOUT.map(([id, stop]) => [id, stop]))

function idsBy(orders: ReturnType<typeof recomputeOrders>, key: 'loadingOrder' | 'unloadingOrder'): string[] {
  return [...orders.orders].sort(([, a], [, b]) => a[key] - b[key]).map(([id]) => id)
}

test('loading order puts supports first, then later stops, deeper (smaller x), lower (smaller z), then by ID', () => {
  // P4-ON-P1 ranks second but waits for P1-BASE, the last floor package ready by priority
  expect(idsBy(recomputeOrders(LAYOUT_GRAPH, LAYOUT_STOPS), 'loadingOrder')).toStrictEqual([
    'P5-BASE',
    'P3-DEEP',
    'P3-NEAR',
    'P2-DEEP',
    'P2-A',
    'P2-B',
    'P2-HIGH',
    'P1-ON-P3',
    'P1-BASE',
    'P4-ON-P1',
  ])
})

test('unloading order takes earlier stops first, only packages nothing still rests on, nearer the door, higher, then by ID', () => {
  // P1-BASE ranks first but waits under P4-ON-P1; P2-HIGH (x 120, z 45) comes before P2-A/P2-B (x 120, z 0)
  expect(idsBy(recomputeOrders(LAYOUT_GRAPH, LAYOUT_STOPS), 'unloadingOrder')).toStrictEqual([
    'P1-ON-P3',
    'P2-HIGH',
    'P2-A',
    'P2-B',
    'P2-DEEP',
    'P3-NEAR',
    'P3-DEEP',
    'P4-ON-P1',
    'P1-BASE',
    'P5-BASE',
  ])
})

test('orders recomputed on 50 random stacked layouts never warn, never unload a package under another, and repeat exactly', () => {
  const random = seededRandom(2_026)
  const sizes: Triple[] = [[40, 30, 25], [60, 40, 30], [80, 60, 40]]
  let supportEdges = 0
  for (let layout = 0; layout < 50; layout += 1) {
    const placements: PackagePlacement[] = []
    const stops = new Map<string, number>()
    for (let index = 0; index < 30; index += 1) {
      const id = `L${layout}-P${String(index).padStart(2, '0')}`
      placements.push(dropAt(id, [10 * Math.floor(random() * 9), 10 * Math.floor(random() * 6)], sizes[index % 3] as Triple, placements))
      stops.set(id, 1 + Math.floor(random() * 4))
    }
    const graph = graphOf(placements)
    const recomputed = recomputeOrders(graph, stops)
    expect(recomputeOrders(graph, stops)).toStrictEqual(recomputed)

    const reordered = placements.map((placement) => ({ ...placement, ...recomputed.orders.get(placement.packageInstanceId) }))
    expect(loadingOrderIssues(graphOf(reordered))).toStrictEqual([])
    for (const [upperId, edges] of graph.supports) {
      for (const { id } of edges) {
        supportEdges += 1
        expect(recomputed.orders.get(upperId)?.unloadingOrder).toBeLessThan(recomputed.orders.get(id)?.unloadingOrder ?? 0)
      }
    }
  }
  // the layouts must really stack, or "never warns" proves nothing
  expect(supportEdges).toBeGreaterThan(50 * 20)
})

test('faces touching only on the side never support each other, and a stack touching through drift supports one way only', () => {
  // LOWER x 0..120, top at 100.4 + 120.7 = 221.10000000000002; UPPER sits at 221.1; SIDE touches LOWER's x = 120 face
  const lower = placed('LOWER', [0, 0, 100.4], [120, 60, 120.7])
  const upper = placed('UPPER', [0, 0, 221.1], [120, 60, 30])
  const side = placed('SIDE', [120, 0, 100.4], [120, 60, 120.7])
  const graph = graphOf([withOrder(lower, 3), withOrder(upper, 2), withOrder(side, 1)])
  expect(loadingOrderIssues(graph).map(({ packageInstanceId, relatedIds }) => [packageInstanceId, relatedIds])).toStrictEqual([
    ['UPPER', ['LOWER']],
  ])
  const { orders } = recomputeOrders(graph, new Map([['LOWER', 1], ['UPPER', 1], ['SIDE', 1]]))
  expect(orders.get('LOWER')?.loadingOrder).toBeLessThan(orders.get('UPPER')?.loadingOrder ?? 0)
})

test('supports loaded earlier raise nothing; a support sharing the step of the package on it is not earlier', () => {
  const under = placed('UNDER', [300, 0, 0], CARTON)
  const onTop = placed('ON-TOP', [300, 0, 45], CARTON)
  expect(loadingOrderIssues(graphOf([withOrder(under, 1), withOrder(onTop, 2)]))).toStrictEqual([])
  expect(loadingOrderIssues(graphOf([withOrder(under, 3), withOrder(onTop, 3)])).map(({ packageInstanceId }) => packageInstanceId)).toStrictEqual([
    'ON-TOP',
  ])
})
