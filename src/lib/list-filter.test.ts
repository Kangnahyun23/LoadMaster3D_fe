import { expect, test } from 'vitest'
import { compareText, isWithinDateRange, matchesQuery, normalizeSearchText } from './list-filter'

test('search text drops Vietnamese tone and letter marks, đ and case', () => {
  expect(normalizeSearchText('Tuyến Thủ Đức – Dĩ An – Biên Hoà')).toBe('tuyen thu duc – di an – bien hoa')
  expect(normalizeSearchText('Nguyễn Thị Hương · ĐẶNG VĂN ĐỨC')).toBe('nguyen thi huong · dang van duc')
  expect(normalizeSearchText('  Thủ   Đức ')).toBe('thu duc')
})

test('typing without accents finds accented names, whichever way the accent was placed', () => {
  expect(matchesQuery('Tuyến Thủ Đức – Dĩ An – Biên Hoà', 'bien hoa')).toBe(true)
  expect(matchesQuery('Biên Hòa', 'BIÊN HOÀ')).toBe(true)
  expect(matchesQuery('Kho Sóng Thần', 'song than')).toBe(true)
  expect(matchesQuery('Kho Sóng Thần', 'long binh')).toBe(false)
})

test('every word of the query must appear, in any field and any order', () => {
  const fields = ['TRIP-2026-0914', 'Tuyến Q.7 – Biên Hoà', null]
  expect(matchesQuery(fields, 'hoa 0914')).toBe(true)
  expect(matchesQuery(fields, 'hoa 0915')).toBe(false)
})

test('a blank query matches every row', () => {
  expect(matchesQuery('Biên Hoà', '')).toBe(true)
  expect(matchesQuery([], '   ')).toBe(true)
})

test('date range includes both ends and treats an empty end as open', () => {
  expect(isWithinDateRange('2026-09-14', '2026-09-14', '2026-09-14')).toBe(true)
  expect(isWithinDateRange('2026-09-13', '2026-09-14', '')).toBe(false)
  expect(isWithinDateRange('2026-09-15', '', '2026-09-14')).toBe(false)
  expect(isWithinDateRange('2026-08-30', '', '2026-09-02')).toBe(true)
  expect(isWithinDateRange('2026-01-01')).toBe(true)
})

test('a malformed end, such as a six-digit year typed by mistake, does not limit the range', () => {
  expect(isWithinDateRange('2026-09-19', '102026-09-10', '')).toBe(true)
  expect(isWithinDateRange('2026-09-19', '', '102026-09-10')).toBe(true)
  expect(isWithinDateRange('2026-09-19', 'hom-nay', '2026-09-18')).toBe(false)
})

test('text sorts in Vietnamese alphabet order with numbers compared by value', () => {
  const names = ['Đà Lạt', 'PKG-10', 'Ơn', 'Dĩ An', 'Ô Môn', 'PKG-2', 'Bình Dương', 'Oanh']
  expect(names.toSorted(compareText)).toStrictEqual(['Bình Dương', 'Dĩ An', 'Đà Lạt', 'Oanh', 'Ô Môn', 'Ơn', 'PKG-2', 'PKG-10'])
})
