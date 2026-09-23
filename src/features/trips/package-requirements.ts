import { effectiveOrientations } from '@/domain/geometry'
import type { CargoPackage } from '@/domain/models'

/** Mã chip "Yêu cầu" của bảng kiện (V2) — UI dịch qua `trips.packages.req.<mã>`. */
export type PackageRequirement = 'fragile' | 'fragileMedium' | 'upright' | 'noStack' | 'anyOrientation'

/** Tổng số hướng đặt của Spec (LWH … HWL). */
const ALL_ORIENTATIONS = 6

/** "Dễ vỡ" là mức Cao: bộ lọc "Chỉ hàng dễ vỡ" và dòng cảnh báo ở cột phải dùng chung định nghĩa này. */
export function isFragile(pkg: Pick<CargoPackage, 'fragilityLevel'>): boolean {
  return pkg.fragilityLevel === 'HIGH'
}

/**
 * Yêu cầu xếp của một kiện, theo thứ tự quan trọng khi xếp: mức dễ vỡ, giữ đứng, không xếp chồng, rồi "được xoay" khi mọi hướng
 * đều cho phép (không có ràng buộc hướng nào). Chỉ suy từ trường của kiện, không có số nào ngoài dữ liệu.
 */
export function packageRequirements(pkg: CargoPackage): PackageRequirement[] {
  const requirements: PackageRequirement[] = []
  if (isFragile(pkg)) requirements.push('fragile')
  else if (pkg.fragilityLevel === 'MEDIUM') requirements.push('fragileMedium')
  if (pkg.keepUpright) requirements.push('upright')
  if (!pkg.stackable) requirements.push('noStack')
  if (effectiveOrientations(pkg).length === ALL_ORIENTATIONS) requirements.push('anyOrientation')
  return requirements
}
