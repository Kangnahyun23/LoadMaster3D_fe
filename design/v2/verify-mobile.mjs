import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 await page.emulateMedia({reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const go=async(view,role='driver',extra='')=>{await page.goto(`http://127.0.0.1:5182/design/v2/mobile.html?view=${view}&role=${role}${extra}`);await page.evaluate(()=>document.fonts.ready);};
 for(const view of ['home','stop','scene','scan','issue','queue','profile']){
  await go(view);assert.equal(await page.locator('.m-device').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,view);
  await page.screenshot({path:`design/v2/mobile-${view}.png`,fullPage:true});
 }
 await go('home','warehouse');await page.screenshot({path:'design/v2/mobile-warehouse-home.png'});
 await go('scene','warehouse');await page.screenshot({path:'design/v2/mobile-loading.png'});
 assert.match(await page.locator('#m-step-label').textContent(),/1 \/ 132/);
 await go('scene');const first=await page.locator('#m-package-id').textContent();await page.locator('#step-next').click();assert.notEqual(await page.locator('#m-package-id').textContent(),first);
 await page.locator('#step-range').fill('37');assert.equal(await page.locator('#step-next').isDisabled(),true);
 await page.locator('#step-play').click();await page.waitForFunction(()=>document.querySelector('#step-count').textContent==='2 / 38');await page.locator('#step-play').click();
 await page.locator('#scene-options').click();await page.locator('#show-legend').check();await page.locator('#show-warning').check();await page.keyboard.press('Escape');assert.equal(await page.locator('#m-advisory').isVisible(),true);await page.screenshot({path:'design/v2/mobile-scene-warning.png',fullPage:true});
 await page.locator('#package-open').click();assert.equal(await page.locator('#package-sheet').evaluate(d=>d.open),true);await page.screenshot({path:'design/v2/mobile-package-sheet.png'});await page.keyboard.press('Escape');
 await go('stop');await page.locator('#m-stop').selectOption('2');assert.equal(await page.locator('.m-cargo-line').count(),2);assert.match(await page.locator('.m-action-footer a').getAttribute('href'),/stop=2/);
 await go('scan');await page.locator('#m-scan-code').fill('WRONG');await page.locator('#m-scan-form .primary').click();assert.equal(await page.locator('#m-scan-code').getAttribute('aria-invalid'),'true');await page.locator('#m-fill-code').click();await page.locator('#m-scan-form .primary').click();assert.equal(await page.locator('#m-scan-code').getAttribute('aria-invalid'),'false');
 await go('issue');await page.locator('#m-issue-note').fill('Thùng hàng bị móp góc, cần đối chiếu.');await page.locator('#m-photo').setInputFiles('design/v2/mobile-engine-overview.png');assert.equal(await page.locator('#m-photo-preview img').count(),1);await page.locator('#m-issue-form .primary').click();await page.waitForURL(/view=queue/);assert.equal(await page.locator('.m-queue-item').count(),1);await page.locator('[data-retry]').click();assert.match(await page.locator('.m-queue-item').textContent(),/Chưa gửi được/);await page.screenshot({path:'design/v2/mobile-queue-failed.png'});await page.locator('#m-network').selectOption('online');await page.locator('[data-retry]').click();assert.match(await page.locator('.m-queue-item').textContent(),/Đã gửi · mô phỏng/);await page.locator('[data-remove]').click();assert.equal(await page.locator('.m-queue-item').count(),0);
 await go('settings');await page.locator('#m-solid').check();await go('home');assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('m-solid')),true);
 for(const width of [360,430]){await page.setViewportSize({width,height:800});for(const view of ['home','scene','stop']){await go(view);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${view} ${width}`);}}
 await go('scene','driver','&stop=2');await page.locator('#step-next').click();const secondStopId=await page.locator('#m-package-id').textContent();await page.locator('#scene-scan').click();await page.locator('.m-action-footer a').click();assert.equal(await page.locator('#m-package-id').textContent(),secondStopId);assert.match(await page.locator('#scene-stop-name').textContent(),/Điểm 2/);
 for(const width of [390,1366]){await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:5182/design/v2/mobile-board.html');await page.evaluate(()=>document.fonts.ready);assert.equal(await page.locator('.phone').count(),21);for(const img of await page.locator('.phone img').all())await img.scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.evaluate(()=>scrollTo(0,0));if(width===1366)await page.screenshot({path:'design/v2/mobile-board-preview.png'});}
 assert.deepEqual(errors,[]);console.log('Mobile prototype pass: 7 views, 2 roles, 360/390/430px, steps/playback, sheets, stop/scan continuity, photo preview, queue retry, solid preference and 21-image board.');
}finally{await browser.close();}




