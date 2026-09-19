import { expect, test } from 'vitest'
import { guessDelimiter, parseCsv } from './csv'

/** Seam: chữ của file `.csv` → bảng ô (LM-093). Ô giữ nguyên chữ; đọc số và đúng/sai là việc của bước sau. */

test('a UTF-8 BOM at the start is dropped, so the first header is not "\\uFEFFid"', () => {
  expect(parseCsv('﻿id,name\nPKG-101,Thùng nước suối\n')).toStrictEqual([
    ['id', 'name'],
    ['PKG-101', 'Thùng nước suối'],
  ])
})

test('the delimiter is guessed from the header row: Excel in Vietnamese exports ";" because "," is the decimal mark', () => {
  const text = 'Mã kiện;Tên kiện;Dài (cm)\nPKG-101;Bao gạo;12,5\n'
  expect(guessDelimiter(text)).toBe(';')
  expect(parseCsv(text)).toStrictEqual([
    ['Mã kiện', 'Tên kiện', 'Dài (cm)'],
    ['PKG-101', 'Bao gạo', '12,5'],
  ])
  expect(guessDelimiter('id,name,notes\n1;2;3;4;5\n')).toBe(',')
})

test('quoted cells keep delimiters, line breaks and doubled quotes; a quote inside a bare cell is plain text', () => {
  const text = 'id,notes,name\r\nPKG-1,"Giao trước 10 giờ, bốc nhẹ tay","Thùng ""A"""\r\nPKG-2,"hai\r\ndòng",Tủ 2" cửa\r\n'
  expect(parseCsv(text)).toStrictEqual([
    ['id', 'notes', 'name'],
    ['PKG-1', 'Giao trước 10 giờ, bốc nhẹ tay', 'Thùng "A"'],
    ['PKG-2', 'hai\r\ndòng', 'Tủ 2" cửa'],
  ])
})

test('blank lines in the middle stay as empty rows so row numbers match Excel; the final line break adds no row', () => {
  expect(parseCsv('id\nPKG-1\n\nPKG-2\r\n')).toStrictEqual([['id'], ['PKG-1'], [''], ['PKG-2']])
  expect(parseCsv('id\rPKG-1')).toStrictEqual([['id'], ['PKG-1']])
})

test('rows made only of delimiters before the header do not decide the delimiter', () => {
  expect(guessDelimiter(';;;;\n;;;;\nid,name\n')).toBe(',')
})
