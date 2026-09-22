import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const browser=await chromium.launch();
try {
  const page=await browser.newPage({viewport:{width:1366,height:900}});
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const go=async screen=>{await page.goto(`http://127.0.0.1:5182/design/v2/screens.html?screen=${screen}`);await page.evaluate(()=>document.fonts.ready);};
  for(const s of ['cargo','compare','dashboard','fleet','vehicle','users','audit','profile','components']){
    await go(s);assert.equal(await page.locator('h1').count(),1,s);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,s);
    await page.screenshot({path:`design/v2/screen-${s}.png`,fullPage:true});
  }
  await go('cargo');await page.locator('#cargo-search').fill('thuy tinh');assert.equal(await page.locator('#cargo-table tbody tr').count(),1);
  await page.locator('[data-cargo=PKG-003]').click();await page.locator('[name=quantity]').fill('12');await page.locator('#cargo-form button').click();assert.match(await page.locator('#cargo-total').textContent(),/133 kiện/);
  await page.locator('#import-open').click();await page.locator('#import-example').click();await page.locator('#import-check').click();assert.match(await page.locator('#import-result').textContent(),/trùng mã/);
  await page.screenshot({path:'design/v2/screen-import-errors.png',fullPage:true});await page.keyboard.press('Escape');
  await go('compare');await page.locator('[value=REV-001]').check();assert.match(await page.locator('#open-revision').getAttribute('href'),/revision=REV-001/);await page.locator('#only-differences').check();assert.match(await page.locator('#comparison-table').textContent(),/Không có khác biệt/);
  await go('fleet');await page.locator('[data-filter=maintenance]').click();assert.equal(await page.locator('#fleet-table tbody tr').count(),1);assert.match(await page.locator('#fleet-table').textContent(),/Mighty/);
  await go('vehicle&new=1');await page.locator('[name=name]').fill('Xe thử');for(const name of ['length','width','height','payload','doorWidth','doorHeight'])await page.locator(`[name=${name}]`).fill('200');await page.locator('[name=doorWidth]').fill('201');await page.locator('#vehicle-form button').click();assert.match(await page.locator('#vehicle-result').textContent(),/không được/);await page.locator('[name=doorWidth]').fill('190');await page.locator('#vehicle-form button').click();assert.equal(await page.locator('#vehicle-review').evaluate(d=>d.open),true);
  await go('dashboard');await page.locator('#dashboard-period').selectOption('month');assert.equal(await page.locator('.dashboard-kpis strong').first().textContent(),'10');const download=page.waitForEvent('download');await page.locator('#export-summary').click();assert.match((await download).suggestedFilename(),/\.csv$/);
  await go('users');await page.locator('#user-role').selectOption('driver');assert.equal(await page.locator('#users-table tbody tr').count(),4);await page.locator('#permissions-open').click();assert.equal(await page.locator('#permissions-dialog tbody tr').count(),13);await page.screenshot({path:'design/v2/screen-permissions.png',fullPage:true});await page.keyboard.press('Escape');
  await go('audit');await page.locator('#audit-next').click();assert.match(await page.locator('#audit-count').textContent(),/16–30/);await page.locator('#audit-search').fill('TRIP-013');assert.ok(await page.locator('[data-event]').count()>0);await page.locator('[data-event]').first().click();assert.equal(await page.locator('#audit-detail').evaluate(d=>d.open),true);
  await go('profile');await page.locator('[name=phone]').fill('123');await page.locator('#profile-form button').click();assert.match(await page.locator('#profile-result').textContent(),/10 chữ số/);await page.locator('[name=phone]').fill('0901234567');await page.locator('#profile-form button').click();assert.match(await page.locator('#profile-result').textContent(),/đúng định dạng/);await page.locator('#solid-preference').check();await go('fleet');assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('solid-desktop')),true);
  await go('components');await page.locator('#spec-form button').click();assert.equal(await page.locator('#spec-quantity').getAttribute('aria-invalid'),'true');await page.locator('#spec-quantity').fill('2');await page.locator('#spec-form button').click();assert.equal(await page.locator('#spec-quantity').getAttribute('aria-invalid'),'false');
  assert.deepEqual(errors,[]);console.log('9 desktop screens pass: rendering, overflow, edit/import review, comparison, fleet, vehicle form, dashboard/export, permissions, audit, profile and specimen states.');
} finally {await browser.close();}
