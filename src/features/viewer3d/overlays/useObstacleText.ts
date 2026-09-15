import type { VehicleObstacle } from '@/domain/models'
import { useFormat, useT } from '@/lib/i18n'

/** Câu chữ về một vật cản cho nhãn 3D, danh sách `sr-only` và chú giải — một nguồn để ba nơi nói giống nhau (LM-033). */
export function useObstacleText() {
  const t = useT()
  const format = useFormat()
  const type = (o: VehicleObstacle) => t(`viewer.obstacles.types.${o.type}` as const)
  const size = (o: VehicleObstacle) => format.dimensions(o.lengthCm, o.widthCm, o.heightCm)
  const corner = (o: VehicleObstacle) =>
    t('viewer.obstacles.corner', { x: format.length(o.xCm), y: format.length(o.yCm), z: format.length(o.zCm) })
  const bearing = (o: VehicleObstacle) => !o.loadBearing ? t('viewer.obstacles.notBearing')
    : o.maxTopLoadKg === undefined ? t('viewer.obstacles.bearing')
      : t('viewer.obstacles.bearingMax', { maxLoad: format.weight(o.maxTopLoadKg) })
  const description = (o: VehicleObstacle) =>
    t('viewer.obstacles.description', { type: type(o), id: o.id, corner: corner(o), size: size(o), bearing: bearing(o) })
  return { t, type, size, corner, bearing, description }
}
