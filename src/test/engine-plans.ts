import type { ConstraintEngineInput } from '@/domain/constraints'
import { SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { CargoPackage, PackagePlacement } from '@/domain/models'

const BOX = { lengthCm: 40, widthCm: 30, heightCm: 25 } as const
const PER_ROW = 600 / BOX.lengthCm
const PER_LAYER = PER_ROW * (240 / BOX.widthCm)

/** Hốc bánh xe của Truck 6m: x 0..120, y 0..30, z 0..45 — không đặt thùng chồng lên nó. */
function insideWheelArch(xCm: number, yCm: number, zCm: number): boolean {
  return xCm < 120 && yCm < 30 && zCm < 45
}

/**
 * Phương án tất định gần thật cho benchmark engine (LM-023): `count` thùng 40 × 30 × 25 cm xếp kín từ vách trong ra cửa,
 * từng tầng từ sàn lên, chừa hốc bánh xe. Điểm giao theo độ sâu (sâu nhất là điểm 5), riêng mỗi thùng thứ 37 là điểm 5
 * đặt gần cửa để có vi phạm LIFO thật. Thứ tự xếp đi từ dưới lên nên luôn khả thi.
 */
export function packedPlan(count: number): ConstraintEngineInput {
  const slots: Array<{ xCm: number; yCm: number; zCm: number; stop: number }> = []
  for (let slot = 0; slots.length < count; slot += 1) {
    const xCm = (slot % PER_ROW) * BOX.lengthCm
    const yCm = (Math.floor(slot / PER_ROW) % 8) * BOX.widthCm
    const zCm = Math.floor(slot / PER_LAYER) * BOX.heightCm
    if (zCm + BOX.heightCm > 250) throw new Error(`Truck 6m không chứa nổi ${count} thùng`)
    if (insideWheelArch(xCm, yCm, zCm)) continue
    const stop = slots.length % 37 === 36 ? 5 : 5 - Math.floor(xCm / 120)
    slots.push({ xCm, yCm, zCm, stop })
  }
  const quantityByStop = new Map<number, number>()
  for (const { stop } of slots) quantityByStop.set(stop, (quantityByStop.get(stop) ?? 0) + 1)
  const packages: CargoPackage[] = [...quantityByStop].sort(([a], [b]) => a - b).map(([stop, quantity]) => ({
    id: `PKG-00${stop}`,
    name: `Thùng hàng điểm giao ${stop}`,
    ...BOX,
    weightKg: 12.5,
    quantity,
    allowedOrientations: ['LWH', 'WLH', 'LHW', 'WHL', 'HLW', 'HWL'],
    keepUpright: false,
    fragilityLevel: 'LOW',
    stackable: true,
    maxTopLoadKg: 200,
    maxStackCount: 12,
    minSupportRatio: 0.8,
    deliveryStop: stop,
    priority: 1,
    mustLoad: false,
  }))
  const nextIndex = new Map<number, number>()
  const placements = slots.map(({ xCm, yCm, zCm, stop }, index): PackagePlacement => {
    const n = (nextIndex.get(stop) ?? 0) + 1
    nextIndex.set(stop, n)
    const width = Math.max(2, String(quantityByStop.get(stop)).length)
    return {
      packageInstanceId: `PKG-00${stop}-${String(n).padStart(width, '0')}`,
      orientation: 'LWH',
      xCm,
      yCm,
      zCm,
      placedLengthCm: BOX.lengthCm,
      placedWidthCm: BOX.widthCm,
      placedHeightCm: BOX.heightCm,
      loadingOrder: index + 1,
      unloadingOrder: count - index,
      supportRatio: 1,
      constraintWarnings: [],
    }
  })
  return { vehicle: SPEC_TRUCK_6M, packages, placements, settings: { enforceLifo: true } }
}
