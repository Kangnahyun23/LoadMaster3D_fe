import { handleWorkerRequest, type WorkerRequest, type WorkerResponse } from './worker-protocol'

/** Phạm vi global của dedicated worker mà file này dùng (tsconfig app dùng lib DOM, không có lib WebWorker). */
type WorkerScope = {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null
  postMessage(message: WorkerResponse): void
}

const scope = self as unknown as WorkerScope

scope.onmessage = (event) => handleWorkerRequest(event.data, (response) => scope.postMessage(response))
