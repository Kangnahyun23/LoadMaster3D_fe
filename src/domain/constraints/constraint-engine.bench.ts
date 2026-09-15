import { writeFileSync } from 'node:fs'
import { cpus } from 'node:os'
import { expect, test } from 'vitest'
import { createConstraintEngine, type PlacementPose } from '@/domain/constraints'
import { packedPlan } from '@/test/engine-plans'

/**
 * Cổng ngân sách D-29 (LM-023), chạy bằng `pnpm test:bench`. CI chậm và ồn hơn máy dev nên ngưỡng nới 1,5 lần.
 * `BENCH_RECORD=docs/benchmarks/<tên>.json` ghi lại số đo.
 */
const ON_CI = Boolean(process.env.CI)
const BUDGET_MS = { evaluateAll: ON_CI ? 75 : 50, move: ON_CI ? 12 : 8 }
const RUN = { retainSamples: true, time: 0, iterations: 40, warmupIterations: 5 }
const recorded: Record<string, { p50: number; p95: number; p99: number; mean: number; samples: number }> = {}

type Latency = { latency: { samples?: readonly number[]; p50: number; p99: number; mean: number } }

function p95(result: Latency): number {
  const samples = result.latency.samples ?? []
  return samples[Math.ceil(samples.length * 0.95) - 1] ?? Number.POSITIVE_INFINITY
}

function record(name: string, result: Latency): number {
  const value = p95(result)
  const { p50, p99, mean, samples } = result.latency
  recorded[name] = { p50, p95: value, p99, mean, samples: samples?.length ?? 0 }
  const file = process.env.BENCH_RECORD
  if (file) {
    const meta = { recordedAt: new Date().toISOString(), node: process.version, cpu: cpus()[0]?.model, budgetMs: BUDGET_MS }
    writeFileSync(file, `${JSON.stringify({ ...meta, results: recorded }, null, 2)}\n`)
  }
  return value
}

const PLANS = { 132: packedPlan(132), 500: packedPlan(500), 1000: packedPlan(1000) }

test('constraint engine — dựng và kiểm toàn phương án (createConstraintEngine + evaluateAll)', async ({ bench }) => {
  const results = await bench.compare(
    bench('132 kiện', () => void createConstraintEngine(PLANS[132]).evaluateAll()),
    bench('500 kiện', () => void createConstraintEngine(PLANS[500]).evaluateAll()),
    bench('1.000 kiện', () => void createConstraintEngine(PLANS[1000]).evaluateAll()),
    RUN,
  )
  record('evaluateAll 132', results.get('132 kiện'))
  record('evaluateAll 500', results.get('500 kiện'))
  expect(record('evaluateAll 1000', results.get('1.000 kiện'))).toBeLessThanOrEqual(BUDGET_MS.evaluateAll)
})

test('constraint engine 1.000 kiện — một lần thả trong editor', async ({ bench }) => {
  const plan = PLANS[1000]
  const engine = createConstraintEngine(plan)
  // Thùng giữa tầng 3 nhấc lên chỗ trống tầng trên cùng rồi đặt về: kiện phía trên nó mất đỡ, hành lang LIFO đổi
  const moves = plan.placements.filter((_, index) => index % 97 === 250 % 97).slice(0, 8)
  const targets: PlacementPose[] = moves.map((_, index) => ({ xCm: 80 + index * 40, yCm: 180, zCm: 200, orientation: 'LWH' }))
  let step = 0
  const results = await bench.compare(
    bench('evaluateMove', () => {
      const index = step++ % moves.length
      engine.evaluateMove(moves[index]?.packageInstanceId ?? '', targets[index] as PlacementPose)
    }),
    bench('commitMove', () => {
      const index = step++ % (moves.length * 2)
      const placement = moves[Math.floor(index / 2)]
      if (placement === undefined) return
      const pose = index % 2 === 0 ? (targets[Math.floor(index / 2)] as PlacementPose) : placement
      engine.commitMove(placement.packageInstanceId, pose)
    }),
    { ...RUN, iterations: 200 },
  )
  expect({
    evaluateMove: record('evaluateMove 1000', results.get('evaluateMove')) <= BUDGET_MS.move,
    commitMove: record('commitMove 1000', results.get('commitMove')) <= BUDGET_MS.move,
  }).toStrictEqual({ evaluateMove: true, commitMove: true })
})
