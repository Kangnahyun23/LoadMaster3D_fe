/**
 * Tối ưu chất xếp qua interface `OptimizationService` (Spec mục 11, D-30). UI không import file bên trong thư mục này.
 */
export { runMockOptimization, type MockRunOptions } from './mock-optimization'
export { MockOptimizationService } from './MockOptimizationService'
export type { OptimizationProgress, OptimizationService, OptimizeOptions } from './OptimizationService'
