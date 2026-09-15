import type { OptimizationRequest, OptimizationResult } from '@/domain/models'
import { runMockOptimization } from './mock-optimization'
import type { OptimizationProgress } from './OptimizationService'

/** Luồng chính → worker. */
export type WorkerRequest = { readonly type: 'start'; readonly request: OptimizationRequest }

/** Worker → luồng chính. */
export type WorkerResponse =
  | { readonly type: 'progress'; readonly progress: OptimizationProgress }
  | { readonly type: 'result'; readonly result: OptimizationResult }
  | { readonly type: 'error'; readonly message: string }

/** Phần của `Worker` mà service dùng — test thay bằng worker giả. */
export type OptimizationWorker = {
  postMessage(message: WorkerRequest): void
  terminate(): void
  onmessage: ((event: { data: WorkerResponse }) => void) | null
  onerror: ((event: unknown) => void) | null
}

/** Việc của worker cho một message, tách khỏi `self` để test không cần Worker thật. */
export function handleWorkerRequest(message: WorkerRequest, post: (response: WorkerResponse) => void): void {
  try {
    const result = runMockOptimization(message.request, { onProgress: (progress) => post({ type: 'progress', progress }) })
    post({ type: 'result', result })
  } catch (error) {
    post({ type: 'error', message: error instanceof Error ? error.message : String(error) })
  }
}
