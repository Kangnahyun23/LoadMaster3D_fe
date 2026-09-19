import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useFormat, useT } from '@/lib/i18n'
import { reportSheets } from './dashboard-report'
import type { DashboardSummary } from './dashboard-summary'

/**
 * Tải báo cáo .xlsx của kỳ đang xem (LM-090, D-48). `write-excel-file` chỉ được tải khi bấm xuất (`import()` lười), nên chunk
 * bảng điều khiển không gánh thư viện. Toast chỉ báo sau khi trình duyệt đã nhận file.
 */
export function useExportReport() {
  const t = useT()
  const format = useFormat()
  return useMutation({
    mutationFn: async (summary: DashboardSummary) => {
      const { default: writeXlsxFile } = await import('write-excel-file/browser')
      const fileName = t('manager.export.fileName', { from: summary.period.from, to: summary.period.to })
      const sheets = reportSheets(summary, t, format, new Date())
      await writeXlsxFile(sheets.map(({ sheet, columns, data }) => ({ sheet, columns: [...columns], data }))).toFile(fileName)
      return fileName
    },
    onSuccess: (fileName) => toast.success(t('manager.export.done', { name: fileName })),
    onError: () => toast.error(t('manager.export.failed')),
  })
}
