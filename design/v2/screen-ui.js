import { screenNames } from './screens.mock.js';
export const $ = id => document.getElementById(id);
export const fmt = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
export const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const href = screen => `./screens.html?screen=${screen}`;
export const badge = (label, tone = 'neutral') => `<span class="badge ${tone}">${label}</span>`;
export const link = (label, screen, primary = false) => `<a class="button ${primary ? 'primary' : 'secondary'}" href="${href(screen)}">${label}</a>`;
export function reviewBar(screen) {
  return `<div class="suite-review"><a href="./sketchbook.html">← Bảng phác thảo</a><label>Màn <select id="screen-picker">${Object.entries(screenNames).map(([key, label]) => `<option value="${key}" ${key === screen ? 'selected' : ''}>${label}</option>`).join('')}</select></label><span>Prototype · Không ghi dữ liệu thật</span></div>`;
}
export function shell(screen, content, action = '') {
  return `${reviewBar(screen)}<div class="suite-shell"><aside class="suite-rail"><a class="brand" href="${href('trips')}"><span class="brand-mark">L</span>LoadMaster</a><span class="suite-caption">Điều phối vận tải</span><nav class="glass glass-nav" aria-label="Điều hướng mẫu"><a href="${href('trips')}" ${screen === 'trips' ? 'aria-current="page"' : ''}>Chuyến hàng</a><a href="${href('create')}" ${screen === 'create' ? 'aria-current="page"' : ''}>Lập chuyến mới</a><a href="${href('optimize')}" ${screen === 'optimize' ? 'aria-current="page"' : ''}>Thiết lập tối ưu</a><a href="${href('planner')}" ${screen === 'planner' ? 'aria-current="page"' : ''}>Không gian 3D</a></nav><div class="rail-extra"><span class="suite-caption">Ứng dụng hiện trường</span><a href="${href('driver')}">Tài xế ↗</a><a href="${href('warehouse')}">Nhân viên kho ↗</a></div><div class="suite-person"><span class="avatar">ĐP</span><span>Điều phối viên<small>Không gian mẫu</small></span></div></aside><div class="suite-work"><header class="suite-top"><span>LoadMaster / ${screenNames[screen]}</span>${badge('MOCK RESULT', 'mock')}</header><main class="suite-main"><div class="suite-title"><div><p class="suite-caption">Điều phối / ${screen === 'trips' ? 'Danh sách' : 'Chuyến hàng'}</p><h1>${screenNames[screen]}</h1></div>${action}</div>${content}</main></div></div>`;
}
export function mobileShell(screen, content, footer = '') {
  return `${reviewBar(screen)}<div class="mobile-stage"><aside class="mobile-notes"><span class="suite-caption">Phác thảo mobile / Android trước</span><h1>${screenNames[screen]}</h1><p>Cùng nhận diện với web. Một việc chính trên mỗi màn, nút lớn, không cần thao tác hover.</p><nav>${link('Tài xế', 'driver')}${link('Kho', 'warehouse')}${link('Gửi lại', 'queue')}</nav><small>Các thao tác chỉ đổi trạng thái mẫu trong trang. Chưa là app Flutter và chưa gửi dữ liệu.</small></aside><div class="phone-app"><header class="phone-header"><a href="${href(screen === 'queue' ? 'driver' : 'trips')}" aria-label="Quay lại">←</a><strong>${screenNames[screen]}</strong>${badge('Mẫu', 'info')}</header>${content}${footer ? `<footer class="phone-actions">${footer}</footer>` : ''}</div></div>`;
}
export function dialog(id, title, content) {
  return `<dialog id="${id}" aria-labelledby="${id}-title" class="suite-dialog"><form method="dialog"><header><h2 id="${id}-title">${title}</h2><button class="button secondary" aria-label="Đóng hộp thoại">Đóng ×</button></header></form>${content}</dialog>`;
}
export function activateShell() {
  $('screen-picker').addEventListener('change', e => { location.href = href(e.target.value); });
  document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) { const r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } }));
  document.querySelectorAll('dialog').forEach(d => d.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const controls = [...d.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled)')].filter(el => el.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  }));
}
