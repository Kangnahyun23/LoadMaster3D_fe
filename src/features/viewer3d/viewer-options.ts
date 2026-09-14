import type { CameraPreset, ColorMode } from '@/types/load-plan'
import type { QualityTier } from './usePerformanceFlags'

export const CAMERA_PRESETS: ReadonlyArray<{ value: CameraPreset; label: string }> = [
  { value: 'truoc', label: 'Trước' },
  { value: 'cua-sau', label: 'Cửa sau' },
  { value: 'ben-hong', label: 'Bên hông' },
  { value: 'tren', label: 'Trên' },
  { value: 'goc-cheo', label: 'Góc chéo' },
]

export const COLOR_MODES: ReadonlyArray<{ value: ColorMode; label: string }> = [
  { value: 'diem-giao', label: 'Theo điểm giao' },
  { value: 'don-hang', label: 'Theo đơn hàng' },
  { value: 'khoi-luong', label: 'Theo khối lượng' },
]

export function debugQualityTier(params: URLSearchParams): QualityTier | undefined {
  if (!params.has('debug')) return undefined
  const quality = params.get('quality')
  return quality === 'high' || quality === 'balanced' || quality === 'low' ? quality : undefined
}
