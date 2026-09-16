import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { VehicleConfig } from '@/domain/models'
import type { ScenePlacement } from './scene-input'
import { SceneCanvas } from './scene/SceneCanvas'
import { usePerformanceFlags } from './usePerformanceFlags'
import { debugQualityTier } from './viewer-options'

const NO_PLACEMENTS: readonly ScenePlacement[] = []
const noop = () => {}

/**
 * Xem trước thùng xe và vật cản ở form xe (LM-042). Cùng `SceneCanvas` với Planner, kho và tài xế, không có kiện:
 * tier `low` (trừ khi `?debug&quality=` khoá tier khác), không cabin, camera chỉ canh lại theo `frameVehicle`.
 * `fleet` lazy-load component này; phần theo dõi form, debounce và kiểm hợp lệ nằm ở `fleet/VehiclePreview.tsx`.
 */
export function VehiclePreviewViewer({ vehicle, frameVehicle, highlightedObstacleId, onObstacleSelect }: {
  vehicle: VehicleConfig
  frameVehicle: VehicleConfig
  highlightedObstacleId: string | null
  onObstacleSelect: (id: string | null) => void
}) {
  const [search] = useSearchParams()
  const flags = usePerformanceFlags(debugQualityTier(search) ?? 'low', 'fleet')
  const model = useMemo(() => ({ vehicle, stops: [], placements: NO_PLACEMENTS }), [vehicle])
  return <SceneCanvas experience="fleet" model={model} placements={NO_PLACEMENTS} flags={flags} preset="goc-cheo"
    selectedId={null} onSelect={noop} step={0} animateLoading={false} decoration={false}
    frameVehicle={frameVehicle} highlightedObstacleId={highlightedObstacleId} onObstacleSelect={onObstacleSelect} />
}
