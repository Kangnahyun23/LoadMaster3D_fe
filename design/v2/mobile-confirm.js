import { placements } from './mobile-placements.mock.js';
import { stops } from './trip-detail.mock.js';
import { $,role,link,icon,button,tag,shell,sheet,fmt } from './mobile-ui.js';
import { confirmed,confirmPackage,nextPackage,doneCount,flow } from './mobile-flow.js';
export function scan(){
 const params=new URL(location.href).searchParams;
 const p=placements.find(p=>p.id===params.get('package'))??placements.toSorted((a,b)=>role==='warehouse'?a.step-b.step:a.unloadingOrder-b.unloadingOrder)[0];
 const context=`&package=${p.id}&stop=${p.stop}`;
 $('mobile-root').innerHTML=shell('scan',`<div class="m-content"><div class="m-task-path"><span>1 · Vị trí</span><strong>2 · Đối chiếu</strong><span>3 · Xác nhận</span></div><section class="m-check-target"><span class="stop-dot stop-${p.stop}">${p.stop}</span><div><small>Kiện cần ${role==='driver'?'dỡ':'xếp'}</small><h2 class="mono">${p.id}</h2><p>${p.name}</p></div></section><div class="m-scan-art" aria-hidden="true">${icon('scan')}<span>Camera sẽ tích hợp trong app</span></div><form id="m-scan-form"><label class="m-field">Mã trên kiện<input id="m-scan-code" autocomplete="off" autocapitalize="characters" aria-describedby="m-scan-result" placeholder="Nhập mã hoặc dùng máy quét" required></label><button type="button" id="m-fill-code" class="m-button secondary">Điền mã mẫu</button><p id="m-scan-result" role="status" class="m-feedback"></p><button id="check-code" class="m-button primary">Kiểm tra mã kiện</button></form><div id="m-confirm-ready" hidden><button id="confirm-open" class="m-button primary">Xác nhận đã ${role==='driver'?'dỡ':'xếp'} kiện</button><p class="m-source">Chỉ xác nhận sau khi đã thao tác với kiện thực tế. Bản duyệt chỉ lưu trong phiên.</p></div>${button('Có vấn đề với kiện này','issue',false,context)}<p class="m-source">Nhập mã hoặc máy quét dạng bàn phím đang hoạt động. Camera chưa được tích hợp.</p></div>`,button('Quay lại hướng dẫn','scene',false,context),{back:'scene',backExtra:context})+sheet('confirm-sheet','Xác nhận thao tác mẫu',`<div class="m-confirm-summary">${icon('box')}<h3 class="mono">${p.id}</h3><p>Điểm ${p.stop} · ${stops[p.stop-1]}</p><p>${p.size.join(' × ')} cm · ${fmt.format(p.kg)} kg</p></div><label class="m-toggle"><input id="physical-check" type="checkbox"><span>Tôi đã ${role==='driver'?'dỡ đúng kiện tại điểm này':'xếp đúng vị trí và hướng đặt'}</span></label><p class="m-source">Lưu xác nhận vào hàng đợi mẫu. Chưa gửi máy chủ, chưa cập nhật chuyến thật.</p><button id="confirm-save" class="m-button primary" disabled>Lưu xác nhận mẫu</button>`);
 function invalidate(){ $('m-confirm-ready').hidden=true;$('check-code').hidden=false;$('m-scan-result').textContent='';$('m-scan-code').removeAttribute('aria-invalid'); }
 $('m-scan-code').oninput=invalidate;
 $('m-fill-code').onclick=()=>{invalidate();$('m-scan-code').value=p.id;$('m-scan-code').focus();};
 $('m-scan-form').onsubmit=e=>{e.preventDefault();const ok=$('m-scan-code').value.trim().toUpperCase()===p.id;const duplicate=confirmed(p.id);const blocked=role==='driver'&&!flow().accepted;
  $('m-scan-code').setAttribute('aria-invalid',String(!ok));$('m-scan-result').className=`m-feedback ${ok?'valid':'invalid'}`;
  $('m-scan-result').textContent=!ok?`Mã chưa khớp. Cần ${p.id}, hãy kiểm tra lại nhãn.`:duplicate?'Kiện này đã được xác nhận trong phiên. Không ghi thêm lần nữa.':blocked?'Mã khớp. Hãy về Công việc nhận chuyến mẫu trước khi xác nhận.':'Mã kiện khớp. Kiểm tra thao tác thực tế trước khi xác nhận.';
  $('m-confirm-ready').hidden=!ok||duplicate||blocked;$('check-code').hidden=ok&&!duplicate&&!blocked;
 };
 $('confirm-open').onclick=()=>{$('physical-check').checked=false;$('confirm-save').disabled=true;$('confirm-sheet').showModal();};
 $('physical-check').onchange=e=>{$('confirm-save').disabled=!e.target.checked;};
 $('confirm-save').onclick=()=>{if(!$('physical-check').checked)return;confirmPackage(p.id);location.href=link('done',context);};
}
export function done(){
 const p=placements.find(p=>p.id===new URL(location.href).searchParams.get('package'));
 if(!p||!confirmed(p.id)){location.replace(link('home'));return;}
 const next=nextPackage(p),total=placements.filter(q=>role==='warehouse'||q.stop===p.stop).length,count=doneCount(role==='driver'?p.stop:undefined);
 $('mobile-root').innerHTML=shell('done',`<div class="m-content"><div class="m-receipt"><span class="m-receipt-check">${icon('check')}</span>${tag('Chờ gửi · mô phỏng','warning')}<h2>Đã lưu xác nhận</h2><p class="mono">${p.id}</p><p>Đã ${role==='driver'?'dỡ':'xếp'} · Điểm ${p.stop}</p></div><section class="m-progress-block"><div><strong>${count} / ${total} kiện</strong><span>Đã xác nhận trong phiên</span></div><progress max="${total}" value="${count}" aria-label="Số kiện đã xác nhận"></progress><p>${next?'Tiếp tục với kiện kế tiếp.':'Đã đối chiếu hết kiện trong nhóm này. Chưa xác nhận hoàn tất điểm giao với máy chủ.'}</p></section>${button('Xem thao tác chờ gửi','queue')}<p class="m-source">Thao tác chỉ nằm trong bản mẫu ở tab này. Trạng thái này không đồng nghĩa đã đồng bộ.</p></div>`,next?button('Tiếp tục kiện kế tiếp','scene',true,`&package=${next.id}&stop=${next.stop}`):button('Về lịch trình','stop',true,`&stop=${p.stop}`),{back:'stop',backExtra:`&stop=${p.stop}`});
}
