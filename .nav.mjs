import fs from 'node:fs';

// ---- JS: port nguyên cơ chế của trip-detail.js thành helper dùng chung ----
const p = 'design/v2/screen-ui.js';
let s = fs.readFileSync(p, 'utf8');
const helper = `// Chỉ báo kính chạy theo con trỏ. Port nguyên cơ chế của trip-detail.js: một nav
// một chỉ báo, bám hover và focus, trả về mục đang mở khi rời nav. Không nghe
// pointermove, không vòng lặp frame — chỉ pointerenter/focus và một ResizeObserver.
export function setupGlassNav(nav) {
  if (!nav) return;
  let indicator = nav.querySelector('.glass-follow');
  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'glass-follow';
    nav.prepend(indicator);
  }
  const current = nav.querySelector('[aria-current]');
  const anchor = link => {
    // Màn phụ như Hồ sơ hay Bảng thành phần không có mục nav nào đang mở;
    // lúc đó giấu chỉ báo thay vì neo nó vào một chỗ tuỳ tiện.
    if (!link) { indicator.hidden = true; return; }
    indicator.hidden = false;
    indicator.style.transform = \`translateY(\${link.offsetTop}px)\`;
    indicator.style.left = \`\${link.offsetLeft}px\`;
    indicator.style.width = \`\${link.offsetWidth}px\`;
    indicator.style.height = \`\${link.offsetHeight}px\`;
  };
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('pointerenter', () => anchor(link));
    link.addEventListener('focus', () => anchor(link));
  });
  nav.addEventListener('pointerleave', () => anchor(current));
  nav.addEventListener('focusout', e => { if (!nav.contains(e.relatedTarget)) anchor(current); });
  new ResizeObserver(() => anchor(current)).observe(nav);
  anchor(current);
  // Đặt đúng chỗ xong mới bật chuyển động, nếu không lúc tải trang chỉ báo sẽ
  // trượt từ mép trái nav vào mục đang mở.
  requestAnimationFrame(() => { nav.dataset.follow = 'ready'; });
}
`;
if (!s.includes('export function activateShell()')) throw new Error('activateShell');
s = s.replace('export function activateShell()', helper + 'export function activateShell()');
s = s.replace("  $('screen-picker').addEventListener('change', e => { location.href = href(e.target.value); });",
  "  $('screen-picker').addEventListener('change', e => { location.href = href(e.target.value); });\n  setupGlassNav(document.querySelector('.suite-nav'));");
fs.writeFileSync(p, s);

// ---- CSS ----
const c = 'design/v2/screens.css';
let t = fs.readFileSync(c, 'utf8');
const swap = (a, b) => { if (!t.includes(a)) throw new Error('css miss: ' + a.slice(0, 60)); t = t.replace(a, b); };

// Nền và viền tĩnh của mục đang mở phải bỏ, nếu không sẽ có hai lớp pill chồng nhau.
swap('.suite-nav a:hover { background: #fff; color: var(--ink-1); }',
  '.suite-nav a:hover { color: var(--ink-1); }');
swap('.suite-nav [aria-current] { background: var(--surface); border: 1px solid var(--edge-strong); color: var(--brand); font-weight: 600; box-shadow: none; }',
  '.suite-nav [aria-current] { color: #1555d1; font-weight: 600; }');

// Vật liệu chỉ báo: chép đúng khối .glass .glass-follow của concepts.css, chỉ đổi
// bo góc cho vừa mục nav. Vỏ .glass-follow và ::before đã khai báo chung ở
// concepts.css nên không chép lại. --spring-easing cũng dùng thẳng từ :root.
swap('.suite-person { margin-left: auto;',
  `.suite-nav .glass-follow { overflow: hidden; border-radius: 7px; background: linear-gradient(125deg,#ffffffe0,#ffffff55 60%,#ffffffad); border: 1px solid white; backdrop-filter: blur(5px) saturate(1.4); box-shadow: 0 5px 10px #46658721,inset 0 1px 0 #fff,inset 0 -1px 1px #aec1d950; }
.suite-nav[data-follow=ready] .glass-follow { transition: transform 1s var(--spring-easing),left 1s var(--spring-easing),width 1s var(--spring-easing),height 1s var(--spring-easing); }
@media (prefers-reduced-motion: reduce) { .suite-nav[data-follow=ready] .glass-follow { transition: none; } }
.suite-person { margin-left: auto;`);
fs.writeFileSync(c, t);

// Chế độ nền đặc: chỉ báo bỏ kính nhưng vẫn chạy theo con trỏ.
const d = 'design/v2/desktop.css';
let u = fs.readFileSync(d, 'utf8');
const solid = '.solid-desktop .suite-nav [aria-current] { background: #eaf2ff; box-shadow: none; border-color: #bfd3ef; }';
if (!u.includes(solid)) throw new Error('solid rule');
u = u.replace(solid, '.solid-desktop .suite-nav .glass-follow { background: #e3edfd; border-color: #bfd3ef; backdrop-filter: none; box-shadow: none; }\n.solid-desktop .suite-nav .glass-follow::before { display: none; }');
fs.writeFileSync(d, u);
console.log('port xong');
