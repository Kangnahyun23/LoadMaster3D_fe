/**
 * Tách file CSV thành bảng ô chữ (LM-093). Tự viết, không thêm thư viện (AGENTS mục 2): RFC 4180 cộng những gì file xuất từ Excel
 * ở Việt Nam hay có.
 * - BOM UTF-8 đầu file bị bỏ.
 * - Dấu phân cách `,` hoặc `;`, đoán từ dòng tiêu đề (dòng có chữ đầu tiên): đếm hai dấu ngoài ngoặc kép, nhiều `;` hơn thì dùng `;`
 *   — Excel tiếng Việt xuất `;` vì dấu phẩy là dấu thập phân.
 * - Ô trong ngoặc kép giữ được dấu phân cách, xuống dòng và `""` (một dấu ngoặc kép). Ngoặc kép giữa ô là chữ thường.
 * - Dòng kết thúc bằng `\n`, `\r\n` hoặc `\r`. Dòng trống giữa file vẫn giữ (một ô rỗng) để số dòng khớp số dòng khi mở bằng Excel;
 *   xuống dòng cuối file không sinh thêm dòng.
 */
export type CsvDelimiter = ',' | ';'

const BOM = '﻿'

export function parseCsv(text: string, delimiter: CsvDelimiter = guessDelimiter(text)): string[][] {
  const source = text.startsWith(BOM) ? text.slice(1) : text
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  let index = 0
  while (index < source.length) {
    const char = source[index]!
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"'
        index += 2
        continue
      }
      if (char === '"') quoted = false
      else cell += char
      index += 1
      continue
    }
    if (char === '"' && cell === '') {
      quoted = true
    } else if (char === delimiter) {
      row.push(cell)
      cell = ''
    } else if (char === '\n' || char === '\r') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      if (char === '\r' && source[index + 1] === '\n') index += 1
    } else {
      cell += char
    }
    index += 1
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

/** Dấu phân cách của file: đếm `,` và `;` ngoài ngoặc kép ở dòng có chữ đầu tiên; hoà thì `,`. */
export function guessDelimiter(text: string): CsvDelimiter {
  const source = text.startsWith(BOM) ? text.slice(1) : text
  let commas = 0
  let semicolons = 0
  let quoted = false
  let seenText = false
  for (const char of source) {
    if (char === '"') quoted = !quoted
    if (quoted) continue
    if (char === '\n' || char === '\r') {
      if (seenText) break
      // Dòng chỉ có dấu phân cách (Excel xuất dòng trống thành `;;;`) không phải dòng tiêu đề
      commas = 0
      semicolons = 0
      continue
    }
    if (char === ',') commas += 1
    else if (char === ';') semicolons += 1
    else if (char.trim() !== '') seenText = true
  }
  return semicolons > commas ? ';' : ','
}
