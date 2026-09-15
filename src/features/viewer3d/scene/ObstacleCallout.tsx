import type { VehicleObstacle } from '@/domain/models'
import { useObstacleText } from '../overlays/useObstacleText'
import { SceneCallout } from './SceneCallout'
import { obstacleCenter, obstacleSize } from './units'

/** Thông tin vật cản vừa bấm, neo trên đỉnh vật cản (LM-033): loại, mã, góc, kích thước cm, chịu tải. */
export function ObstacleCallout({ obstacle }: { obstacle: VehicleObstacle }) {
  const text = useObstacleText()
  const [cx, cy, cz] = obstacleCenter(obstacle)
  const [, height] = obstacleSize(obstacle)
  return <SceneCallout position={[cx, cy + height / 2, cz]} offset={[0, -110]} width={240}>
    <span data-obstacle-callout={obstacle.id}
      className="inline-block rounded-sm border border-border bg-bg px-2 py-1 text-left text-body-lg text-text xl:text-caption">
      <span className="block font-medium">{text.type(obstacle)} · <span className="font-mono">{obstacle.id}</span></span>
      <span className="block font-mono">{text.size(obstacle)}</span>
      <span className="block font-mono">{text.corner(obstacle)}</span>
      <span className="block">{text.bearing(obstacle)}</span>
    </span>
  </SceneCallout>
}
