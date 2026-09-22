import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 await page.emulateMedia({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const go=async(view,extra='')=>{await page.goto(`http://127.0.0.1:5182/design/v2/mobile.html?view=${view}&role=driver${extra}`);await page.evaluate(()=>document.fonts.ready);};
 const shot=async name=>page.screenshot({path:`design/v2/mobile-${name}.png`});
 for(const view of ['login','settings','access','about','profile']){await go(view);await shot(view);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 await go('login');await page.locator('#login-email').fill('wrong@example.com');await page.locator('#login-password').fill('wrong');await page.locator('#login-submit').click();assert.equal(await page.locator('#login-error').isVisible(),true);await shot('login-error');
 await page.locator('[data-demo=warehouse]').click();await page.locator('#password-show').click();assert.equal(await page.locator('#login-password').getAttribute('type'),'text');await page.locator('#password-show').click();await page.locator('#login-submit').click();await page.waitForURL(/view=home&role=warehouse/);assert.match(await page.locator('.m-app-header').textContent(),/Kho/);
 assert.equal(await page.evaluate(()=>Object.values(sessionStorage).includes('loadmaster')),false);
 await go('login');await page.locator('[data-demo=driver]').click();await page.locator('#login-submit').click();await page.waitForURL(/view=home&role=driver/);
 await go('settings');for(const id of ['m-solid','m-large','m-motion'])await page.locator(`#${id}`).check();await go('home');for(const cls of ['m-solid','m-large-text','m-reduce-motion'])assert.equal(await page.locator('body').evaluate((el,c)=>el.classList.contains(c),cls),true);
 await go('settings');await page.locator('#permissions-open').click();await shot('permissions');assert.equal(await page.locator('#permissions-sheet').evaluate(d=>d.open),true);await page.keyboard.press('Escape');
 for(const width of [360,430]){await page.setViewportSize({width,height:800});for(const view of ['login','settings','profile','access','about','scene']){await go(view);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${view} large ${width}`);}}
 await page.setViewportSize({width:390,height:844});await go('settings');for(const id of ['m-solid','m-large','m-motion'])await page.locator(`#${id}`).uncheck();
 await go('issue');await page.locator('#m-issue-note').fill('Bao bì móp, cần kiểm tra lại.');await page.locator('#m-issue-form .primary').click();await page.waitForURL(/view=queue/);
 await go('profile');await page.locator('#logout-open').click();assert.match(await page.locator('#logout-sheet').textContent(),/Có 1 mục chưa gửi/);await shot('logout');await page.locator('#logout-save').click();await page.waitForURL(/view=login/);assert.equal(await page.evaluate(()=>sessionStorage.getItem('lm-mobile-demo-session')),null);assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('loadmaster-mobile-sketch-queue')).length),1);
 await go('home','&state=expired');await page.getByRole('link',{name:'Đăng nhập lại',exact:true}).click();await page.waitForURL(/view=login.*expired=1/);assert.match(await page.locator('.m-account-notice').textContent(),/Phiên đã hết hạn/);await shot('login-expired');
 await go('access');await page.locator('#copy-help').click();await page.waitForFunction(()=>document.querySelector('#copy-result').textContent.length>0);assert.match(await page.locator('#copy-result').textContent(),/Đã sao chép|sao chép thủ công/);
 assert.deepEqual(errors,[]);console.log('Mobile 03 pass: account role login/error/password visibility, expiry, logout preserving queue, support copy, settings persistence, permissions explanation and large text at 360/430px.');
}finally{await browser.close();}
