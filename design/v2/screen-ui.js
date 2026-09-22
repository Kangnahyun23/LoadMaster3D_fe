import { screenNames } from './screens.mock.js';
export const $ = id => document.getElementById(id);
export const fmt = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
export const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const href = screen => `./screens.html?screen=${screen}`;
export const badge = (label, tone = 'neutral') => `<span class="badge ${tone}">${label}</span>`;
export const link = (label, screen, primary = false) => `<a class="button ${primary ? 'primary' : 'secondary'}" href="${href(screen)}">${label}</a>`;
// Điều hướng chính: sáu vùng làm việc, giống nav rail của app thật.
// Màn phụ mượn mục cha để người đọc biết mình đang ở nhánh nào.
export const navPrimary = [['trips', 'Chuyến hàng'], ['cargo', 'Kiện hàng'], ['fleet', 'Đội xe'], ['dashboard', 'Tổng quan'], ['users', 'Người dùng'], ['audit', 'Nhật ký']];
export const navParent = { create: 'trips', optimize: 'trips', planner: 'trips', compare: 'trips', vehicle: 'fleet' };
// Mỗi màn nói việc nó phục vụ, thay cho eyebrow "Desktop / Phác thảo" vô nghĩa.
export const screenLede = {
  trips: 'Chuyến trong kỳ, trạng thái phương án và việc cần xử lý trước khi bàn giao kho.',
  create: 'Nhập thông tin chuyến, chọn xe và sắp thứ tự điểm giao.',
  optimize: 'Khai báo yêu cầu xếp và kiểm tra đầu vào trước khi chạy tối ưu.',
  planner: 'Đọc phương án trong không gian 3D và kiểm tra từng kiện.',
  cargo: 'Danh mục kiện của chuyến, sửa thông số và kiểm dữ liệu nhập.',
  compare: 'Đối chiếu các bản phương án đã lưu của cùng một chuyến.',
  fleet: 'Trạng thái đội xe và xe đang phục vụ chuyến nào.',
  vehicle: 'Kích thước lòng thùng, tải trọng và vật cản của một xe.',
  dashboard: 'Chuyến, tỷ lệ lấp đầy và khối lượng đã giao trong kỳ đang xem.',
  users: 'Tài khoản, vai trò và quyền trong hệ thống.',
  audit: 'Sự kiện ghi lại từ các thao tác có ghi dữ liệu.',
  profile: 'Thông tin cá nhân và tuỳ chọn hiển thị.',
  components: 'Hợp đồng thiết kế dùng chung cho web và Flutter.',
};
export function reviewBar(screen) {
  return `<div class="suite-review"><a href="./sketchbook.html">← Bảng phác thảo</a><label>Màn <select id="screen-picker">${Object.entries(screenNames).map(([key, label]) => `<option value="${key}" ${key === screen ? 'selected' : ''}>${label}</option>`).join('')}</select></label><a href="${href('components')}">Bảng thành phần ↗</a><span>Prototype · Không ghi dữ liệu thật</span></div>`;
}
// Khối tổng hợp trên nền kính: số cùng màu mực, đơn vị nhỏ hơn, mỗi ô một dòng nguồn.
export function summaryBlock(items, note = '') {
  return `<section class="summary-block${note ? ' has-note' : ''}" aria-label="Số liệu tổng hợp">${items.map(({ label, value, unit = '', note: hint = '' }) =>
    `<div><span>${label}</span><strong>${value}${unit ? `<em>${unit}</em>` : ''}</strong>${hint ? `<small>${hint}</small>` : ''}</div>`).join('')}${note ? `<p>${note}</p>` : ''}</section>`;
}
// Bề mặt đọc: nền rõ, viền mảnh, không kính lồng trong kính.
export function panel(title, body, extra = '') {
  return `<section class="surface-panel"><div class="panel-head"><h2>${title}</h2>${extra}</div>${body}</section>`;
}
export function shell(screen, content, action = '') {
  const parent = navParent[screen] ?? screen;
  const parentLabel = Object.fromEntries(navPrimary)[parent];
  const trail = parentLabel && parent !== screen
    ? `<a href="${href(parent)}">${parentLabel}</a><span>/</span><span>${screenNames[screen]}</span>`
    : `<span>${screenNames[screen]}</span>`;
  const lede = screenLede[screen] ? `<p class="suite-lede">${screenLede[screen]}</p>` : '';
  return `${reviewBar(screen)}<div class="suite-shell"><header class="suite-rail"><a class="brand" href="${href('trips')}"><span class="brand-mark">L</span>LoadMaster</a><nav class="glass-nav suite-nav" aria-label="Điều hướng chính">${navPrimary.map(([key, label]) => `<a href="${href(key)}" ${key === parent ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav><a class="suite-person" href="${href('profile')}"><span class="avatar">LM</span><span><strong>Duyệt thiết kế</strong><small>Menu gộp các vai trò</small></span></a></header><div class="suite-work"><nav class="suite-top" aria-label="Đường dẫn"><span class="breadcrumb">${trail}</span>${badge('MOCK RESULT', 'mock')}</nav><main class="suite-main"><div class="suite-title"><div><h1>${screenNames[screen]}</h1>${lede}</div>${action}</div>${content}</main></div></div>`;
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
