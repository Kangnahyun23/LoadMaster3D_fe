import type { z } from 'zod'
import { gt } from '@/domain/geometry'
import { finiteNumber, flag, listOf, nonNegative, objectOf, oneOf, positive, ratio, text } from './fields'
import { report, rule, type ModelIssueCode } from './issue-codes'

export const orientationCodeSchema = oneOf(['LWH', 'LHW', 'WLH', 'WHL', 'HLW', 'HWL'])

/** Hướng giữ nguyên chiều cao H ở trục Z (Spec 6: keepUpright). LM-012 đưa ra dùng chung khi có `isUpright`. */
const UPRIGHT_ORIENTATIONS: readonly OrientationCode[] = ['LWH', 'WLH']

const fragilityLevelSchema = oneOf(['NONE', 'LOW', 'MEDIUM', 'HIGH'])

const dimensionCm = positive('package.dimension.positive')

/** Số đếm nguyên bắt đầu từ 1 (số kiện, số tầng, điểm giao). */
function countFromOne(integerCode: ModelIssueCode, minCode: ModelIssueCode) {
  return finiteNumber().int(rule(integerCode)).min(1, rule(minCode))
}

export const cargoPackageSchema = objectOf({
  id: text(),
  name: text(),
  lengthCm: dimensionCm,
  widthCm: dimensionCm,
  heightCm: dimensionCm,
  weightKg: nonNegative('package.weightKg.nonNegative'),
  quantity: countFromOne('package.quantity.integer', 'package.quantity.min'),
  allowedOrientations: listOf(orientationCodeSchema)
    .min(1, rule('package.allowedOrientations.empty'))
    .superRefine((codes, ctx) => {
      codes.forEach((code, index) => {
        if (codes.indexOf(code) !== index) report(ctx, 'package.allowedOrientations.duplicate', [index])
      })
    }),
  keepUpright: flag(),
  fragilityLevel: fragilityLevelSchema,
  stackable: flag(),
  maxTopLoadKg: nonNegative('package.maxTopLoadKg.nonNegative'),
  maxStackCount: countFromOne('package.maxStackCount.integer', 'package.maxStackCount.min').optional(),
  minSupportRatio: ratio('package.minSupportRatio.range'),
  deliveryStop: countFromOne('package.deliveryStop.integer', 'package.deliveryStop.min'),
  priority: finiteNumber(),
  mustLoad: flag(),
  groupId: text().optional(),
  notes: text().optional(),
}).superRefine((pkg, ctx) => {
  // D-25: schema từ chối dữ liệu xung đột; tự đồng bộ là việc của form (LM-045)
  if (pkg.keepUpright) {
    pkg.allowedOrientations.forEach((code, index) => {
      if (!UPRIGHT_ORIENTATIONS.includes(code)) report(ctx, 'package.keepUpright.orientation', ['allowedOrientations', index])
    })
  }
  if (!pkg.stackable && gt(pkg.maxTopLoadKg, 0)) report(ctx, 'package.maxTopLoadKg.notStackable', ['maxTopLoadKg'])
})

export type OrientationCode = z.infer<typeof orientationCodeSchema>
export type FragilityLevel = z.infer<typeof fragilityLevelSchema>
export type CargoPackage = z.infer<typeof cargoPackageSchema>
