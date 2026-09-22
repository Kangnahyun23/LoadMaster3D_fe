// Focused checks for the isolated design review. Run while Vite serves port 5182.
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5182/design/v2/trip-detail.html');
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const variant of ['a', 'b']) {
    await page.locator(`button[data-layout=${variant}]`).click();
    assert.equal(await page.locator('#app').getAttribute('data-layout'), variant);
    assert.equal(await page.locator(`button[data-layout=${variant}]`).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#rows tr').count(), 6);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `design/v2/trip-detail-${variant}.png`, fullPage: true });
    await page.locator('[data-package=PKG-003]').click();
    assert.match(await page.locator('#detail').innerText(), /30 kg/);
    assert.match(await page.locator('#detail').innerText(), /148,5 kg/);
    await page.screenshot({ path: `design/v2/trip-detail-${variant}-inspector.png`, fullPage: true });
    await page.locator('#close-detail').click();
  }
  await page.locator('button[data-layout=b]').click();
  const viewportEvidence = await page.evaluate(() => ({ tableTop: Math.round(document.querySelector('table').getBoundingClientRect().top), visibleRows: [...document.querySelectorAll('#rows tr')].filter(el => el.getBoundingClientRect().bottom <= innerHeight).length }));
  assert.ok(viewportEvidence.visibleRows >= 4);
  const lens = await page.locator('.glass-follow').evaluate(el => {
    const layer = getComputedStyle(el, '::before');
    return { left: layer.left, right: layer.right, top: layer.top, bottom: layer.bottom };
  });
  assert.deepEqual(lens, { left: '0px', right: '0px', top: '0px', bottom: '0px' });
  assert.equal(await page.locator('.hero-visual').count(), 0);
  assert.equal(await page.locator('#weight-ratio').innerText(), '61,5%');
  assert.equal(await page.locator('#volume-ratio').innerText(), '40,8%');
  assert.deepEqual(await page.locator('.metrics strong').evaluateAll(elements => [...new Set(elements.map(el => getComputedStyle(el).color))]), ['rgb(36, 49, 66)']);
  await page.locator('#search').fill('thuy tinh');
  assert.equal(await page.locator('#rows tr').count(), 1);
  await page.locator('[data-package=PKG-003]').click();
  assert.match(await page.locator('#detail').innerText(), /30 kg/);
  await page.locator('#close-detail').click();
  assert.equal(await page.locator('[data-package=PKG-003]').evaluate(el => el === document.activeElement), true);
  await page.locator('#all-stops').click();
  await page.locator('#fragile').click();
  assert.equal(await page.locator('#rows tr').count(), 2);
  await page.locator('#all-stops').click();
  await page.locator('[data-stop="3"]').click();
  assert.match(await page.locator('#count').innerText(), /27 kiện/);
  assert.match(await page.locator('#filter-summary').innerText(), /Điểm 3/);
  await page.locator('#clear-filters').click();
  assert.equal(await page.locator('#rows tr').count(), 6);
  assert.equal(await page.locator('#search').evaluate(el => el === document.activeElement), true);
  const compactHeight = await page.locator('#rows tr').first().evaluate(el => el.getBoundingClientRect().height);
  await page.locator('#density').click();
  assert.ok(await page.locator('#rows tr').first().evaluate(el => el.getBoundingClientRect().height) > compactHeight);
  await page.locator('#density').click();
  await page.locator('#glass').uncheck();
  assert.equal(await page.locator('#app').evaluate(el => el.classList.contains('glass')), false);
  await page.screenshot({ path: 'design/v2/trip-detail-b-solid.png', fullPage: true });
  await page.locator('#glass').check();
  await page.locator('#search').fill('khong-co-kien-nay');
  assert.match(await page.locator('#rows').innerText(), /Không có kiện phù hợp/);
  await page.locator('#all-stops').click();
  await page.locator('[data-sort=quantity]').click();
  assert.equal(await page.locator('#rows tr').first().locator('td').nth(2).innerText(), '11');
  await page.locator('[data-sort=quantity]').click();
  assert.equal(await page.locator('#rows tr').first().locator('td').nth(2).innerText(), '38');
  assert.equal(await page.locator('[data-sort=quantity]').locator('..').getAttribute('aria-sort'), 'descending');
  await page.locator('[data-package=PKG-003]').click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#detail').isVisible(), false);
  assert.equal(await page.locator('[data-package=PKG-003]').evaluate(el => el === document.activeElement), true);
  for (const state of ['planning', 'stale', 'loading', 'delivering', 'fetching', 'error', 'empty', 'missing']) {
    await page.locator('#scenario').selectOption(state);
    const fullState = ['fetching', 'error', 'empty', 'missing'].includes(state);
    assert.equal(await page.locator('.state-surface').isVisible(), fullState);
    assert.equal(await page.locator('.cargo').isVisible(), !fullState);
    if (state === 'stale') await page.screenshot({ path: 'design/v2/trip-detail-stale.png', fullPage: true });
    if (state === 'loading') assert.match(await page.locator('#workflow-notice').innerText(), /khoá chỉnh sửa/);
    if (state === 'error') {
      await page.locator('#retry-scenario').click();
      assert.equal(await page.locator('#scenario').inputValue(), 'approved');
    }
  }
  await page.locator('#scenario').selectOption('approved');
  assert.equal(await page.locator('.steps .next').count(), 1);
  assert.equal(await page.locator('.steps .current').count(), 0);
  for (const width of [1024, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `overflow at ${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: 'design/v2/trip-detail-phone.png', fullPage: true });
  await page.locator('[data-package=PKG-003]').click();
  assert.equal(await page.locator('#detail-dialog').evaluate(el => el.open), true);
  assert.ok(await page.locator('#close-detail').evaluate(el => el.getBoundingClientRect().top > 0 && el.getBoundingClientRect().bottom < innerHeight));
  await page.screenshot({ path: 'design/v2/trip-detail-sheet.png' });
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#detail-dialog').evaluate(el => el.contains(document.activeElement)), true);
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.waitForFunction(() => !document.getElementById('detail-dialog').open);
  assert.equal(await page.locator('#detail-dialog').evaluate(el => el.open), false);
  assert.equal(await page.locator('.context #detail').isVisible(), true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.getElementById('detail-dialog').open);
  assert.equal(await page.locator('#detail-dialog').evaluate(el => el.open), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#detail-dialog').evaluate(el => el.open), false);
  assert.equal(await page.locator('[data-package=PKG-003]').evaluate(el => el === document.activeElement), true);
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('http://127.0.0.1:5182/design/v2/sketchbook.html');
  await page.locator('img').evaluateAll(async images => { await Promise.all(images.map(img => { img.loading = 'eager'; return img.decode(); })); });
  assert.equal(await page.locator('.board-section').count(), 6);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: 'design/v2/sketchbook-preview.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'sketchbook phone overflow');
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('http://127.0.0.1:5182/design/v2/trip-detail.html?layout=b&package=PKG-003');
  assert.equal(await page.locator('#detail').isVisible(), true);
  assert.deepEqual(errors, []);
  console.log('B viewport:', viewportEvidence, 'PASS scenarios, sorting, mobile modal/Escape/focus, 768/1024 widths, sketchbook image loading and deep link.');
  console.log('PASS: A/B at 1366, no page overflow at 1366/390, search without accents, stop/fragile filters, empty state, details/focus return in both layouts, density, glass toggle, full-button glass reflection, capacity ratios; no JS runtime errors.');
} finally {
  await browser.close();
}
