export const $=id=>document.getElementById(id);
export const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const fmt=new Intl.NumberFormat('vi-VN',{maximumFractionDigits:2});
const params=new URL(location.href).searchParams;
export const role=params.get('role')==='warehouse'?'warehouse':'driver';
export const link=(view,extra='')=>`./mobile.html?view=${view}&role=${role}${extra}`;
// Lucide paths (ISC), same icon family as production.
const paths={ back:'<path d="m15 18-6-6 6-6"/>',right:'<path d="m9 18 6-6-6-6"/>',box:'<path d="m21 8-9 5-9-5m9 5v9M3 8v10l9 4 9-4V8L12 3 3 8Zm4.5-2.5 9 5"/>',truck:'<path d="M10 17h4V5H2v12h3m10-9h4l3 4v5h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',sync:'<path d="M3 11a9 9 0 0 1 15-6l3 3M21 3v5h-5M21 13a9 9 0 0 1-15 6l-3-3M3 21v-5h5"/>',scan:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M7 8v8m4-8v8m3-8v8m3-8v8"/>',play:'<path d="m8 5 11 7-11 7Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',layers:'<path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Zm6-3v15m6-12v15"/>',alert:'<path d="m12 3 10 18H2ZM12 9v4m0 4h.01"/>',camera:'<rect x="2" y="6" width="20" height="15" rx="2"/><path d="m8 6 2-3h4l2 3"/><circle cx="12" cy="13" r="4"/>',check:'<path d="m5 12 4 4L19 6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>'};
export const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]??paths.box}</svg>`;
export const button=(text,view,primary=false,extra='')=>`<a class="m-button ${primary?'primary':'secondary'}" href="${link(view,extra)}">${text}</a>`;
export const tag=(text,tone='neutral')=>`<span class="m-tag ${tone}">${text}</span>`;
export const titles={login:'Đăng nhập',settings:'Cài đặt',access:'Hỗ trợ đăng nhập',about:'Thông tin ứng dụng',done:'Đã ghi nhận',home:role==='driver'?'Chuyến của tôi':'Công việc tại kho',stop:'Chi tiết điểm giao',scene:role==='driver'?'Hướng dẫn dỡ hàng':'Hướng dẫn xếp hàng',scan:'Đối chiếu mã kiện',issue:'Ghi nhận sự cố',queue:'Thao tác chờ gửi',profile:'Tài khoản'};
export function shell(view,content,footer='',{dark=false,back='home',backExtra='',nav=false}={}){
 const review=`<header class="m-review"><a href="./mobile-board.html">← Bảng phác thảo</a><span>Mobile 03 · Bản mẫu</span><label>Vai trò<select id="role-review"><option value="driver" ${role==='driver'?'selected':''}>Tài xế</option><option value="warehouse" ${role==='warehouse'?'selected':''}>Kho</option></select></label></header>`;
 const notes=`<aside class="m-notes"><span class="note-kicker">LoadMaster / Mobile</span><h1>${titles[view]}</h1><p>3D ở trung tâm.<br>Thao tác theo từng bước.</p><nav>${Object.entries(titles).filter(([key])=>key!=='done').map(([key,title])=>`<a href="${link(key)}" ${key===view?'aria-current="page"':''}>${title}${icon('right')}</a>`).join('')}</nav><small>Phác thảo web cho app Flutter. Ảnh 3D lấy từ engine hiện tại; chưa xoay hoặc dỡ hàng trong bản mẫu.</small></aside>`;
 const appHeader=`<header class="m-app-header">${['home','login'].includes(view)?'<span class="m-logo">L</span>':`<a class="icon-button" href="${link(back,backExtra)}" aria-label="Quay lại">${icon('back')}</a>`}<div><strong>${['home','login'].includes(view)?'LoadMaster':titles[view]}</strong><small>${view==='home'?(role==='driver'?'Tài xế · Kho Long Bình':'Kho · Long Bình'):['login','settings','access','about','profile'].includes(view)?'LoadMaster · Mobile':'TRIP-2026-0914'}</small></div>${view==='home'?`<a class="icon-button" href="${link('profile')}" aria-label="Tài khoản">${icon('user')}</a>`:tag('Mẫu')}</header>`;
 const bottom=nav?`<nav class="m-bottom-nav" aria-label="Điều hướng ứng dụng">${[['home','truck','Công việc'],['queue','sync','Chờ gửi'],['profile','user','Tài khoản']].map(([key,i,title])=>`<a href="${link(key)}" ${key===view?'aria-current="page"':''}>${icon(i)}<span>${title}</span></a>`).join('')}</nav>`:footer?`<footer class="m-action-footer">${footer}</footer>`:'';
 return `${review}<main class="m-review-stage">${notes}<article class="m-device ${dark?'dark-device':''}">${appHeader}<div class="m-body ${view==='scene'?'m-scene-body':''}">${content}</div>${bottom}</article></main>`;
}
export function sheet(id,title,content){return `<dialog id="${id}" class="m-sheet" aria-labelledby="${id}-title"><header><h2 id="${id}-title">${title}</h2><form method="dialog"><button class="icon-button" aria-label="Đóng">${icon('close')}</button></form></header>${content}</dialog>`;}
export function activate(){
 $('role-review').onchange=e=>{location.href=`./mobile.html?view=home&role=${e.target.value}`;};
 document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const nodes=[...d.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select,textarea')].filter(n=>n.getClientRects().length);if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0]?.focus();}});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientY<r.top||e.clientY>r.bottom||e.clientX<r.left||e.clientX>r.right)d.close();}});});
}
const queueKey='loadmaster-mobile-sketch-queue';
export function readQueue(){try{const q=JSON.parse(sessionStorage.getItem(queueKey)??'[]');return Array.isArray(q)?q:[];}catch{return [];}}
export function writeQueue(q){sessionStorage.setItem(queueKey,JSON.stringify(q));}



