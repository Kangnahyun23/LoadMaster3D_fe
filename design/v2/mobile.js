import { $,titles,activate } from './mobile-ui.js';
import { stop } from './mobile-work.js';
import { login,settings,access,about,profile,applyPreferences } from './mobile-account.js';
import { home } from './mobile-home.js';
import { scan,done } from './mobile-confirm.js';
import { scene } from './mobile-scene.js';
import { issue,queue } from './mobile-feedback.js';
const requested=new URL(location.href).searchParams.get('view');
const view=Object.hasOwn(titles,requested)?requested:'home';
document.title=`LoadMaster Mobile · ${titles[view]}`;
applyPreferences();
$('mobile-root').innerHTML='';
({home,stop,profile,scan,done,scene,issue,queue,login,settings,access,about})[view]();activate();



