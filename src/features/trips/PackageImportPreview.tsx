import { createColumnHelper } from '@tanstack/react-table'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { useId, useMemo } from 'react'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import type { CargoPackage } from '@/domain/models'
import type { Formatter } from '@/lib/format'
import { useFormat, useT, type TFunction } from '@/lib/i18n'
import type { ReadyPreview } from './package-import'
import { importProblemMessage } from './package-import-messages'

/** Số dòng hợp lệ vẽ ra bảng xem trước; phần còn lại chỉ đếm. */
const VALID_ROWS_SHOWN = 50

type ValidRow = CargoPackage & { readonly row: number }

const helper = createColumnHelper<BaseTableFeatures, ValidRow>()
const mono = 'font-mono text-caption'

function createColumns(t: TFunction, format: Formatter) {
  return helper.columns([
    helper.accessor('row', { header: t('trips.import.preview.row'), meta: { align: 'right', width: '56px' } satisfies ColumnMeta, cell: (info) => <span className={mono}>{info.getValue()}</span> }),
    helper.accessor('id', { header: t('trips.import.preview.id'), meta: { width: '104px' } satisfies ColumnMeta, cell: (info) => <span className={mono}>{info.getValue()}</span> }),
    helper.accessor('name', { header: t('trips.import.preview.name'), cell: (info) => <span className="block truncate">{info.getValue()}</span> }),
    helper.display({
      id: 'size',
      header: t('trips.import.preview.size'),
      meta: { align: 'right', width: '150px' } satisfies ColumnMeta,
      cell: ({ row }) => <span className={mono}>{format.dimensions(row.original.lengthCm, row.original.widthCm, row.original.heightCm)}</span>,
    }),
    helper.accessor('weightKg', { header: t('trips.import.preview.weight'), meta: { align: 'right', width: '96px' } satisfies ColumnMeta, cell: (info) => <span className={mono}>{format.weight(info.getValue())}</span> }),
    helper.accessor('quantity', { header: t('trips.import.preview.quantity'), meta: { align: 'right', width: '56px' } satisfies ColumnMeta, cell: (info) => <span className={mono}>{format.integer(info.getValue())}</span> }),
    helper.accessor('deliveryStop', { header: t('trips.import.preview.stop'), meta: { align: 'right', width: '56px' } satisfies ColumnMeta, cell: (info) => <span className={mono}>{info.getValue()}</span> }),
  ])
}

/**
 * Xem trước file nhập kiện (LM-093): tổng số dòng hợp lệ / lỗi, cột bị bỏ qua, mọi dòng lỗi kèm câu theo từng lỗi (dòng lỗi sẽ bỏ qua khi
 * nhập), và bảng các dòng hợp lệ (50 dòng đầu).
 */
export function PackageImportPreview({ preview }: { preview: ReadyPreview }) {
  const t = useT()
  const format = useFormat()
  const errorsId = useId()
  const validId = useId()
  const columns = useMemo(() => createColumns(t, format), [t, format])
  const invalidRows = preview.rows.filter((row) => row.problems.length > 0)
  const validRows = useMemo(
    () => preview.rows.flatMap((row) => (row.pkg ? [{ ...row.pkg, row: row.row }] : [])).slice(0, VALID_ROWS_SHOWN),
    [preview],
  )
  const hiddenValid = preview.valid.length - validRows.length

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <p role="status" className="text-body text-text">
        {t('trips.import.summary', {
          total: format.integer(preview.rows.length),
          valid: format.integer(preview.valid.length),
          invalid: format.integer(preview.invalidCount),
        })}
      </p>
      {preview.ignoredColumns.length > 0 ? (
        <p className="text-caption text-text-3">{t('trips.import.ignoredColumns', { columns: format.list(preview.ignoredColumns) })}</p>
      ) : null}

      {invalidRows.length > 0 ? (
        <section aria-labelledby={errorsId} className="flex flex-col gap-2">
          <h3 id={errorsId} className="flex items-center gap-1.5 text-caption font-medium text-badge-danger-fg">
            <CircleAlert aria-hidden className="size-4" strokeWidth={1.5} />
            {t('trips.import.errorsTitle', { count: invalidRows.length })}
          </h3>
          <ul className="m-0 flex max-h-56 list-none flex-col gap-2 overflow-y-auto rounded-md border border-badge-danger-border bg-badge-danger-bg p-3">
            {invalidRows.map((row) => (
              <li key={row.row} className="flex flex-col gap-0.5 text-caption">
                <span className="font-medium text-text">
                  <span className="font-mono">{t('trips.import.row', { row: String(row.row) })}</span>
                  {row.id ? <span className="font-mono"> · {row.id}</span> : null}
                  {row.name ? ` · ${row.name}` : null}
                </span>
                <ul className="m-0 list-disc pl-5 text-badge-danger-fg">
                  {row.problems.map((problem, index) => <li key={index}>{importProblemMessage(problem, t, format)}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {validRows.length > 0 ? (
        <section aria-labelledby={validId} className="flex flex-col gap-2">
          <h3 id={validId} className="flex items-center gap-1.5 text-caption font-medium text-badge-success-fg">
            <CircleCheck aria-hidden className="size-4" strokeWidth={1.5} />
            {t('trips.import.validTitle', { count: preview.valid.length })}
          </h3>
          <div className="max-h-56 overflow-auto rounded-md border border-border">
            <DataTable data={validRows} columns={columns} cellPadding="tight" />
          </div>
          {hiddenValid > 0 ? <p className="text-caption text-text-3">{t('trips.import.moreRows', { count: hiddenValid })}</p> : null}
        </section>
      ) : null}
    </div>
  )
}
