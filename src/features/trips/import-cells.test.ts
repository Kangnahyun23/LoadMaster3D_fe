import { expect, test } from 'vitest'
import { cellText, isBlankRow, parseDecimal, parseFlag, parseOrientations, parseRatio } from './import-cells'

/** Seam: đọc từng ô của file nhập kiện (LM-093). Giá trị kỳ vọng viết tay theo cách người dùng Việt / Anh ghi số. */

test('decimal comma and decimal point both read; one separator is always the decimal mark', () => {
  expect([parseDecimal('12,5'), parseDecimal('12.5'), parseDecimal(' 1 250 '), parseDecimal('0,8'), parseDecimal('-3')])
    .toStrictEqual([12.5, 12.5, 1250, 0.8, -3])
  expect([parseDecimal('1,234'), parseDecimal('1.234')]).toStrictEqual([1.234, 1.234])
})

test('thousand groups read the Vietnamese and the English way', () => {
  expect([parseDecimal('1.234,5'), parseDecimal('1.234.567'), parseDecimal('1,234.5'), parseDecimal('1,234,567')])
    .toStrictEqual([1234.5, 1234567, 1234.5, 1234567])
})

test('text, empty cells, two decimal marks and broken groups are not numbers', () => {
  expect(['abc', '', '12,5,1', '1.23.4', '12cm', '1,2.3,4'].map(parseDecimal)).toStrictEqual([null, null, null, null, null, null])
})

test('a ratio takes a percentage too', () => {
  expect([parseRatio('80%'), parseRatio('0,8'), parseRatio('x%')]).toStrictEqual([0.8, 0.8, null])
})

test('yes/no in Vietnamese or English, any case, with or without diacritics', () => {
  expect(['có', 'Có', 'co', 'TRUE', 'yes', '1', 'x', 'đúng'].map(parseFlag)).toStrictEqual([true, true, true, true, true, true, true, true])
  expect(['không', 'Khong', 'false', 'No', '0', 'sai'].map(parseFlag)).toStrictEqual([false, false, false, false, false, false])
  expect(parseFlag('có lẽ')).toBeNull()
})

test('orientations as LWH|WLH, any separator or case; an unknown code is returned so the message can name it', () => {
  expect(parseOrientations('LWH|WLH')).toStrictEqual({ codes: ['LWH', 'WLH'] })
  expect(parseOrientations('lwh, hwl ; WHL')).toStrictEqual({ codes: ['LWH', 'HWL', 'WHL'] })
  expect(parseOrientations('LWH|LWX')).toStrictEqual({ invalid: 'LWX' })
})

test('cell text trims, dates from .xlsx become YYYY-MM-DD, and a row of empty cells is blank', () => {
  expect([cellText('  PKG-1 '), cellText(12.5), cellText(true), cellText(null), cellText(new Date('2026-09-20T00:00:00Z'))])
    .toStrictEqual(['PKG-1', '12.5', 'true', '', '2026-09-20'])
  expect([isBlankRow(['', ' ', null]), isBlankRow(['', 'x'])]).toStrictEqual([true, false])
})
