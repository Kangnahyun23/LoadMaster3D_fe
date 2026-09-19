import { parseCsv } from './csv'
import type { ImportCell } from './import-cells'
import type { ImportTable } from './package-import'

/**
 * Đọc file người dùng chọn thành bảng ô (LM-093): `.csv` bằng bộ tách tự viết (`csv.ts`), `.xlsx` bằng `read-excel-file` bản trình
 * duyệt, chỉ tải thư viện khi thật sự mở file `.xlsx`. Đuôi khác hoặc file hỏng thì từ chối — màn nói "không đọc được file".
 */
export async function readImportFile(file: File): Promise<ImportTable> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.csv')) return parseCsv(await file.text())
  if (name.endsWith('.xlsx')) {
    const { readSheet } = await import('read-excel-file/browser')
    const rows = await readSheet(file)
    return rows.map((row) => row.map(toImportCell))
  }
  throw new Error(`Không nhập được file ${file.name}: chỉ nhận .csv hoặc .xlsx`)
}

/** Ô của `read-excel-file`: chữ, số, đúng/sai, ngày hoặc `null`. */
function toImportCell(cell: unknown): ImportCell {
  if (cell instanceof Date || typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean') return cell
  return null
}
