import type { Formatter } from '@/lib/format'
import type { TFunction } from '@/lib/i18n'
import { DELIVERY_ISSUE_KINDS, type AuditEvent } from '@/lib/mock-db'
import { ROLES } from '@/types/user'

/** Tên hiện của đối tượng trong kho lúc đọc nhật ký: mã → tên. Đối tượng đã xoá không có ở đây. */
export type AuditDirectory = {
  readonly users: ReadonlyMap<string, string>
  readonly trips: ReadonlyMap<string, string>
  readonly vehicles: ReadonlyMap<string, string>
}

/** Một dòng nhật ký đã dịch cho bảng `/nhat-ky` (LM-091). */
export type AuditRow = {
  readonly id: string
  /** ISO 8601, giữ nguyên để sắp xếp; ô bảng format theo ngôn ngữ. */
  readonly at: string
  readonly actorId: string | null
  readonly actor: string
  readonly action: string
  /** `label` vắng khi kho không còn tên (email lạ khi đăng nhập sai); `href` vắng khi đối tượng không còn trang để mở. */
  readonly target: { readonly id: string; readonly label: string | null; readonly href: string | null }
  readonly details: string
}

/** Tham số kho ghi (`ctx.log`) có nhãn trong từ điển `audit.log.params`. */
const PARAM_KEYS = [
  'name', 'fullName', 'role', 'email', 'fields', 'reason', 'note', 'revisionId', 'sourceRevisionId', 'placed', 'unplaced', 'edits',
  'loaded', 'missing', 'packageInstanceId', 'stopNumber', 'kind', 'stops', 'issues',
] as const

const FIELD_NAMES = [
  'name', 'vehicleId', 'stops', 'packages', 'scheduledDate', 'driverId', 'fullName', 'email', 'phone', 'role', 'depot',
] as const

const REASONS = ['suspended'] as const

function isOneOf<const Values extends readonly string[]>(values: Values, value: string): value is Values[number] {
  return values.includes(value)
}

/**
 * Đọc một sự kiện nhật ký (D-43) bằng ngôn ngữ đang chọn: người làm, hành động (`audit.actions.*`), đối tượng (tên hiện tại, liên kết
 * nếu còn trang), chi tiết (tham số đã dịch và format). Hàm thuần: `directory` do `audit-api.ts` đọc từ kho.
 */
export function describeEvent(event: AuditEvent, directory: AuditDirectory, t: TFunction, format: Formatter): AuditRow {
  return {
    id: event.id,
    at: event.at,
    actorId: event.actorId,
    actor: actorLabel(event, directory, t),
    action: t(`audit.actions.${event.action}`),
    target: targetOf(event, directory),
    details: Object.entries(event.params)
      .map(([key, value]) => t('audit.log.detail', { label: paramLabel(key, t), value: paramValue(event, key, value, t, format) }))
      .join(' · '),
  }
}

function actorLabel({ actorId, action }: AuditEvent, directory: AuditDirectory, t: TFunction): string {
  if (actorId === null) return action === 'auth.signInFailed' ? t('audit.log.anonymous') : t('audit.log.system')
  return directory.users.get(actorId) ?? t('audit.log.deletedUser', { id: actorId })
}

function targetOf({ target, params }: AuditEvent, directory: AuditDirectory): AuditRow['target'] {
  const saved = typeof params.name === 'string' ? params.name : typeof params.fullName === 'string' ? params.fullName : null
  const id = target.id
  switch (target.type) {
    case 'trip': {
      const name = directory.trips.get(id)
      return { id, label: name ?? saved, href: name === undefined ? null : `/chuyen/${encodeURIComponent(id)}` }
    }
    case 'vehicle': {
      const name = directory.vehicles.get(id)
      return { id, label: name ?? saved, href: name === undefined ? null : `/doi-xe/${encodeURIComponent(id)}` }
    }
    case 'user': {
      const name = directory.users.get(id)
      // Người dùng chưa có trang riêng: mở danh sách lọc đúng mã đó
      return { id, label: name ?? saved, href: name === undefined ? null : `/nguoi-dung?q=${encodeURIComponent(id)}` }
    }
    case 'revision':
      return { id, label: null, href: null }
  }
}

function paramLabel(key: string, t: TFunction): string {
  return isOneOf(PARAM_KEYS, key) ? t(`audit.log.params.${key}`) : key
}

function paramValue(event: AuditEvent, key: string, value: string | number, t: TFunction, format: Formatter): string {
  if (typeof value === 'number') return format.integer(value)
  switch (key) {
    case 'fields':
      return format.list(value.split(',').map((field) => (isOneOf(FIELD_NAMES, field) ? t(`audit.log.fieldNames.${field}`) : field)))
    case 'kind':
      return isOneOf(DELIVERY_ISSUE_KINDS, value) ? t(`common.deliveryIssueKinds.${value}`) : value
    case 'role':
      return isOneOf(ROLES, value) ? t(`roles.${value}`) : value
    case 'reason':
      // Lý do huỷ chuyến là chữ người dùng nhập; lý do đăng nhập sai là mã của kho
      return event.action === 'auth.signInFailed' && isOneOf(REASONS, value) ? t(`audit.log.reasons.${value}`) : value
    default:
      return value
  }
}
