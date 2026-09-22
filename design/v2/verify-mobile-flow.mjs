import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 await page.emulateMedia({reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const go=async(view,extra='')=>{await page.goto(`http://127.0.0.1:5182/design/v2/mobile.html?view=${view}&role=driver${extra}`);await page.evaluate(()=>document.fonts.ready);};
 const shot=async name=>page.screenshot({path:`design/v2/mobile-${name}.png`});
 await go('home');await page.locator('#accept-open').click();await shot('accept');await page.locator('#accept-save').click();await page.waitForURL(/view=stop/);
 await page.locator('.m-action-footer a').click();await page.waitForURL(/view=scene/);const id=await page.locator('#m-package-id').textContent();
 await page.locator('#position-open').click();assert.match(await page.locator('#position-diagram').textContent(),new RegExp(id));await shot('position');await page.keyboard.press('Escape');
 await page.locator('#scene-scan').click();await page.waitForURL(/view=scan/);await page.locator('#m-scan-code').fill('WRONG');await page.locator('#check-code').click();assert.equal(await page.locator('#confirm-open').isVisible(),false);await shot('scan-error');
 await page.locator('#m-fill-code').click();await page.locator('#check-code').click();assert.equal(await page.locator('#confirm-open').isVisible(),true);
 // Changing the code after a successful match must revoke confirmation readiness.
 await page.locator('#m-scan-code').fill('OTHER');assert.equal(await page.locator('#confirm-open').isVisible(),false);
 await page.locator('#m-fill-code').click();await page.locator('#check-code').click();await page.locator('#confirm-open').click();assert.equal(await page.locator('#confirm-save').isDisabled(),true);await page.locator('#physical-check').check();await shot('confirm');await page.locator('#confirm-save').click();await page.waitForURL(/view=done/);await shot('done');assert.match(await page.locator('.m-progress-block').textContent(),/1 \/ 38/);
 await page.locator('.m-action-footer a').click();await page.waitForURL(/view=scene/);assert.notEqual(await page.locator('#m-package-id').textContent(),id);
 await go('scan',`&package=${id}&stop=1`);await page.locator('#m-fill-code').click();await page.locator('#check-code').click();assert.match(await page.locator('#m-scan-result').textContent(),/đã được xác nhận/);assert.equal(await page.locator('#confirm-open').isVisible(),false);await shot('scan-duplicate');
 await go('queue');assert.equal(await page.locator('.m-queue-item').count(),1);await page.locator('[data-retry]').click();assert.match(await page.locator('.m-queue-item').textContent(),/Chưa gửi được/);await shot('confirmation-queue');await page.locator('#m-network').selectOption('online');await page.locator('[data-retry]').click();assert.match(await page.locator('.m-queue-item').textContent(),/Đã gửi · mô phỏng/);
 for(const state of ['loading','empty','error','expired']){await go('home',`&state=${state}`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await shot(`state-${state}`);}
 await go('profile');await page.locator('.m-demo-access summary').click();await page.getByRole('button',{name:'Thử lại luồng nhận chuyến'}).click();await page.locator('#reset-flow-save').click();await page.waitForURL(/view=home/);assert.equal(await page.locator('#accept-open').isVisible(),true);
 // A direct link cannot bypass receiving the driver's assignment.
 await go('scan',`&package=${id}`);await page.locator('#m-fill-code').click();await page.locator('#check-code').click();assert.equal(await page.locator('#confirm-open').isVisible(),false);
 await page.setViewportSize({width:360,height:740});await go('home');await page.locator('#accept-open').scrollIntoViewIfNeeded();const box=await page.locator('#accept-open').boundingBox(),nav=await page.locator('.m-bottom-nav').boundingBox();assert.ok(box.y>=0&&box.y+box.height<=nav.y&&box.height>=56);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);console.log('Mobile 02 pass: receive trip → position → scan → confirm → next; changed/wrong/duplicate code guards, queued confirmation retry, reset, four lifecycle scenes.');
}finally{await browser.close();}

