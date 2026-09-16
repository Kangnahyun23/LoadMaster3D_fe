import { expect, PLANNER_ROUTE, test } from './fixtures'
import { heightOf, MOCK_DB, navigateInApp, SEED_TRIP } from './spec-flow-helpers'

/**
 * Màn kho đọc revision đã duyệt (LM-060). Kho dữ liệu nằm trong bộ nhớ trang: sau khi ghi chỉ đổi route phía client.
 */

test.use({ collectConsoleErrors: true })

for (const device of ['desktop', 'tablet'] as const) {
  const details = device === 'tablet' ? { tag: '@tablet' } : {}

  test(`${device}: approving in the Planner then opening /kho starts at loadingOrder 1 of that revision`, details, async ({ page, login, browserErrors }) => {
    await login(PLANNER_ROUTE)
    await page.locator('canvas').waitFor()
    await page.getByRole('button', { name: 'Duyệt phương án', exact: true }).click()
    await page.getByRole('dialog', { name: 'Duyệt phương án này?' }).getByRole('button', { name: 'Duyệt', exact: true }).click()
    await page.waitForURL(/\/phuong-an\?revision=REV-/)
    const approvedId = new URL(page.url()).searchParams.get('revision')

    const approved = await page.evaluate(async ({ db, tripId }) => {
      const { getMockDb } = (await import(db)) as typeof import('@/lib/mock-db')
      const revision = (await getMockDb().listRevisions(tripId)).findLast((item) => item.approvedAt !== undefined)!
      const byOrder = (order: number) => revision.result.placements.find((placement) => placement.loadingOrder === order)!.packageInstanceId
      return { id: revision.id, first: byOrder(1), second: byOrder(2), total: revision.result.placements.length }
    }, { db: MOCK_DB, tripId: SEED_TRIP })
    expect(approved.id).toBe(approvedId)

    await navigateInApp(page, '/kho')
    const heading = page.getByRole('heading', { level: 1, name: approved.first, exact: true })
    await expect(heading).toBeVisible()
    await expect(page.getByText(`Bước 1 / ${approved.total}`)).toBeVisible()
    await expect(page.getByText('MOCK RESULT', { exact: true })).toBeVisible()
    await expect(page.getByText('Thứ tự tính lại ở FE', { exact: true })).toBeVisible()
    await expect(page.getByText(/^Cách cửa sau$/)).toBeVisible()
    await expect(page.getByRole('img', { name: /^Minh hoạ hướng đặt (LWH|WLH|LHW|WHL|HLW|HWL)/ })).toBeVisible()

    const confirm = page.getByRole('button', { name: 'Xác nhận đã xếp', exact: true })
    const exit = page.getByRole('link', { name: 'Thoát phiên xếp hàng', exact: true })
    await expect(exit).toBeVisible()
    if (device === 'tablet') {
      expect(await heightOf(confirm)).toBeGreaterThanOrEqual(56)
      expect(await heightOf(page.getByRole('button', { name: 'Kiện này không có ở kho', exact: true }))).toBeGreaterThanOrEqual(56)
      expect(await heightOf(exit)).toBeGreaterThanOrEqual(56)
      // Chữ của màn kho: thanh trên, dải nhãn, thẻ hướng dẫn và hai nút. Toast của Planner và nhãn trong khung 3D không thuộc phần này.
      const card = heading.locator('xpath=ancestor::div[contains(@class, "overflow-y-auto")][1]')
      const sizes = await Promise.all([page.getByRole('banner'), page.getByText('MOCK RESULT', { exact: true }).locator('..'), card, confirm.locator('..')]
        .map((region) => region.evaluate((root) => [root, ...root.querySelectorAll('*')]
          .filter((el) => [...el.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) && !el.closest('svg'))
          .map((el) => Number.parseFloat(getComputedStyle(el).fontSize)))))
      expect(Math.min(...sizes.flat()), 'warehouse text is at least 16 px on tablet').toBeGreaterThanOrEqual(16)
    }

    await confirm.click()
    await expect(page.getByRole('heading', { level: 1, name: approved.second, exact: true })).toBeVisible()
    await expect(page.getByText(`Bước 2 / ${approved.total}`)).toBeVisible()
    expect(browserErrors).toStrictEqual([])
  })
}

test('a trip without an approved plan shows the empty state with a way out', async ({ page, login, browserErrors }) => {
  await login('/chuyen')
  const tripId = await page.evaluate(async (db) => {
    const { getMockDb } = (await import(db)) as typeof import('@/lib/mock-db')
    const store = getMockDb()
    const seed = await store.getTrip('TRIP-2026-0914')
    const trip = await store.createTrip({ name: 'Tuyến chưa duyệt', vehicleId: seed.vehicleId, stops: seed.stops, packages: seed.packages })
    return trip.id
  }, MOCK_DB)

  await navigateInApp(page, `/kho?chuyen=${tripId}`)
  await expect(page.getByText('Chưa có phương án đã duyệt', { exact: true })).toBeVisible()
  await expect(page.getByText(`Chuyến ${tripId} chưa có phương án đã duyệt.`, { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Xác nhận đã xếp', exact: true })).toHaveCount(0)
  await page.getByRole('link', { name: 'Tới danh sách chuyến', exact: true }).click()
  await page.waitForURL(/\/chuyen$/)
  expect(browserErrors).toStrictEqual([])
})
