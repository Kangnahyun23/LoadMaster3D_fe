import { $, escape } from './screen-ui.js';
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
export function bindPreviewForm(formId, resultId, message) {
  $(formId).onsubmit = event => { event.preventDefault(); $(resultId).textContent = message; };
}
export const input = (label, name, value, attrs = '') => `<label class="field">${label}<input name="${name}" value="${escape(value)}" ${attrs}></label>`;
