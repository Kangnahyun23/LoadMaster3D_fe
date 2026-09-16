import { expect, test } from 'vitest'
import { findHardcodedVietnamese, stripComments } from './hardcoded-strings'

test('comments are dropped but strings that contain slashes survive', () => {
  const source = "const url = 'https://maps.google.com' // Chỉ đường\n/* Kiện\n hàng */ const a = 1"
  expect(stripComments(source)).toContain("'https://maps.google.com'")
  expect(findHardcodedVietnamese(source)).toStrictEqual([])
})

test('Vietnamese in strings and JSX text is reported with its line', () => {
  const source = "const ok = t('trips.list.title')\nreturn <p>Chuyến hàng</p>\nconst label = `Điểm ${n}`"
  expect(findHardcodedVietnamese(source)).toStrictEqual([
    { line: 2, text: 'return <p>Chuyến hàng</p>' },
    { line: 3, text: 'const label = `Điểm ${n}`' },
  ])
})

test('developer invariant errors are not UI text', () => {
  expect(findHardcodedVietnamese('if (!x) throw new Error(`Không có placement ${id}`)')).toStrictEqual([])
})

test('English text and escaped quotes are not reported', () => {
  expect(findHardcodedVietnamese("const s = 'It\\'s MOCK RESULT' // không dịch")).toStrictEqual([])
})
