// Prototype-only session state. Never writes the production repository.
import { placements } from './mobile-placements.mock.js';
import { role,readQueue,writeQueue } from './mobile-ui.js';
const key='lm-mobile-flow-02';
export function flow(){try{const v=JSON.parse(sessionStorage.getItem(key));return v&&Array.isArray(v.confirmed)?{...v,accepted:v.acceptedRoles?.[role]===true}:{accepted:false,confirmed:[]};}catch{return {accepted:false,confirmed:[]};}}
export function acceptTrip(){const data=flow();sessionStorage.setItem(key,JSON.stringify({...data,acceptedRoles:{...data.acceptedRoles,[role]:true}}));}
export function confirmed(id){return flow().confirmed.includes(`${role}:${id}`);}
export function confirmPackage(id){
 if(confirmed(id))return false;
 const data=flow();data.confirmed.push(`${role}:${id}`);sessionStorage.setItem(key,JSON.stringify(data));
 writeQueue([...readQueue(),{id:crypto.randomUUID(),kind:role==='driver'?'Xác nhận dỡ kiện':'Xác nhận xếp kiện',note:'Thao tác mẫu, chưa gửi máy chủ.',packageId:id,role,photos:[],status:'pending'}]);return true;
}
export const doneCount=stop=>placements.filter(p=>(!stop||p.stop===stop)&&confirmed(p.id)).length;
export function nextPackage(p){return placements.filter(q=>(role==='warehouse'||q.stop===p.stop)&&!confirmed(q.id)).toSorted((a,b)=>role==='warehouse'?a.step-b.step:a.unloadingOrder-b.unloadingOrder)[0];}
export function resetFlow(){sessionStorage.removeItem(key);writeQueue(readQueue().filter(q=>!q.kind.startsWith('Xác nhận ')));}
