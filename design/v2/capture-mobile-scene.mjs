// Capture the existing engine for a read-only UI sketch. No new 3D renderer.
import { chromium } from '@playwright/test';
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:1100,height:820},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:5182/chuyen/TRIP-2026-0914/phuong-an?debug&quality=balanced');
 await page.getByLabel('Email',{exact:true}).fill('dieuphoi@loadmaster.vn');
 await page.getByLabel('Mật khẩu',{exact:true}).fill('loadmaster');
 await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
 await page.locator('canvas').waitFor({timeout:60000});
 await page.waitForFunction(async()=>{const {_roots}=await import('/node_modules/.vite/deps/@react-three_fiber.js');const c=document.querySelector('canvas');const s=_roots.get(c)?.store.getState();return s&&s.scene.getObjectByName('cargo-opaque')&&s.internal.frames===0;},{},{timeout:60000});
 await page.addStyleTag({content:'body * { visibility:hidden !important; } canvas { visibility:visible !important; background:#1a1d23 !important; }'});
 await page.locator('canvas').screenshot({path:'design/v2/mobile-engine-overview.png'});
 console.log('Captured existing seed engine canvas for the mobile sketch.');
} finally {await browser.close();}
