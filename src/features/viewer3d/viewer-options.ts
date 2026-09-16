import type { CameraPreset, ColorMode } from '@/features/viewer3d/viewer-types'
import type { QualityTier } from './usePerformanceFlags'

/** Nhãn nằm ở `viewer.camera.<preset>` và `viewer.colorModes.<mode>` của từ điển (LM-070). */
export const CAMERA_PRESETS: readonly CameraPreset[] = ['truoc', 'cua-sau', 'ben-hong', 'tren', 'goc-cheo']

export const COLOR_MODES: readonly ColorMode[] = ['diem-giao', 'kien-goc', 'khoi-luong']

export function debugQualityTier(params: URLSearchParams): QualityTier | undefined {
  if (!params.has('debug')) return undefined
  const quality = params.get('quality')
  return quality === 'high' || quality === 'balanced' || quality === 'low' ? quality : undefined
}
