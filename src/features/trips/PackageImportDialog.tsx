import { Download, FileUp } from 'lucide-react'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog'
import { Spinner } from '@/components/ui/Spinner'
import type { VehicleConfig } from '@/domain/models'
import { dataErrorMessage, useFormat, useT } from '@/lib/i18n'
import type { Trip } from '@/lib/mock-db'
import { downloadBlob } from './download-file'
import { previewImport, type ImportTable } from './package-import'
import { importFragilityAliases, importHeaderAliases } from './package-import-columns'
import { importFileProblemMessage } from './package-import-messages'
import { csvTemplateBlob, importTemplateRows, xlsxTemplateBlob } from './package-import-template'
import { PackageImportPreview } from './PackageImportPreview'
import { readImportFile } from './read-import-file'
import { useImportPackagesMutation } from './useTripsQuery'

type FileState =
  | { readonly status: 'idle' }
  | { readonly status: 'reading'; readonly name: string }
  | { readonly status: 'read'; readonly name: string; readonly table: ImportTable }
  | { readonly status: 'unreadable'; readonly name: string }

const ACCEPT = '.csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/**
 * Nhập kiện từ `.csv`/`.xlsx` (LM-093, D-49, Spec 9.3): chọn file, tải file mẫu (hai dạng), xem trước từng dòng với lỗi theo dòng, rồi
 * "Nhập N dòng hợp lệ" — bỏ dòng lỗi, nói rõ bỏ mấy dòng — thành **một** lần ghi vào kho. Chỉ mở được khi được sửa chuyến (nút ở bảng
 * kiện chỉ hiện lúc đó). Xem trước tính lại theo kiện hiện có của chuyến, nên mã trùng luôn so với dữ liệu mới nhất.
 */
export function PackageImportDialog({ trip, vehicle, open, onOpenChange }: {
  trip: Pick<Trip, 'id' | 'packages' | 'stops'>
  vehicle: VehicleConfig
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useT()
  const format = useFormat()
  const inputRef = useRef<HTMLInputElement>(null)
  // Lần đọc mới nhất: chọn file khác khi file trước còn đang đọc thì bỏ kết quả cũ
  const readToken = useRef(0)
  const [file, setFile] = useState<FileState>({ status: 'idle' })
  const importMutation = useImportPackagesMutation(trip.id)
  const table = file.status === 'read' ? file.table : null
  const preview = useMemo(() => (table
    ? previewImport(table, {
        existing: trip.packages,
        stopCount: trip.stops.length,
        vehicle,
        headers: importHeaderAliases(),
        fragility: importFragilityAliases(),
      })
    : null), [table, trip.packages, trip.stops.length, vehicle])
  const ready = preview?.kind === 'ready' ? preview : null
  const fileProblem = file.status === 'unreadable' ? { code: 'UNREADABLE' as const } : preview?.kind === 'fileError' ? preview.problem : null

  function handleOpenChange(next: boolean) {
    if (!next) {
      readToken.current += 1
      setFile({ status: 'idle' })
      importMutation.reset()
    }
    onOpenChange(next)
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0]
    // Chọn lại đúng file đó (sau khi sửa trong Excel) vẫn đọc lại
    event.target.value = ''
    if (!chosen) return
    const token = ++readToken.current
    importMutation.reset()
    setFile({ status: 'reading', name: chosen.name })
    try {
      const read = await readImportFile(chosen)
      if (readToken.current === token) setFile({ status: 'read', name: chosen.name, table: read })
    } catch {
      if (readToken.current === token) setFile({ status: 'unreadable', name: chosen.name })
    }
  }

  async function handleTemplate(kind: 'csv' | 'xlsx') {
    try {
      const rows = importTemplateRows(t, trip.packages, trip.stops.length)
      const blob = kind === 'csv' ? csvTemplateBlob(rows) : await xlsxTemplateBlob(rows, t('trips.import.templateSheet'))
      downloadBlob(blob, `${t('trips.import.templateName', { tripId: trip.id })}.${kind}`)
    } catch (error) {
      toast.error(dataErrorMessage(error, t))
    }
  }

  function handleImport() {
    if (!ready || ready.valid.length === 0) return
    const count = ready.valid.length
    const skipped = ready.invalidCount
    importMutation.mutate(ready.valid, {
      onSuccess: () => {
        toast.success(t('trips.import.done', { count }), skipped > 0 ? { description: t('trips.import.skipped', { count: skipped }) } : undefined)
        handleOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-200">
        <div className="flex min-w-0 flex-col gap-4 px-7 pt-6 pb-2">
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-h2 font-semibold">{t('trips.import.title')}</DialogTitle>
            <DialogDescription className="text-body text-text-2">{t('trips.import.description')}</DialogDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
              <FileUp strokeWidth={1.5} />
              {file.status === 'idle' ? t('trips.import.choose') : t('trips.import.chooseAnother')}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              tabIndex={-1}
              aria-label={t('trips.import.fileInput')}
              className="sr-only"
              onChange={(event) => void handleFile(event)}
            />
            <div className="flex-1" />
            <Button type="button" variant="ghost" onClick={() => void handleTemplate('csv')}>
              <Download strokeWidth={1.5} />
              {t('trips.import.templateCsv')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => void handleTemplate('xlsx')}>
              <Download strokeWidth={1.5} />
              {t('trips.import.templateXlsx')}
            </Button>
          </div>

          {file.status === 'idle' ? null : <p className="truncate font-mono text-caption text-text-2">{file.name}</p>}
          {file.status === 'reading' ? (
            <p role="status" className="flex items-center gap-2 text-body text-text-2"><Spinner />{t('trips.import.reading')}</p>
          ) : null}
          {fileProblem ? (
            <p role="alert" className="rounded-md border border-badge-danger-border bg-badge-danger-bg px-4 py-3 text-body text-badge-danger-fg">
              {importFileProblemMessage(fileProblem, t, format)}
            </p>
          ) : null}
          {ready ? <PackageImportPreview preview={ready} /> : null}
          {importMutation.isError ? (
            <p role="alert" className="text-caption text-danger">{dataErrorMessage(importMutation.error, t)}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>{t('trips.import.close')}</Button>
          <div className="flex min-w-0 items-center gap-3">
            {ready && ready.invalidCount > 0 && ready.valid.length > 0 ? (
              <span className="text-caption text-text-2">{t('trips.import.skipped', { count: ready.invalidCount })}</span>
            ) : null}
            <Button
              type="button"
              variant="primary"
              disabled={!ready || ready.valid.length === 0 || importMutation.isPending}
              loading={importMutation.isPending}
              onClick={handleImport}
            >
              {ready ? t('trips.import.submit', { count: ready.valid.length }) : t('trips.import.submitIdle')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
