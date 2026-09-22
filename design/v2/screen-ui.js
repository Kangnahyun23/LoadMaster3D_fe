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
// Lucide icon paths, ISC license: https://lucide.dev/license — cùng bộ với trip-detail.js.
const iconPaths = {
  truck: '<path d="M10 17h4V5H2v12h3m10-9h4l3 4v5h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>',
  fleet: '<path d="M3 21V7l9-4 9 4v14M9 21v-8h6v8M3 11h18M3 16h6m6 0h6"/>',
  box: '<path d="m21 8-9 5-9-5m9 5v9M3 8v10l9 4 9-4V8L12 3 3 8Zm4.5-2.5 9 5"/>',
  chart: '<path d="M3 3v18h18M7 16v-5m5 5V8m5 8v-3"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  log: '<path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M8 11h8M8 15h5"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  review: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  calendar: '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>',
  check: '<path d="M21.8 10A10 10 0 1 1 17 3.3"/><path d="m9 11 3 3L22 4"/>',
  weight: '<circle cx="12" cy="5" r="3"/><path d="M6.5 8h11l1.7 12H4.8Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.2 2.2m9.8 9.8 2.2 2.2M4.9 19.1l2.2-2.2m9.8-9.8 2.2-2.2"/>',
  compare: '<path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7"/>',
  cube: '<path d="M12 2 3 7v10l9 5 9-5V7Z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
};
export const icon = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] ?? ''}</svg>`;
// Mỗi màn một icon để nhận ra ngay đang đứng ở đâu; màn phụ mượn icon của nhánh cha.
export const screenIcon = { trips: 'truck', create: 'truck', optimize: 'settings', planner: 'cube', cargo: 'box', compare: 'compare', fleet: 'fleet', vehicle: 'fleet', dashboard: 'chart', users: 'users', audit: 'log', profile: 'user', components: 'grid', driver: 'truck', warehouse: 'box', queue: 'log' };
// Ô số liệu dùng chung. Tông: xanh = vận hành, lá = sẵn sàng/xong, hổ phách = cần chú ý,
// tím = phân tích phụ, xám = ngữ cảnh (không phải số đo).
export const metricTile = ({ tone = 'blue', icon: name, value, label, note = '', unit = '', filter = '' }) => {
  const body = `<span class="kpi-icon ${tone}">${icon(name)}</span><div><strong>${value}${unit ? `<em>${unit}</em>` : ''}</strong><span>${label}</span>${note ? `<small>${note}</small>` : ''}</div>`;
  return filter
    ? `<button type="button" class="kpi-tile kpi-action" data-filter="${filter}">${body}</button>`
    : `<div class="kpi-tile">${body}</div>`;
};
export const metricGrid = items => `<section class="kpi-grid" aria-label="Số liệu tổng hợp">${items.map(metricTile).join('')}</section>`;
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
  const motif = '<svg class="hero-motif" viewBox="0 0 420 120" fill="none" aria-hidden="true"><path d="M-10 96h96l26-34h84l22-30h96l28-22h114" stroke="currentColor" stroke-width="1.5"/><rect x="238" y="40" width="34" height="26" rx="2" stroke="currentColor"/><rect x="276" y="52" width="24" height="14" rx="2" stroke="currentColor"/><rect x="196" y="66" width="28" height="20" rx="2" stroke="currentColor"/><circle cx="118" cy="96" r="5" stroke="currentColor"/><circle cx="330" cy="18" r="5" stroke="currentColor"/></svg>';
  const lede = screenLede[screen] ? `<p class="suite-lede">${screenLede[screen]}</p>` : '';
  return `${reviewBar(screen)}<div class="suite-shell"><header class="suite-rail"><a class="brand" href="${href('trips')}"><span class="brand-mark">L</span>LoadMaster</a><nav class="glass-nav suite-nav" aria-label="Điều hướng chính">${navPrimary.map(([key, label]) => `<a href="${href(key)}" ${key === parent ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav><a class="suite-person" href="${href('profile')}"><span class="avatar">LM</span><span><strong>Duyệt thiết kế</strong><small>Menu gộp các vai trò</small></span></a></header><div class="suite-work"><nav class="suite-top" aria-label="Đường dẫn"><span class="breadcrumb">${trail}</span>${badge('MOCK RESULT', 'mock')}</nav><main class="suite-main"><header class="suite-title">${motif}<span class="hero-icon">${icon(screenIcon[screen] ?? 'grid', 22)}</span><div class="hero-text"><h1>${screenNames[screen]}</h1>${lede}</div><div class="hero-actions">${action}</div></header>${content}</main></div></div>`;
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
