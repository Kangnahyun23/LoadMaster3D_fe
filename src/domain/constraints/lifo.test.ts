import { expect, test } from 'vitest'
import { SPEC_CARTON_A_PLACEMENT, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import { createPlacementLayout, lifoIssues } from '@/domain/constraints'
import type { PackagePlacement } from '@/domain/models'

type Triple = [number, number, number]

/** A contract placement with its own id, position (x, y, z) and placed size (l, w, h) in cm. */
function placed(packageInstanceId: string, [xCm, yCm, zCm]: Triple, [placedLengthCm, placedWidthCm, placedHeightCm]: Triple) {
  return { ...SPEC_CARTON_A_PLACEMENT, packageInstanceId, xCm, yCm, zCm, placedLengthCm, placedWidthCm, placedHeightCm }
}

/** Delivery stop by instance id: package PKG-00n is delivered at stop n. */
const DELIVERY_STOPS: ReadonlyMap<string, number> = new Map([
  ['PKG-001-01', 1],
  ['PKG-002-01', 2],
  ['PKG-002-02', 2],
  ['PKG-003-01', 3],
  ['PKG-003-02', 3],
])

/** LIFO issues of `subject` in Truck 6m holding it and then `others`, in that layout order. */
function lifoAmong(subject: PackagePlacement, others: PackagePlacement[], enforceLifo = true) {
  const layout = createPlacementLayout(SPEC_TRUCK_6M, [subject, ...others])
  return lifoIssues(subject, { deliveryStopByInstanceId: DELIVERY_STOPS, enforceLifo }, layout)
}

/** PKG-002-01 on the floor at x 300..420: its rear face, seen from the door at x = 420, is y 0..60 × z 0..50 = 3,000 cm². */
const SUBJECT = placed('PKG-002-01', [300, 0, 0], [120, 60, 50])

test('a later-stop package right behind the rear face that covers all of it blocks the package: an error under enforceLifo', () => {
  const blocker = placed('PKG-003-01', [420, 0, 0], [120, 60, 50])
  expect(lifoAmong(SUBJECT, [blocker])).toStrictEqual([
    {
      code: 'LIFO_BLOCKED',
      severity: 'error',
      packageInstanceId: 'PKG-002-01',
      relatedIds: ['PKG-003-01'],
      params: { coverage: 1 },
    },
  ])
})

test('a later pallet covering y 24..60 × z 0..50 of the 60 × 50 cm rear face is a partial block: a warning with coverage 0.6', () => {
  // the pallet section y 24..124 × z 0..100 is clipped to the rear face: 36 × 50 = 1,800 of 3,000 cm²; the 30 cm gap does not matter
  const pallet = placed('PKG-003-01', [450, 24, 0], [100, 100, 100])
  expect(lifoAmong(SUBJECT, [pallet])).toStrictEqual([
    {
      code: 'LIFO_PARTIAL',
      severity: 'warning',
      packageInstanceId: 'PKG-002-01',
      relatedIds: ['PKG-003-01'],
      params: { coverage: 0.6 },
    },
  ])
})

test('two adjacent later packages that together cover the whole rear face block it, listed in layout order', () => {
  const far = placed('PKG-003-02', [480, 30, 0], [60, 30, 50]) // y 30..60, 60 cm behind the rear face
  const near = placed('PKG-003-01', [420, 0, 0], [120, 30, 50]) // y 0..30, flush with the rear face
  expect(lifoAmong(SUBJECT, [far, near])).toStrictEqual([
    {
      code: 'LIFO_BLOCKED',
      severity: 'error',
      packageInstanceId: 'PKG-002-01',
      relatedIds: ['PKG-003-02', 'PKG-003-01'],
      params: { coverage: 1 },
    },
  ])
})

test('packages for the same stop or an earlier stop never block, even when they cover the whole rear face', () => {
  const behind = (packageInstanceId: string) => placed(packageInstanceId, [420, 0, 0], [120, 60, 50])
  expect([lifoAmong(SUBJECT, [behind('PKG-002-02')]), lifoAmong(SUBJECT, [behind('PKG-001-01')])]).toStrictEqual([[], []])
})

test('with enforceLifo = false a full block is only a warning, and a partial block stays a warning', () => {
  const fullCover = placed('PKG-003-01', [420, 0, 0], [120, 60, 50])
  const partialCover = placed('PKG-003-01', [450, 24, 0], [100, 100, 100])
  const severities = [fullCover, partialCover].map((blocker) =>
    lifoAmong(SUBJECT, [blocker], false).map(({ code, severity }) => [code, severity]),
  )
  expect(severities).toStrictEqual([[['LIFO_BLOCKED', 'warning']], [['LIFO_PARTIAL', 'warning']]])
})

test('blockers overlapping each other seen from the door count once: 1,800 + 1,200 − 600 = 2,400 of 3,000 cm² is 0.8, not a full block', () => {
  const near = placed('PKG-003-01', [420, 0, 0], [60, 36, 50]) // y 0..36
  const far = placed('PKG-003-02', [480, 24, 0], [60, 24, 50]) // y 24..48, right behind the near one: both hide y 24..36
  expect(lifoAmong(SUBJECT, [near, far]).map(({ code, params }) => [code, params.coverage])).toStrictEqual([['LIFO_PARTIAL', 0.8]])
})

test('a later package starting at x = 221.1 still blocks a package whose rear face computes to 100.4 + 120.7 = 221.10000000000002', () => {
  const subject = placed('PKG-002-01', [100.4, 100, 0], [120.7, 60, 50])
  const blocker = placed('PKG-003-01', [221.1, 100, 0], [120, 60, 50])
  expect(lifoAmong(subject, [blocker]).map(({ code }) => code)).toStrictEqual(['LIFO_BLOCKED'])
})

test('two later packages tiling the rear face block it with coverage exactly 1, even when the ratio computes to 0.9999999999999999', () => {
  // the rear face spans y 60.1..180.3; the blockers span y 60.1..160.1 and 160.1..160.1 + 20.2, which is 180.29999999999998
  const subject = placed('PKG-002-01', [300, 60.1, 0], [120, 120.2, 50])
  const wide = placed('PKG-003-01', [420, 60.1, 0], [120, 100, 50])
  const narrow = placed('PKG-003-02', [420, 160.1, 0], [120, 20.2, 50])
  expect(lifoAmong(subject, [wide, narrow])).toStrictEqual([
    {
      code: 'LIFO_BLOCKED',
      severity: 'error',
      packageInstanceId: 'PKG-002-01',
      relatedIds: ['PKG-003-01', 'PKG-003-02'],
      params: { coverage: 1 },
    },
  ])
})

test('a package missing from the delivery stop table is not judged, and blocks nobody', () => {
  const layout = createPlacementLayout(SPEC_TRUCK_6M, [SUBJECT, placed('PKG-003-01', [420, 0, 0], [120, 60, 50])])
  const withoutStopOf = (missingId: string) => ({
    deliveryStopByInstanceId: new Map([...DELIVERY_STOPS].filter(([id]) => id !== missingId)),
    enforceLifo: true,
  })
  const issues = [withoutStopOf('PKG-002-01'), withoutStopOf('PKG-003-01')].map((rules) => lifoIssues(SUBJECT, rules, layout))
  expect(issues).toStrictEqual([[], []])
})
