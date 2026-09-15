import type { ConstraintIssue } from '@/domain/constraints'

/**
 * Spec mục 13 theo đúng thứ tự: câu mẫu bản en và issue dựng lại từ chính số liệu trong câu (D-28).
 * Dữ liệu test dùng chung: domain kiểm mã và tham số, i18n (LM-028) kiểm câu tái tạo từng chữ.
 */
export type Spec13Example = { sentence: string; issue: ConstraintIssue }

/** Carton A (cao 45 cm) đặt ở z = 217,5 cm trong Truck 6m: đỉnh 262,5 cm dưới trần 250 cm. */
export const SPEC_13_PKG_004_TOO_TALL: ConstraintIssue<'EXCEEDS_BOUNDARY'> = {
  code: 'EXCEEDS_BOUNDARY',
  severity: 'error',
  packageInstanceId: 'PKG-004',
  params: { axis: 'z', side: 'beyondInterior', overCm: 12.5 },
}

/** PKG-008 (đáy 100 × 50 cm) nhô 38 cm khỏi PKG-009: 62 × 50 cm được đỡ, tỷ lệ 0,62 (dựng hình ở `support.test.ts`). */
export const SPEC_13_PKG_008_LOW_SUPPORT: ConstraintIssue<'SUPPORT_BELOW_MIN'> = {
  code: 'SUPPORT_BELOW_MIN',
  severity: 'warning',
  packageInstanceId: 'PKG-008',
  params: { ratio: 0.62, required: 0.8 },
}

export const SPEC_13_EXAMPLES: readonly Spec13Example[] = [
  {
    sentence: 'Inner length must be greater than 0 cm.',
    issue: { code: 'DIMENSION_NOT_POSITIVE', severity: 'error', field: 'innerLengthCm', params: { entity: 'vehicle' } },
  },
  {
    sentence: 'Door width 250 cm cannot exceed vehicle inner width 240 cm.',
    issue: {
      code: 'DOOR_EXCEEDS_INNER',
      severity: 'error',
      field: 'doorWidthCm',
      params: { axis: 'y', doorCm: 250, innerCm: 240 },
    },
  },
  {
    sentence: 'Package PKG-001 has no allowed orientation.',
    issue: {
      code: 'NO_ALLOWED_ORIENTATION',
      severity: 'error',
      field: 'allowedOrientations',
      params: { packageId: 'PKG-001' },
    },
  },
  {
    sentence: 'Total cargo weight 5,320 kg exceeds vehicle payload 5,000 kg.',
    issue: { code: 'PAYLOAD_EXCEEDED', severity: 'warning', params: { totalKg: 5320, maxPayloadKg: 5000, overKg: 320 } },
  },
  {
    sentence: 'Package PKG-003 cannot pass through the 220 × 230 cm door.',
    issue: { code: 'DOOR_TOO_SMALL', severity: 'error', params: { packageId: 'PKG-003', doorWidthCm: 220, doorHeightCm: 230 } },
  },
  { sentence: 'Placement PKG-004 exceeds vehicle height by 12.5 cm.', issue: SPEC_13_PKG_004_TOO_TALL },
  {
    sentence: 'PKG-006 overlaps PKG-007.',
    issue: { code: 'OVERLAP', severity: 'error', packageInstanceId: 'PKG-006', relatedIds: ['PKG-007'], params: {} },
  },
  { sentence: 'PKG-008 support ratio 0.62 is below the required 0.80.', issue: SPEC_13_PKG_008_LOW_SUPPORT },
]
