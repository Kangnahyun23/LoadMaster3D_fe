import { placements } from './mobile-placements.mock.js';
import { $,sheet,icon,fmt } from './mobile-ui.js';
// A 2D measurement diagram using the existing cm snapshot, not a new 3D engine.
export function positionSheet(){return sheet('position-sheet','Vị trí từ trên xuống','<div id="position-diagram"></div>');}
export function showPosition(p){
 const xScale=300/720,yScale=100/235;
 $('position-diagram').innerHTML=`<p class="m-source">Sơ đồ vị trí · ${p.id}. Nhiều lớp có thể chồng nhau khi nhìn từ trên.</p><svg class="m-position-diagram" viewBox="0 0 340 160" role="img" aria-label="Sơ đồ từ trên xuống, kiện ${p.id} có viền xanh"><rect x="15" y="30" width="300" height="100" rx="3" fill="#eef3f9" stroke="#a5b7ca"/>${placements.filter(q=>q.id!==p.id).map(q=>`<rect x="${15+q.position.x*xScale}" y="${30+q.position.y*yScale}" width="${q.size[0]*xScale}" height="${q.size[1]*yScale}" fill="#d6e0ec" stroke="#a5b7ca" stroke-width=".4"/>`).join('')}<rect x="${15+p.position.x*xScale}" y="${30+p.position.y*yScale}" width="${p.size[0]*xScale}" height="${p.size[1]*yScale}" fill="#b4d2ff" stroke="#1d4ed8" stroke-width="2.5"/><text x="15" y="18">Vách trước</text><text x="250" y="150">Cửa sau →</text></svg><div class="m-position-key">${icon('box')}<strong class="mono">${p.id}</strong><span>Viền xanh</span></div><dl class="m-measurements">${[['Từ vách trước',p.position.x],['Từ vách trái',p.position.y],['Cao từ sàn',p.position.z]].map(([label,value])=>`<div><dt>${label}</dt><dd>${fmt.format(value)} cm</dd></div>`).join('')}</dl><p class="m-source">Hình chiếu có kích thước thùng 720 × 235 cm theo snapshot. Vị trí cao được ghi riêng, không suy ra kiện có thể dỡ chỉ từ sơ đồ này.</p>`;
 $('position-sheet').showModal();
}
