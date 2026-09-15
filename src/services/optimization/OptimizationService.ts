import type { OptimizationRequest, OptimizationResult } from '@/domain/models'

/** Tiến trình xếp: số instance đã xét trên tổng số. */
export type OptimizationProgress = { readonly placed: number; readonly total: number }

export type OptimizeOptions = {
  /** Huỷ job (LM-025: worker bị `terminate`). */
  readonly signal?: AbortSignal
  readonly onProgress?: (progress: OptimizationProgress) => void
}

/**
 * Spec mục 11: UI chỉ biết interface này. Hiện chỉ có `MockOptimizationService`; API thật sau này thay ở tầng `-api.ts`
 * mà không đổi UI. Tham số thứ hai là tuỳ chọn nên vẫn đúng chữ ký `optimize(request)` của Spec.
 */
export interface OptimizationService {
  optimize(request: OptimizationRequest, options?: OptimizeOptions): Promise<OptimizationResult>
}
