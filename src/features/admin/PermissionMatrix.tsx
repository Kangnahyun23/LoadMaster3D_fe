import { createColumnHelper } from '@tanstack/react-table'
import { Check, Minus } from 'lucide-react'
import { useMemo } from 'react'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { can, PERMISSIONS, type Permission } from '@/features/auth/permissions'
import { useT, type TFunction } from '@/lib/i18n'
import { ROLES } from '@/types/user'

type PermissionRow = { readonly permission: Permission }

const helper = createColumnHelper<BaseTableFeatures, PermissionRow>()
const ROWS: PermissionRow[] = PERMISSIONS.map((permission) => ({ permission }))

function createColumns(t: TFunction) {
  return helper.columns([
    helper.accessor('permission', {
      header: t('admin.permissions.permission'),
      cell: (info) => (
        <span className="flex min-w-0 flex-col whitespace-normal">
          <span className="line-clamp-2 font-medium text-ink-strong">{t(`admin.permissions.labels.${info.getValue()}`)}</span>
          <span className="font-mono text-caption text-ink-3">{info.getValue()}</span>
        </span>
      ),
    }),
    ...ROLES.map((role) => helper.display({
      id: role,
      header: t(`roles.${role}`),
      meta: { align: 'center', width: '156px' } satisfies ColumnMeta,
      cell: (info) => (can(role, info.row.original.permission) ? (
        <span className="inline-flex text-success">
          <Check className="size-5" strokeWidth={2} aria-hidden />
          <span className="sr-only">{t('admin.permissions.granted')}</span>
        </span>
      ) : (
        <span className="inline-flex text-ink-3">
          <Minus className="size-4" strokeWidth={1.5} aria-hidden />
          <span className="sr-only">{t('admin.permissions.denied')}</span>
        </span>
      )),
    })),
  ])
}

/**
 * Tab "Ma trận quyền" (LM-092, D-41): chỉ đọc, dựng thẳng từ `ROLE_PERMISSIONS` — cùng hằng số chặn route, nav và nút, nên bảng
 * luôn đúng với những gì giao diện cho phép. Ô có quyền là dấu tích, không có là gạch; trình đọc màn hình đọc "Có"/"Không".
 * Bảng V2 dạng "paper" trong một thẻ; dòng hai tầng (tên quyền + mã quyền) nên cao 56 px.
 */
export function PermissionMatrix() {
  const t = useT()
  const columns = useMemo(() => createColumns(t), [t])
  return (
    <div className="flex flex-col gap-3">
      <p className="text-body text-ink-2">{t('admin.permissions.description')}</p>
      {/* flex-none: con overflow-hidden của cột flex không được co (AGENTS mục 5, "Cuộn trong khung ứng dụng") */}
      <section className="relative flex-none overflow-hidden rounded-lg border border-border bg-bg">
        <DataTable data={ROWS} columns={columns} density="roomy" appearance="paper" />
      </section>
    </div>
  )
}
