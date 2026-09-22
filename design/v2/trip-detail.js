import { packages, stops, addresses } from './trip-detail.mock.js';
import { packageDetail } from './package-detail.js';
import { setupScenarios } from './scenarios.js';

// Lucide icon paths, ISC license: https://lucide.dev/license
const paths = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  truck: '<path d="M10 17h4V5H2v12h3m10-9h4l3 4v5h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>',
  fleet: '<path d="M3 21V7l9-4 9 4v14M9 21v-8h6v8M3 11h18M3 16h6m6 0h6"/>',
  box: '<path d="m21 8-9 5-9-5m9 5v9M3 8v10l9 4 9-4V8L12 3 3 8Zm4.5-2.5 9 5"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',
  density: '<path d="M4 6h16M4 12h16M4 18h16"/>',
};
document.querySelectorAll('[data-icon]').forEach(el => {
  el.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[el.dataset.icon]}</svg>`;
});
const $ = id => document.getElementById(id);
const routeSection = document.querySelector('.route');
document.querySelector('.overview').after(routeSection);
document.querySelector('.context').prepend($('detail'));
const filterContext = document.createElement('div');
filterContext.className = 'filter-context';
filterContext.hidden = true;
filterContext.innerHTML = '<span id="filter-summary" aria-live="polite"></span><button id="clear-filters">Bỏ bộ lọc</button>';
document.querySelector('.filters').after(filterContext);
const format = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const weightRatio = packages.reduce((n, p) => n + p.kg * p.quantity, 0) / 9500;
const volumeRatio = packages.reduce((n, p) => n + p.size.reduce((a, b) => a * b, 1) * p.quantity, 0) / (720 * 235 * 240);
const percent = new Intl.NumberFormat('vi-VN', { style: 'percent', maximumFractionDigits: 1 });
$('weight-ratio').textContent = percent.format(weightRatio);
$('volume-ratio').textContent = percent.format(volumeRatio);
$('weight-meter').value = weightRatio * 100;
$('volume-meter').value = volumeRatio * 100;
const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
let fragileOnly = false;
let selected = null;
let sort = { key: null, direction: 1 };
const phone = matchMedia('(max-width: 760px)');
const detailDialog = $('detail-dialog');
function mountDetail() {
  if (phone.matches && selected) {
    detailDialog.append($('detail'));
    if (!detailDialog.open) detailDialog.showModal();
  } else {
    if (detailDialog.open) detailDialog.close();
    document.querySelector('.context').prepend($('detail'));
  }
}
function closeDetail() {
  const id = selected;
  selected = null;
  render();
  document.querySelector(`[data-package="${id}"]`)?.focus({ preventScroll: true });
}
phone.addEventListener('change', mountDetail);
detailDialog.addEventListener('cancel', e => { e.preventDefault(); closeDetail(); });
detailDialog.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const targets = [...detailDialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled)')].filter(el => el.getClientRects().length);
  const first = targets[0], last = targets.at(-1);
  if (first && ((e.shiftKey && document.activeElement === first) || (!e.shiftKey && document.activeElement === last))) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && selected && !detailDialog.open) closeDetail(); });
$('total').textContent = format.format(packages.reduce((n, p) => n + p.quantity, 0));
$('lines').textContent = `${packages.length} dòng kiện · 4 điểm giao`;
$('weight').innerHTML = `${format.format(packages.reduce((n, p) => n + p.kg * p.quantity, 0))} <span class="metric-unit">kg</span>`;
$('volume').innerHTML = `${format.format(packages.reduce((n, p) => n + p.size.reduce((a, b) => a * b, 1) * p.quantity, 0) / 1e6)} <span class="metric-unit">m³</span>`;
$('route').innerHTML = stops.map((name, i) => {
  const group = packages.filter(p => p.stop === i + 1);
  return `<li><button data-stop="${i + 1}" aria-pressed="false"><span class="stop-dot stop-${i + 1}">${i + 1}</span><span><strong>${name}</strong><small>${addresses[i]}</small><small>${group.reduce((n, p) => n + p.quantity, 0)} kiện · ${format.format(group.reduce((n, p) => n + p.kg * p.quantity, 0))} kg</small></span></button></li>`;
}).join('');

function render() {
  const query = normalize($('search').value);
  const stop = Number($('stop').value);
  const visible = packages.filter(p => (!stop || p.stop === stop) && (!fragileOnly || p.fragile) && normalize(`${p.id} ${p.name}`).includes(query));
  if (sort.key) visible.sort((a, b) => sort.direction * (sort.key === 'name' ? a.name.localeCompare(b.name, 'vi') : a[sort.key] - b[sort.key]));
  if (!visible.some(p => p.id === selected)) selected = null;
  $('rows').innerHTML = visible.map(p => `<tr class="${selected === p.id ? 'selected' : ''}"><td><button class="package-link" data-package="${p.id}" aria-expanded="${selected === p.id}" aria-controls="detail"><span class="package-name">${p.name}</span><span class="package-code mono">${p.id}<span class="package-size">${p.size.join(' × ')} cm</span></span></button></td><td><span class="stop-label"><span class="stop-dot stop-${p.stop}">${p.stop}</span><span>${stops[p.stop - 1]}</span></span></td><td class="number mono">${p.quantity}</td><td class="number mono">${format.format(p.kg)}</td><td><span class="badge ${p.fragile ? 'warning' : 'neutral'}">${p.fragile ? 'Dễ vỡ' : p.upright ? 'Giữ đứng' : 'Được xoay'}</span></td></tr>`).join('') || '<tr><td colspan="5" class="empty">Không có kiện phù hợp. Hãy đổi từ khoá hoặc bộ lọc.</td></tr>';
  $('count').textContent = `${visible.length} / ${packages.length} dòng · ${visible.reduce((n, p) => n + p.quantity, 0)} kiện đang hiển thị`;
  document.querySelectorAll('[data-stop]').forEach(el => el.setAttribute('aria-pressed', String(Number(el.dataset.stop) === stop)));
  filterContext.hidden = !(stop || fragileOnly || query);
  $('filter-summary').textContent = [stop ? `Điểm ${stop} · ${stops[stop - 1]}` : '', fragileOnly ? 'Hàng dễ vỡ' : '', query ? `Tìm: ${$('search').value}` : ''].filter(Boolean).join(' / ');
  const p = packages.find(p => p.id === selected);
  $('detail').hidden = !p;
  if (p) $('detail').innerHTML = packageDetail(p, stops[p.stop - 1], format);
  mountDetail();
}
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function setLayout(layout, animate = false) {
  $('app').dataset.layout = layout;
  document.querySelectorAll('button[data-layout]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.layout === layout)));
  const url = new URL(location.href);
  url.searchParams.set('layout', layout);
  history.replaceState(null, '', url);
  if (animate && !reducedMotion.matches) document.querySelector('main').animate([{ opacity: .35, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' });
}
setLayout(new URL(location.href).searchParams.get('layout') === 'a' ? 'a' : 'b');
document.querySelectorAll('[data-layout]').forEach(el => {
  if (el.tagName !== 'BUTTON') return;
  el.addEventListener('click', () => {
    setLayout(el.dataset.layout, true);
  });
});
$('glass').addEventListener('change', e => $('app').classList.toggle('glass', e.target.checked));
$('density').addEventListener('click', e => {
  const spacious = $('app').classList.toggle('spacious');
  e.currentTarget.setAttribute('aria-pressed', String(spacious));
  e.currentTarget.lastElementChild.textContent = spacious ? 'Thoáng' : 'Gọn';
});
$('fragile').addEventListener('click', e => { fragileOnly = !fragileOnly; e.currentTarget.setAttribute('aria-pressed', String(fragileOnly)); render(); });
$('search').addEventListener('input', render);
$('stop').addEventListener('change', render);
$('route').addEventListener('click', e => { const button = e.target.closest('[data-stop]'); if (button) { $('stop').value = button.dataset.stop; render(); } });
$('all-stops').addEventListener('click', () => { $('stop').value = '0'; $('search').value = ''; fragileOnly = false; $('fragile').setAttribute('aria-pressed', 'false'); render(); });
$('clear-filters').addEventListener('click', () => { $('all-stops').click(); $('search').focus(); });
$('rows').addEventListener('click', e => { const button = e.target.closest('[data-package]'); if (button) { const id = button.dataset.package; selected = selected === id ? null : id; render(); if (!detailDialog.open) document.querySelector(`[data-package="${id}"]`).focus({ preventScroll: true }); else $('close-detail').focus(); } });
$('detail').addEventListener('click', e => { if (e.target.closest('#close-detail')) closeDetail(); });
document.querySelectorAll('[data-sort]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.sort;
  sort = { key, direction: sort.key === key ? -sort.direction : 1 };
  document.querySelectorAll('[data-sort]').forEach(b => {
    b.closest('th').setAttribute('aria-sort', b === button ? sort.direction === 1 ? 'ascending' : 'descending' : 'none');
    b.querySelector('span').textContent = b === button ? sort.direction === 1 ? '↑' : '↓' : '↕';
  });
  render();
}));
render();
setupScenarios(() => { selected = null; render(); });
const linkedPackage = new URL(location.href).searchParams.get('package');
if (packages.some(p => p.id === linkedPackage) && $('app').dataset.stateSurface !== 'true') { selected = linkedPackage; render(); }
const nav = document.querySelector('.glass-nav');
const indicator = document.createElement('span');
indicator.className = 'glass-follow';
nav.prepend(indicator);
const anchor = link => {
  indicator.style.transform = `translateY(${link.offsetTop}px)`;
  indicator.style.left = `${link.offsetLeft}px`;
  indicator.style.width = `${link.offsetWidth}px`;
  indicator.style.height = `${link.offsetHeight}px`;
};
const current = nav.querySelector('[aria-current]');
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('pointerenter', () => anchor(link));
  link.addEventListener('focus', () => anchor(link));
});
nav.addEventListener('pointerleave', () => anchor(current));
nav.addEventListener('focusout', e => { if (!nav.contains(e.relatedTarget)) anchor(current); });
new ResizeObserver(() => anchor(current)).observe(nav);
anchor(current);
