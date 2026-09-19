import { checkDoorClearance, validatePackages, type ConstraintIssue } from '@/domain/constraints'
import { ORIENTATION_CODES, roundCm, roundKg, UPRIGHT_ORIENTATIONS, type OrientationCode } from '@/domain/geometry'
import { cargoPackageSchema, type CargoPackage, type FragilityLevel, type ModelIssueCode, type VehicleConfig } from '@/domain/models'
import { normalizeSearchText } from '@/lib/list-filter'
import { cellText, isBlankRow, parseDecimal, parseFlag, parseOrientations, parseRatio, type ImportCell } from './import-cells'
import { IMPORT_FIELDS, normalizeHeader, REQUIRED_FIELDS, type ImportField } from './package-import-columns'

/**
 * Xem trước file nhập kiện (LM-093, D-49): hàm thuần, nhận bảng ô đã đọc từ `.csv`/`.xlsx`, trả từng dòng kèm lỗi dạng **mã** — UI
 * dịch (`package-import-messages.ts`). Mỗi dòng qua `cargoPackageSchema` rồi kiểm tra domain (`validatePackages`, cửa xe); mã kiện
 * trùng trong file hoặc với kiện có sẵn, điểm giao không có trong chuyến là lỗi dòng. Dòng lỗi bị bỏ khi nhập, dòng hợp lệ giữ thứ tự file.
 */

export type ImportTable = readonly (readonly ImportCell[])[]

/** File quá dài thì chia nhỏ: xem trước từng dòng phải nhanh và danh sách lỗi còn đọc được. */
export const MAX_IMPORT_ROWS = 2000

export type ImportProblem =
  | { readonly code: 'CELL_REQUIRED'; readonly field: ImportField }
  | { readonly code: 'NUMBER_INVALID' | 'BOOLEAN_INVALID' | 'ORIENTATION_INVALID' | 'FRAGILITY_INVALID'; readonly field: ImportField; readonly value: string }
  /** Mã lỗi của `cargoPackageSchema`; `field` là `null` khi lỗi không thuộc cột nào. */
  | { readonly code: 'SCHEMA'; readonly field: ImportField | null; readonly issue: ModelIssueCode }
  | { readonly code: 'DUPLICATE_IN_FILE'; readonly id: string; readonly firstRow: number }
  | { readonly code: 'DUPLICATE_EXISTING'; readonly id: string }
  | { readonly code: 'STOP_UNKNOWN'; readonly stop: number; readonly stopCount: number }
  /** Ràng buộc domain (`DUPLICATE_INSTANCE_ID`, `DOOR_TOO_SMALL`…), dịch bằng `formatIssue`. */
  | { readonly code: 'CONSTRAINT'; readonly issue: ConstraintIssue }

export type ImportFileProblem =
  | { readonly code: 'EMPTY' }
  | { readonly code: 'MISSING_COLUMNS'; readonly fields: readonly ImportField[] }
  | { readonly code: 'DUPLICATE_COLUMN'; readonly field: ImportField }
  | { readonly code: 'TOO_MANY_ROWS'; readonly max: number }

export type ImportRow = {
  /** Số dòng như khi mở file bằng Excel: dòng tiêu đề là 1, tính cả dòng trống. */
  readonly row: number
  readonly id: string
  readonly name: string
  /** Kiện đọc được khi dòng hợp lệ. */
  readonly pkg: CargoPackage | null
  readonly problems: readonly ImportProblem[]
}

export type ReadyPreview = {
  readonly kind: 'ready'
  /** Mọi dòng dữ liệu (bỏ dòng trống), theo thứ tự file. */
  readonly rows: readonly ImportRow[]
  /** Kiện của dòng hợp lệ, theo thứ tự file — đúng những gì sẽ ghi vào chuyến. */
  readonly valid: readonly CargoPackage[]
  readonly invalidCount: number
  /** Tiêu đề cột không nhận ra, bỏ qua khi đọc. */
  readonly ignoredColumns: readonly string[]
}

export type ImportPreview = { readonly kind: 'fileError'; readonly problem: ImportFileProblem } | ReadyPreview

export type ImportContext = {
  readonly existing: readonly CargoPackage[]
  /** Số điểm giao của chuyến: `deliveryStop` phải trong 1…`stopCount`. */
  readonly stopCount: number
  readonly vehicle: VehicleConfig
  /** Tiêu đề cột đã chuẩn hoá (`normalizeHeader`) → trường, gồm tên trường và tiêu đề vi/en. */
  readonly headers: ReadonlyMap<string, ImportField>
  /** Mức dễ vỡ đã bỏ dấu → mã, gồm chính mã (`NONE`…) và nhãn vi/en. */
  readonly fragility: ReadonlyMap<string, FragilityLevel>
}

export function previewImport(table: ImportTable, context: ImportContext): ImportPreview {
  const headerIndex = table.findIndex((row) => !isBlankRow(row))
  if (headerIndex === -1) return { kind: 'fileError', problem: { code: 'EMPTY' } }

  const columns = new Map<ImportField, number>()
  const ignoredColumns: string[] = []
  for (const [index, cell] of (table[headerIndex] ?? []).entries()) {
    const title = cellText(cell)
    if (title === '') continue
    const field = context.headers.get(normalizeHeader(title))
    if (field === undefined) ignoredColumns.push(title)
    else if (columns.has(field)) return { kind: 'fileError', problem: { code: 'DUPLICATE_COLUMN', field } }
    else columns.set(field, index)
  }
  const missing = REQUIRED_FIELDS.filter((field) => !columns.has(field))
  if (missing.length > 0) return { kind: 'fileError', problem: { code: 'MISSING_COLUMNS', fields: missing } }

  const data = table
    .slice(headerIndex + 1)
    .map((cells, offset) => ({ cells, row: headerIndex + offset + 2 }))
    .filter(({ cells }) => !isBlankRow(cells))
  if (data.length === 0) return { kind: 'fileError', problem: { code: 'EMPTY' } }
  if (data.length > MAX_IMPORT_ROWS) return { kind: 'fileError', problem: { code: 'TOO_MANY_ROWS', max: MAX_IMPORT_ROWS } }

  const existingIds = new Set(context.existing.map((pkg) => pkg.id))
  const firstRowById = new Map<string, number>()
  const rows = data.map(({ cells, row }): ImportRow => {
    const read = readRow(cells, columns, context.fragility)
    const problems = [...read.problems]
    if (read.id !== '') {
      const first = firstRowById.get(read.id)
      if (first !== undefined) problems.push({ code: 'DUPLICATE_IN_FILE', id: read.id, firstRow: first })
      else firstRowById.set(read.id, row)
      if (existingIds.has(read.id)) problems.push({ code: 'DUPLICATE_EXISTING', id: read.id })
    }
    if (read.pkg && read.pkg.deliveryStop > context.stopCount) {
      problems.push({ code: 'STOP_UNKNOWN', stop: read.pkg.deliveryStop, stopCount: context.stopCount })
    }
    return { row, id: read.id, name: read.name, pkg: problems.length === 0 ? read.pkg : null, problems }
  })

  const checked = withConstraintIssues(rows, context)
  const valid = checked.flatMap((row) => (row.pkg ? [row.pkg] : []))
  return { kind: 'ready', rows: checked, valid, invalidCount: checked.length - valid.length, ignoredColumns }
}

/**
 * Kiểm tra domain trên những dòng đã qua schema: `validatePackages` cùng kiện có sẵn (mã instance đụng nhau sau khi mở rộng
 * `quantity`, D-33) và mặt cắt cửa của xe đang gán (Spec 7.4). Mã đụng giữa hai dòng mới thì dòng đầu giữ, các dòng sau lỗi.
 */
function withConstraintIssues(rows: readonly ImportRow[], context: ImportContext): ImportRow[] {
  const candidates = rows.filter((row): row is ImportRow & { pkg: CargoPackage } => row.pkg !== null)
  const rowByPackageId = new Map(candidates.map((row) => [row.pkg.id, row]))
  const existingIds = new Set(context.existing.map((pkg) => pkg.id))
  const found = new Map<ImportRow, ConstraintIssue[]>()
  const add = (row: ImportRow | undefined, issue: ConstraintIssue) => {
    if (row) found.set(row, [...(found.get(row) ?? []), issue])
  }
  for (const issue of validatePackages([...context.existing, ...candidates.map((row) => row.pkg)])) {
    if (issue.severity !== 'error') continue
    if (issue.code === 'DUPLICATE_INSTANCE_ID') {
      const related = issue.relatedIds ?? []
      const involved = related.filter((id) => !existingIds.has(id)).map((id) => rowByPackageId.get(id))
      const onlyNew = related.every((id) => !existingIds.has(id))
      for (const row of onlyNew ? involved.slice(1) : involved) add(row, issue)
      continue
    }
    const params: Readonly<Record<string, unknown>> = issue.params
    if (typeof params.packageId === 'string' && !existingIds.has(params.packageId)) add(rowByPackageId.get(params.packageId), issue)
  }
  for (const row of candidates) {
    for (const issue of checkDoorClearance(row.pkg, context.vehicle)) add(row, issue)
  }
  return rows.map((row) => {
    const issues = found.get(row)
    if (!issues) return row
    return { ...row, pkg: null, problems: [...row.problems, ...issues.map((issue) => ({ code: 'CONSTRAINT' as const, issue }))] }
  })
}

type Value = string | number | boolean | OrientationCode[] | FragilityLevel
type Values = Partial<Record<ImportField, Value>>

/** Một dòng → kiện: đọc từng ô theo kiểu của cột, ô tuỳ chọn trống lấy mặc định, rồi qua `cargoPackageSchema`. */
function readRow(cells: readonly ImportCell[], columns: ReadonlyMap<ImportField, number>, fragility: ImportContext['fragility']) {
  const problems: ImportProblem[] = []
  const values: Values = {}
  for (const field of IMPORT_FIELDS) {
    const index = columns.get(field)
    if (index === undefined) continue
    const cell = cells[index] ?? null
    const text = cellText(cell)
    if (text === '') {
      if (REQUIRED_FIELDS.includes(field)) problems.push({ code: 'CELL_REQUIRED', field })
      continue
    }
    const value = readCell(field, cell, text, fragility)
    if (typeof value === 'object' && 'problem' in value) problems.push(value.problem)
    else values[field] = value
  }
  const id = typeof values.id === 'string' ? values.id : ''
  const name = typeof values.name === 'string' ? values.name : ''
  if (problems.length > 0) return { id, name, pkg: null, problems }

  const parsed = cargoPackageSchema.safeParse(withDefaults(values))
  if (parsed.success) return { id, name, pkg: parsed.data, problems }
  return {
    id,
    name,
    pkg: null,
    problems: parsed.error.issues.map((issue): ImportProblem => {
      const [path] = issue.path
      const field = IMPORT_FIELDS.find((item) => item === path) ?? null
      return { code: 'SCHEMA', field, issue: issue.message as ModelIssueCode }
    }),
  }
}

const NUMBER_FIELDS: ReadonlySet<ImportField> = new Set([
  'lengthCm', 'widthCm', 'heightCm', 'weightKg', 'quantity', 'deliveryStop', 'maxTopLoadKg', 'maxStackCount', 'priority',
])
const FLAG_FIELDS: ReadonlySet<ImportField> = new Set(['keepUpright', 'stackable', 'mustLoad'])

function readCell(field: ImportField, cell: ImportCell, text: string, fragility: ImportContext['fragility']): Value | { problem: ImportProblem } {
  const shown = text.length > 40 ? `${text.slice(0, 40)}…` : text
  if (NUMBER_FIELDS.has(field) || field === 'minSupportRatio') {
    const value = typeof cell === 'number' ? cell : field === 'minSupportRatio' ? parseRatio(text) : parseDecimal(text)
    return value === null ? { problem: { code: 'NUMBER_INVALID', field, value: shown } } : value
  }
  if (FLAG_FIELDS.has(field)) {
    const value = typeof cell === 'boolean' ? cell : parseFlag(text)
    return value === null ? { problem: { code: 'BOOLEAN_INVALID', field, value: shown } } : value
  }
  if (field === 'allowedOrientations') {
    const parsed = parseOrientations(text)
    return 'codes' in parsed ? parsed.codes : { problem: { code: 'ORIENTATION_INVALID', field, value: parsed.invalid } }
  }
  if (field === 'fragilityLevel') {
    return fragility.get(normalizeSearchText(text)) ?? { problem: { code: 'FRAGILITY_INVALID', field, value: shown } }
  }
  return text
}

/**
 * Cột tuỳ chọn vắng hoặc ô trống: như kiện mới của form (LM-045) — sáu hướng (chỉ hai hướng đứng khi giữ thẳng đứng), không dễ vỡ,
 * cho xếp chồng, tải trên 0 kg, đỡ đáy 0,8, ưu tiên 0. Kích thước về bội 0,1 cm, khối lượng 0,01 kg tại biên nhập liệu (D-03).
 */
function withDefaults(values: Values): Record<string, unknown> {
  const number = (field: ImportField): number | undefined => {
    const value = values[field]
    return typeof value === 'number' ? value : undefined
  }
  const text = (field: ImportField): string | undefined => {
    const value = values[field]
    return typeof value === 'string' ? value : undefined
  }
  const flag = (field: ImportField, fallback: boolean): boolean => {
    const value = values[field]
    return typeof value === 'boolean' ? value : fallback
  }
  const cm = (field: ImportField) => {
    const value = number(field)
    return value === undefined ? undefined : roundCm(value)
  }
  const keepUpright = flag('keepUpright', false)
  const weightKg = number('weightKg')
  const maxStackCount = number('maxStackCount')
  const groupId = text('groupId')
  const notes = text('notes')
  return {
    id: text('id'),
    name: text('name'),
    lengthCm: cm('lengthCm'),
    widthCm: cm('widthCm'),
    heightCm: cm('heightCm'),
    weightKg: weightKg === undefined ? undefined : roundKg(weightKg),
    quantity: number('quantity'),
    allowedOrientations: Array.isArray(values.allowedOrientations)
      ? values.allowedOrientations
      : [...(keepUpright ? UPRIGHT_ORIENTATIONS : ORIENTATION_CODES)],
    keepUpright,
    fragilityLevel: values.fragilityLevel ?? 'NONE',
    stackable: flag('stackable', true),
    maxTopLoadKg: roundKg(number('maxTopLoadKg') ?? 0),
    ...(maxStackCount === undefined ? {} : { maxStackCount }),
    minSupportRatio: number('minSupportRatio') ?? 0.8,
    deliveryStop: number('deliveryStop'),
    priority: number('priority') ?? 0,
    mustLoad: flag('mustLoad', false),
    ...(groupId ? { groupId } : {}),
    ...(notes ? { notes } : {}),
  }
}
