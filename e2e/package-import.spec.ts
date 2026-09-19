import { readFile } from 'node:fs/promises'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { MOCK_DB } from './spec-flow-helpers'

/**
 * Nhập kiện từ file (LM-093, D-49): tải file mẫu CSV của chuyến, thêm một dòng lỗi, nhập lại bằng `setInputFiles` — xem trước nói dòng
 * lỗi, chỉ dòng hợp lệ được ghi, trong một lần ghi (một lần tăng `inputVersion`, một sự kiện nhật ký).
 */
const TRIP = 'TRIP-014'

function tripState(page: Page) {
  return page.evaluate(async ({ db, tripId }) => {
    const { getMockDb } = (await import(db)) as typeof import('@/lib/mock-db')
    const store = getMockDb()
    const [trip, events] = await Promise.all([store.getTrip(tripId), store.listEvents({ targetId: tripId })])
    return { ids: trip.packages.map((pkg) => pkg.id), inputVersion: trip.inputVersion, events: events.map((event) => ({ action: event.action, params: event.params })) }
  }, { db: MOCK_DB, tripId: TRIP })
}

test('the CSV template with one bad row added imports only its valid rows, in one write', async ({ page, login, browserErrors }) => {
  await login(`/chuyen/${TRIP}`)
  await page.getByRole('button', { name: 'Nhập từ file', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Nhập kiện từ file' })

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'Tải mẫu .csv', exact: true }).click(),
  ])
  expect(download.suggestedFilename()).toBe(`mau-nhap-kien-${TRIP}.csv`)
  const template = await readFile(await download.path(), 'utf8')
  expect(template.startsWith('﻿Mã kiện,Tên kiện,Dài (cm)')).toBe(true)

  // 19 cột như file mẫu; "Dài (cm)" không phải số
  const bad = 'PKG-099,Kiện lỗi,abc,40,30,12,1,1,LWH,có,NONE,có,0,,0.8,0,không,,'
  const before = await tripState(page)
  await dialog.getByLabel('File kiện (.csv, .xlsx)').setInputFiles({
    name: 'kien-chuyen.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(`${template}${bad}\r\n`, 'utf8'),
  })

  await expect(dialog.getByRole('status').filter({ hasText: 'Đọc được 3 dòng: 2 hợp lệ, 1 lỗi.' })).toBeVisible()
  await expect(dialog.getByText('Dài (cm): "abc" không phải là số.', { exact: true })).toBeVisible()
  await expect(dialog.getByText('Bỏ qua 1 dòng lỗi.', { exact: true })).toBeVisible()
  await dialog.getByRole('button', { name: 'Nhập 2 dòng hợp lệ', exact: true }).click()

  await expect(dialog).toHaveCount(0)
  await expect(page.getByText('Đã nhập 2 dòng kiện', { exact: true })).toBeVisible()
  await expect(page.getByRole('row', { name: /PKG-004/ })).toBeVisible()
  await expect(page.getByRole('row', { name: /PKG-005/ })).toBeVisible()
  await expect(page.getByRole('row', { name: /PKG-099/ })).toHaveCount(0)

  const after = await tripState(page)
  expect(after.ids).toStrictEqual([...before.ids, 'PKG-004', 'PKG-005'])
  expect(after.inputVersion).toBe(before.inputVersion + 1)
  expect(after.events).toHaveLength(before.events.length + 1)
  expect(after.events[0]).toStrictEqual({ action: 'trip.updated', params: { fields: 'packages' } })
  expect(browserErrors).toStrictEqual([])
})
