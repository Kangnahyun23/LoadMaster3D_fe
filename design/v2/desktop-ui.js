import { $, escape, href } from './screen-ui.js';
export const roleNames = { dispatcher: 'Điều phối', manager: 'Quản lý', warehouse: 'Nhân viên kho', driver: 'Tài xế', admin: 'Quản trị' };
export const statusNames = { nhap: 'Nháp', da_toi_uu: 'Chờ duyệt', da_duyet: 'Đã duyệt', can_xem_lai: 'Cần duyệt lại', dang_xep_hang: 'Đang xếp', da_xep_xong: 'Đã xếp xong', dang_giao: 'Đang giao', hoan_thanh: 'Hoàn thành', da_huy: 'Đã huỷ' };
export const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
export const dateTime = value => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value));
export const notice = text => `<p class="source-note">${text}</p>`;
export function download(name, text, mime = 'text/plain') {
  const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function table(headers, body, id = '') {
  return `<div class="desktop-table-scroll"><table class="desktop-table" ${id ? `id="${id}"` : ''}><thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
}
export function enhanceDesktop(screen) {
  const rail = document.querySelector('.suite-rail');
  if (!rail) return;
  const groups = [ ['Công việc', [['trips','Chuyến hàng'],['cargo','Kiện hàng'],['compare','So sánh phương án']]],
    ['Quản lý', [['dashboard','Tổng quan'],['fleet','Đội xe'],['users','Người dùng'],['audit','Nhật ký']]],
    ['Cá nhân & tài liệu', [['profile','Hồ sơ'],['components','Bảng thành phần']]] ];
  rail.querySelector('nav').outerHTML = `<nav class="desktop-nav" aria-label="Điều hướng phác thảo desktop">${groups.map(([label,items]) => `<div class="nav-group"><span>${label}</span><div class="glass-nav">${items.map(([key,title]) => `<a href="${href(key)}" ${key === screen || key === 'fleet' && screen === 'vehicle' ? 'aria-current="page"' : ''}>${title}</a>`).join('')}</div></div>`).join('')}</nav>`;
  rail.querySelector('.rail-extra')?.remove();
  const caption = rail.querySelector(':scope > .suite-caption'); if (caption) caption.textContent = 'Bộ phác thảo desktop';
  const person = rail.querySelector('.suite-person'); if (person) person.innerHTML = '<span class="avatar">LM</span><span>Duyệt thiết kế<small>Menu tổng hợp các vai trò</small></span>';
  const crumb = document.querySelector('.suite-title .suite-caption'); if (crumb) crumb.textContent = ['users','audit'].includes(screen) ? 'Quản trị / Phác thảo' : screen === 'dashboard' ? 'Quản lý / Phác thảo' : 'Desktop / Phác thảo';
}
export function bindPreviewForm(formId, resultId, message) {
  $(formId).onsubmit = event => { event.preventDefault(); $(resultId).textContent = message; };
}
export const input = (label, name, value, attrs = '') => `<label class="field">${label}<input name="${name}" value="${escape(value)}" ${attrs}></label>`;
