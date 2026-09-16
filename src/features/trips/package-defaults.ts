import { nextPackageId } from '@/domain/cargo'
import { ORIENTATION_CODES } from '@/domain/geometry'
import type { CargoPackage } from '@/domain/models'

/**
 * Kiện trống cho panel "Thêm kiện" (LM-045): mã kế tiếp của chuyến, sáu hướng được phép, các số để 0 nên schema
 * báo lỗi ngay tại ô cho tới khi người dùng nhập. Không đoán kích thước thay người dùng.
 */
export function emptyPackage(packages: readonly CargoPackage[], deliveryStop: number): CargoPackage {
  return {
    id: nextPackageId(packages.map((pkg) => pkg.id)),
    name: '',
    lengthCm: 0,
    widthCm: 0,
    heightCm: 0,
    weightKg: 0,
    quantity: 1,
    allowedOrientations: [...ORIENTATION_CODES],
    keepUpright: false,
    fragilityLevel: 'NONE',
    stackable: true,
    maxTopLoadKg: 0,
    minSupportRatio: 0.8,
    deliveryStop,
    priority: 0,
    mustLoad: false,
  }
}
