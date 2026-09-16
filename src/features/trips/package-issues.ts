import { checkDoorClearance, validatePackages, type ConstraintIssue } from '@/domain/constraints'
import type { CargoPackage, VehicleConfig } from '@/domain/models'

/**
 * Lỗi và cảnh báo của từng dòng kiện cho bảng kiện và panel form (LM-044, LM-045): luật dữ liệu kiện
 * (`validatePackages`) cộng mặt cắt cửa của xe đang gán (`checkDoorClearance`). Lỗi của cả request (trùng mã
 * instance) gom vào `all` chứ không gán cho một kiện.
 */
export type PackageIssues = {
  readonly byPackageId: ReadonlyMap<string, readonly ConstraintIssue[]>
  readonly all: readonly ConstraintIssue[]
  readonly errorCount: number
  readonly warningCount: number
}

export function packageIssues(packages: readonly CargoPackage[], vehicle: VehicleConfig): PackageIssues {
  const all = [
    ...validatePackages(packages),
    ...packages.flatMap((pkg) => checkDoorClearance(pkg, vehicle)),
  ]
  const byPackageId = new Map<string, ConstraintIssue[]>()
  for (const issue of all) {
    const params: Readonly<Record<string, unknown>> = issue.params
    const id = typeof params.packageId === 'string' ? params.packageId : undefined
    if (id === undefined) continue
    const own = byPackageId.get(id)
    if (own) own.push(issue)
    else byPackageId.set(id, [issue])
  }
  return {
    byPackageId,
    all,
    errorCount: all.filter(({ severity }) => severity === 'error').length,
    warningCount: all.filter(({ severity }) => severity === 'warning').length,
  }
}
