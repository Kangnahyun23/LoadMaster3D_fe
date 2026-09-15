import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { SPEC_CARTON_A, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { OptimizationRequest, OptimizationResult } from '@/domain/models'
import {
  createOptimizationService,
  handleWorkerRequest,
  MockOptimizationService,
  OptimizationServiceError,
  runMockOptimization,
  UnavailableOptimizationService,
  WorkerOptimizationService,
  type OptimizationProgress,
  type OptimizationWorker,
  type WorkerRequest,
  type WorkerResponse,
} from '@/services/optimization'

const REQUEST: OptimizationRequest = {
  vehicle: SPEC_TRUCK_6M,
  packages: [SPEC_CARTON_A],
  settings: { method: 'MOCK', timeLimitSeconds: 10, randomSeed: 42, enforceLifo: true, prioritizeLowCenterOfGravity: false },
}
const RESULT: OptimizationResult = runMockOptimization(REQUEST, { clock: () => 0 })

/** Stands in for the browser worker: records what the service sends and lets the test answer. */
class FakeWorker implements OptimizationWorker {
  readonly sent: WorkerRequest[] = []
  terminated = false
  onmessage: ((event: { data: WorkerResponse }) => void) | null = null
  onerror: ((event: unknown) => void) | null = null
  postMessage(message: WorkerRequest): void {
    this.sent.push(message)
  }
  terminate(): void {
    this.terminated = true
  }
  answer(data: WorkerResponse): void {
    this.onmessage?.({ data })
  }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function serviceWith(worker: FakeWorker, minimumLatencyMs = 600) {
  let now = 0
  const clock = () => now
  const advance = async (ms: number) => {
    now += ms
    await vi.advanceTimersByTimeAsync(ms)
  }
  return { service: new WorkerOptimizationService({ createWorker: () => worker, minimumLatencyMs, clock }), advance }
}

describe('WorkerOptimizationService', () => {
  test('starts the job in the worker, relays progress, resolves with the result and ends the worker', async () => {
    const worker = new FakeWorker()
    const { service, advance } = serviceWith(worker)
    const progress: OptimizationProgress[] = []
    const pending = service.optimize(REQUEST, { onProgress: (step) => progress.push(step) })
    worker.answer({ type: 'progress', progress: { placed: 2, total: 4 } })
    await advance(700)
    worker.answer({ type: 'result', result: RESULT })
    await advance(0)
    expect({ result: await pending, sent: worker.sent, progress, terminated: worker.terminated }).toStrictEqual({
      result: RESULT,
      sent: [{ type: 'start', request: REQUEST }],
      progress: [{ placed: 2, total: 4 }],
      terminated: true,
    })
  })

  test('a result that arrives early still waits out the 600 ms minimum, so the loading state is visible', async () => {
    const worker = new FakeWorker()
    const { service, advance } = serviceWith(worker)
    let resolved = false
    const pending = service.optimize(REQUEST).then(() => (resolved = true))
    await advance(100)
    worker.answer({ type: 'result', result: RESULT })
    await advance(499)
    const beforeMinimum = resolved
    await advance(1)
    await pending
    expect({ beforeMinimum, afterMinimum: resolved }).toStrictEqual({ beforeMinimum: false, afterMinimum: true })
  })

  test('aborting mid-job rejects with the abort reason, ends the worker and ignores a late result', async () => {
    const worker = new FakeWorker()
    const { service, advance } = serviceWith(worker)
    const controller = new AbortController()
    const outcome = service.optimize(REQUEST, { signal: controller.signal }).catch((error: unknown) => error)
    controller.abort(new Error('người dùng huỷ'))
    const terminatedOnAbort = worker.terminated
    worker.answer({ type: 'result', result: RESULT })
    await advance(1000)
    expect({ reason: ((await outcome) as Error).message, terminatedOnAbort }).toStrictEqual({ reason: 'người dùng huỷ', terminatedOnAbort: true })
  })

  test('a job running past settings.timeLimitSeconds rejects with TIME_LIMIT_EXCEEDED and ends the worker', async () => {
    const worker = new FakeWorker()
    const { service, advance } = serviceWith(worker)
    const pending = service.optimize({ ...REQUEST, settings: { ...REQUEST.settings, timeLimitSeconds: 2 } })
    const outcome = pending.catch((error: unknown) => error)
    await advance(2000)
    expect({ code: ((await outcome) as OptimizationServiceError).code, terminated: worker.terminated }).toStrictEqual({ code: 'TIME_LIMIT_EXCEEDED', terminated: true })
  })

  test('a mock error inside the worker rejects with MOCK_FAILED, a crashed worker with WORKER_CRASHED', async () => {
    const failing = new FakeWorker()
    const crashing = new FakeWorker()
    const failed = serviceWith(failing).service.optimize(REQUEST).catch((error: unknown) => (error as OptimizationServiceError).code)
    const crashed = serviceWith(crashing).service.optimize(REQUEST).catch((error: unknown) => (error as OptimizationServiceError).code)
    failing.answer({ type: 'error', message: 'boom' })
    crashing.onerror?.(new Event('error'))
    expect([await failed, await crashed, failing.terminated, crashing.terminated]).toStrictEqual(['MOCK_FAILED', 'WORKER_CRASHED', true, true])
  })
})

test('the worker handler posts progress up to every instance, then the same result the pure mock gives', () => {
  const posted: WorkerResponse[] = []
  handleWorkerRequest({ type: 'start', request: REQUEST }, (response) => posted.push(response))
  const result = posted.at(-1)
  expect({
    lastProgress: posted.filter(({ type }) => type === 'progress').at(-1),
    placements: result?.type === 'result' ? result.result.placements : undefined,
  }).toStrictEqual({ lastProgress: { type: 'progress', progress: { placed: 4, total: 4 } }, placements: RESULT.placements })
})

test('the simulated outage waits like a real call, then rejects with SERVICE_UNAVAILABLE', async () => {
  const outcome = new UnavailableOptimizationService({ minimumLatencyMs: 600 }).optimize(REQUEST).catch((error: unknown) => error)
  await vi.advanceTimersByTimeAsync(600)
  expect(((await outcome) as OptimizationServiceError).code).toBe('SERVICE_UNAVAILABLE')
})

describe('createOptimizationService', () => {
  test('runs on the calling thread where there is no Worker (tests, jsdom)', () => {
    expect(createOptimizationService()).toBeInstanceOf(MockOptimizationService)
  })

  test('uses a Web Worker where the browser has one, and the outage service when a failure is simulated', () => {
    vi.stubGlobal('Worker', class {})
    try {
      expect([createOptimizationService(), createOptimizationService({ simulateFailure: true })].map((service) => service.constructor.name)).toStrictEqual([
        'WorkerOptimizationService',
        'UnavailableOptimizationService',
      ])
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
