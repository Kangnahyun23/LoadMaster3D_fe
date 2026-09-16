import { createColumnHelper } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataTable, type BaseTableFeatures, type ColumnMeta } from '@/components/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Formatter } from '@/lib/format'
import { useFormat, useT, type TFunction } from '@/lib/i18n'
import { initialsOf, type User } from '@/types/user'
import type { UserFormValues } from './user-form.schema'
import { UserFormDialog } from './UserFormDialog'
import { USERS } from './users.mock'

const helper = createColumnHelper<BaseTableFeatures, User>()

/** Cột phụ thuộc ngôn ngữ đang chọn (tiêu đề, nhãn, ngày giờ), nên dựng trong component chứ không ở module. */
function createColumns(t: TFunction, format: Formatter) {
  return helper.columns([
    helper.accessor('fullName', {
      header: t('admin.users.columns.user'),
      cell: (info) => (
        <span className="flex items-center gap-2.5">
          <span className="grid size-8 flex-none place-items-center rounded-full bg-primary-bg text-caption font-semibold leading-none text-primary-hover">
            {initialsOf(info.getValue())}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{info.getValue()}</span>
            <span className="truncate font-mono text-caption text-text-3">
              {info.row.original.email}
            </span>
          </span>
        </span>
      ),
    }),
    helper.accessor('phone', {
      header: t('admin.users.columns.phone'),
      meta: { width: '140px' } satisfies ColumnMeta,
      cell: (info) => <span className="font-mono text-caption">{info.getValue()}</span>,
    }),
    helper.accessor('role', {
      header: t('admin.users.columns.role'),
      meta: { width: '170px' } satisfies ColumnMeta,
      cell: (info) => t(`roles.${info.getValue()}`),
    }),
    helper.accessor('depot', {
      header: t('admin.users.columns.depot'),
      meta: { width: '200px' } satisfies ColumnMeta,
      cell: (info) => <span className="block truncate">{info.getValue()}</span>,
    }),
    helper.accessor('lastActiveAt', {
      header: t('admin.users.columns.lastActive'),
      meta: { align: 'right', width: '180px' } satisfies ColumnMeta,
      cell: (info) => {
        const value = info.getValue()
        return value ? (
          <span className="font-mono text-caption">{`${format.time(value)} ${format.date(value)}`}</span>
        ) : (
          <span className="text-caption text-text-3">{t('admin.users.neverSignedIn')}</span>
        )
      },
    }),
    helper.accessor('status', {
      header: t('admin.users.columns.status'),
      meta: { width: '150px' } satisfies ColumnMeta,
      cell: (info) => (
        <Badge tone={info.getValue() === 'active' ? 'success' : 'danger'}>
          {t(`admin.users.status.${info.getValue()}`)}
        </Badge>
      ),
    }),
  ])
}

/** Quản trị người dùng — danh sách, thêm và sửa bằng hộp thoại form. */
export function UsersPage() {
  const t = useT()
  const format = useFormat()
  const columns = useMemo(() => createColumns(t, format), [t, format])
  const [users, setUsers] = useState<User[]>(USERS)
  const [editing, setEditing] = useState<User | undefined>(undefined)
  const [dialogOpen, setDialogOpen] = useState(false)

  function openCreate() {
    setEditing(undefined)
    setDialogOpen(true)
  }

  function openEdit(user: User) {
    setEditing(user)
    setDialogOpen(true)
  }

  function handleSubmit(values: UserFormValues) {
    if (editing) {
      setUsers((current) =>
        current.map((u) => (u.id === editing.id ? { ...u, ...values } : u)),
      )
      toast.success(t('admin.users.updated', { name: values.fullName }))
      return
    }

    const created: User = {
      id: `US-${String(users.length + 1).padStart(4, '0')}`,
      ...values,
      lastActiveAt: null,
    }
    setUsers((current) => [created, ...current])
    toast.success(t('admin.users.created', { name: values.fullName }), {
      description: t('admin.users.createdDescription'),
    })
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-18 flex-none items-center justify-between gap-4 border-b border-border bg-bg px-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-h2 font-semibold">{t('admin.users.title')}</h1>
          <span className="font-mono text-caption text-text-3">
            {t('admin.users.count', { count: users.length })}
          </span>
        </div>
        <Button variant="primary" className="h-9 px-3.5" onClick={openCreate}>
          <Plus strokeWidth={1.5} />
          {t('admin.users.form.createTitle')}
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="overflow-hidden rounded-md border border-border bg-bg">
          <DataTable data={users} columns={columns} density="comfortable" onRowClick={openEdit} />
        </div>
        <p className="mt-3 text-caption text-text-3">{t('admin.users.rowHint')}</p>
      </div>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editing}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
