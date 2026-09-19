import { createColumnHelper } from '@tanstack/react-table'
import { Link } from 'react-router'
import type { BaseTableFeatures, ColumnMeta } from '@/components/DataTable'
import type { Formatter } from '@/lib/format'
import type { TFunction } from '@/lib/i18n'
import type { AuditRow } from './audit-log'

const helper = createColumnHelper<BaseTableFeatures, AuditRow>()

/** Cột bảng nhật ký (LM-091). Chữ đã dịch sẵn trong `AuditRow`; tiêu đề và ngày giờ theo ngôn ngữ nên dựng trong component. */
export function auditColumns(t: TFunction, format: Formatter) {
  return helper.columns([
    helper.accessor('at', {
      header: t('audit.log.columns.at'),
      enableSorting: true,
      sortDescFirst: true,
      meta: { width: '156px' } satisfies ColumnMeta,
      cell: (info) => (
        <span className="font-mono text-caption text-text-2">
          {t('audit.log.dateTime', { time: format.time(info.getValue()), date: format.date(info.getValue()) })}
        </span>
      ),
    }),
    helper.accessor('actor', {
      header: t('audit.log.columns.actor'),
      meta: { width: '196px' } satisfies ColumnMeta,
      cell: (info) => <span className="block truncate">{info.getValue()}</span>,
    }),
    helper.accessor('action', {
      header: t('audit.log.columns.action'),
      meta: { width: '220px' } satisfies ColumnMeta,
      cell: (info) => <span className="block truncate font-medium">{info.getValue()}</span>,
    }),
    helper.accessor('target', {
      header: t('audit.log.columns.target'),
      meta: { width: '300px' } satisfies ColumnMeta,
      cell: (info) => <TargetCell target={info.getValue()} />,
    }),
    helper.accessor('details', {
      header: t('audit.log.columns.details'),
      cell: (info) => <span className="block truncate text-text-2" title={info.getValue()}>{info.getValue()}</span>,
    }),
  ])
}

/**
 * Tên đối tượng trên, mã dưới (hai dòng để tên dài không cắt mất mã — ô tìm tìm theo mã). Còn trang để mở thì tên là liên kết:
 * chuyến, xe, danh sách người dùng lọc đúng người. Khoảng trắng giữa hai dòng chỉ để chữ đọc liền mạch khi chép hoặc đọc máy.
 */
function TargetCell({ target }: { target: AuditRow['target'] }) {
  const name = target.label ?? target.id
  return (
    <span className="flex min-w-0 flex-col">
      {target.href ? (
        <Link to={target.href} className="truncate font-medium text-primary">{name}</Link>
      ) : (
        <span className="truncate">{name}</span>
      )}
      {target.label ? <>{' '}<span className="truncate font-mono text-caption text-text-3">{target.id}</span></> : null}
    </span>
  )
}
