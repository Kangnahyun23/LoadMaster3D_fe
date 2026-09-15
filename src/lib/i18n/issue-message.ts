import type { ConstraintIssue } from '@/domain/constraints'
import type { Formatter } from '@/lib/format'
import type { MessageKey, TFunction } from './types'

const FIELD_LABELS = {
  innerLengthCm: 'fields.innerLengthCm',
  innerWidthCm: 'fields.innerWidthCm',
  innerHeightCm: 'fields.innerHeightCm',
  doorWidthCm: 'fields.doorWidthCm',
  doorHeightCm: 'fields.doorHeightCm',
  lengthCm: 'fields.lengthCm',
  widthCm: 'fields.widthCm',
  heightCm: 'fields.heightCm',
} as const satisfies Record<string, MessageKey>

/**
 * Câu hiển thị cho một issue của `@/domain/constraints` (D-28): domain chỉ trả mã + số thô,
 * ở đây chọn câu theo ngôn ngữ của `t` và format số theo `format`.
 *
 * Issue thiếu dữ liệu mà câu cần (mã kiện, kiện liên quan, trường) là lỗi của nơi tạo issue → `throw`,
 * không in câu thiếu chủ ngữ.
 */
export function formatIssue(issue: ConstraintIssue, t: TFunction, format: Formatter): string {
  switch (issue.code) {
    case 'DIMENSION_NOT_POSITIVE': {
      const field = fieldLabel(issue, t)
      const { params } = issue
      if (params.entity === 'vehicle') return t('issues.DIMENSION_NOT_POSITIVE.vehicle', { field })
      if (params.entity === 'obstacle') {
        return t('issues.DIMENSION_NOT_POSITIVE.obstacle', { field, obstacleId: params.obstacleId })
      }
      return t('issues.DIMENSION_NOT_POSITIVE.package', { field, packageId: params.packageId })
    }
    case 'DOOR_EXCEEDS_INNER':
      return t(`issues.DOOR_EXCEEDS_INNER.${issue.params.axis}`, {
        doorCm: format.length(issue.params.doorCm),
        innerCm: format.length(issue.params.innerCm),
      })
    case 'NO_ALLOWED_ORIENTATION':
      return t('issues.NO_ALLOWED_ORIENTATION', { packageId: issue.params.packageId })
    case 'PAYLOAD_EXCEEDED':
    case 'MUST_LOAD_PAYLOAD_EXCEEDED':
      return t(`issues.${issue.code}`, {
        totalKg: format.weight(issue.params.totalKg),
        maxPayloadKg: format.weight(issue.params.maxPayloadKg),
      })
    case 'DOOR_TOO_SMALL':
      return t('issues.DOOR_TOO_SMALL', {
        packageId: issue.params.packageId,
        door: format.widthByHeight(issue.params.doorWidthCm, issue.params.doorHeightCm),
      })
    case 'EXCEEDS_BOUNDARY':
      return t(`issues.EXCEEDS_BOUNDARY.${issue.params.axis}.${issue.params.side}`, {
        id: subjectOf(issue),
        overCm: format.length(issue.params.overCm),
      })
    case 'OVERLAP':
    case 'NOT_STACKABLE':
    case 'LOADING_ORDER_INFEASIBLE':
      return t(`issues.${issue.code}`, { id: subjectOf(issue), related: relatedOf(issue, format) })
    case 'OBSTACLE_OVERLAP':
    case 'NON_BEARING_SUPPORT':
      return t(`issues.${issue.code}`, { id: subjectOf(issue), obstacleId: issue.params.obstacleId })
    case 'SUPPORT_BELOW_MIN':
      return t('issues.SUPPORT_BELOW_MIN', {
        id: subjectOf(issue),
        ratio: format.ratio(issue.params.ratio),
        required: format.ratio(issue.params.required),
      })
    case 'TOP_LOAD_EXCEEDED':
      return t('issues.TOP_LOAD_EXCEEDED', {
        id: subjectOf(issue),
        loadKg: format.weight(issue.params.loadKg),
        maxKg: format.weight(issue.params.maxKg),
      })
    case 'STACK_COUNT_EXCEEDED':
      return t('issues.STACK_COUNT_EXCEEDED', {
        id: subjectOf(issue),
        layers: format.integer(issue.params.layers),
        maxStackCount: format.integer(issue.params.maxStackCount),
      })
    case 'LIFO_BLOCKED':
      return t('issues.LIFO_BLOCKED', { id: subjectOf(issue) })
    case 'LIFO_PARTIAL':
      return t('issues.LIFO_PARTIAL', { id: subjectOf(issue), coverage: format.percent(issue.params.coverage * 100) })
    case 'COG_LATERAL':
      return t('issues.COG_LATERAL', {
        offsetCm: format.length(issue.params.offsetCm),
        limitCm: format.length(issue.params.limitCm),
      })
    case 'COG_HIGH':
      return t('issues.COG_HIGH', {
        heightCm: format.length(issue.params.heightCm),
        limitCm: format.length(issue.params.limitCm),
      })
    case 'MUST_LOAD_UNPLACED':
      return t('issues.MUST_LOAD_UNPLACED', { packageId: issue.params.packageId })
    case 'DUPLICATE_INSTANCE_ID':
      return t('issues.DUPLICATE_INSTANCE_ID', {
        id: subjectOf(issue),
        occurrences: format.integer(issue.params.occurrences),
        related: relatedOf(issue, format),
      })
    case 'ORIENTATION_MISMATCH':
      return t('issues.ORIENTATION_MISMATCH', { id: subjectOf(issue), orientation: issue.params.orientation })
    default:
      return unreachable(issue)
  }
}

/** Thêm mã vào `CONSTRAINT_CODES` mà chưa có câu thì `tsc -b` báo lỗi ở đây. */
function unreachable(issue: never): never {
  throw new Error(`Chưa có câu cho issue ${JSON.stringify(issue)}`)
}

function subjectOf(issue: ConstraintIssue): string {
  if (issue.packageInstanceId === undefined) throw new Error(`Issue ${issue.code} thiếu packageInstanceId`)
  return issue.packageInstanceId
}

function relatedOf(issue: ConstraintIssue, format: Formatter): string {
  if (!issue.relatedIds?.length) throw new Error(`Issue ${issue.code} thiếu relatedIds`)
  return format.list(issue.relatedIds)
}

function hasLabel(field: string | undefined): field is keyof typeof FIELD_LABELS {
  return field !== undefined && Object.hasOwn(FIELD_LABELS, field)
}

function fieldLabel(issue: ConstraintIssue, t: TFunction): string {
  if (!hasLabel(issue.field)) throw new Error(`Issue ${issue.code} có trường không có nhãn: ${String(issue.field)}`)
  return t(FIELD_LABELS[issue.field])
}
