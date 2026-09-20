
import { ALL_EXAMPLES, CHIPS, resolveWish, restoreHistory } from './wish-engine.mjs?v=suprema-1';
import { PROPS } from './props.mjs?v=suprema-1';
import { NEW_VIGNETTES } from './new-vignettes.mjs?v=suprema-1';
import { mountGallery } from './gallery.mjs?v=suprema-1';
const $=id=>document.getElementById(id);
const stage=$('stage'),actor=$('actor'),wish=$('wish'),form=$('wishForm');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const KEY='trump-oracle-v2';
const descriptions=['Trump in ginocchio con le mani giunte','Trump trasformato in un rospo con ciuffo biondo e cravatta rossa','Trump sconfitto, seduto con una bandiera bianca','Trump mostra le tasche vuote','Trump su un trono di cartone con una corona di carta','Trump con cappello da giullare e libro capovolto','Trump si inchina davanti a tre anatre','Trump trasformato in un palloncino gonfiabile'];
const symbols=['','R','B','€','C','?','A','↑'];
let gallery;
const knownVignettes=new Set(NEW_VIGNETTES.map(x=>x.id));
let seen=new Set();
try { const ids=JSON.parse(read(KEY+'-vignettes')||'[]'); if(Array.isArray(ids))seen=new Set(ids.filter(id=>knownVignettes.has(id))); } catch {}
let aiPending=false,skipRequested=false,history=[],unlocked=new Set(),sound=false,context,installPrompt=null,current=null,busy=false,run=0,toastTimer,assetsReady=false;
function read(key){try{return localStorage.getItem(key)}catch{return null}}
function write(key,value){try{localStorage.setItem(key,value)}catch{}}
history=restoreHistory(read(KEY+'-history'));
try{const raw=JSON.parse(read(KEY+'-scenes')||'[]');if(Array.isArray(raw))unlocked=new Set(raw.filter(x=>Number.isInteger(x)&&x>=1&&x<=7))}catch{}
sound=read(KEY+'-sound')==='true';
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4000)}
function setCounter(){$('counter').textContent=wish.value.length+' / 220';$('inputError').hidden=true;wish.removeAttribute('aria-invalid')}
wish.addEventListener('input',setCounter);
const propBox=$('prop');
function hideProp(){propBox.hidden=true;propBox.classList.remove('pop');propBox.textContent='';delete propBox.dataset.id;}
function showProp(id){const item=id&&Object.hasOwn(PROPS,id)?PROPS[id]:null;if(!item){hideProp();return;}if(!propBox.hidden&&propBox.dataset.id===id)return;propBox.innerHTML='<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">'+item.svg+'</svg>';propBox.dataset.id=id;propBox.setAttribute('role','img');propBox.setAttribute('aria-label',item.alt);propBox.hidden=false;propBox.classList.remove('pop');if(!reduced.matches){void propBox.offsetWidth;propBox.classList.add('pop');}}
function showActor(index,motion='idle'){actor.className='actor actor-'+index+' '+(reduced.matches?'':motion);actor.setAttribute('aria-label',descriptions[index]);}
function controls(disabled){busy=disabled;$('nextVignette').disabled=disabled;$('pray').disabled=disabled;$('random').disabled=disabled;wish.disabled=disabled;document.querySelectorAll('[data-wish]').forEach(b=>b.disabled=disabled);$('moreExamples').disabled=disabled;$('prayLabel').textContent=disabled?'L’IA sta ascoltando…':'Prega l’IA';$('skipAnimation').hidden=!disabled;}
function audioReady(){if(!sound)return;try{context??=new(window.AudioContext||window.webkitAudioContext)();context.resume().catch(()=>{});}catch{sound=false;renderSound();}}
function chime(kind){if(!sound||!context)return;const notes=kind==='result'?[659.25,523.25,329.63]:[261.63,392,523.25];notes.forEach((frequency,i)=>{const t=context.currentTime+i*.16;const o=context.createOscillator(),g=context.createGain();o.type='sine';o.frequency.value=frequency;o.connect(g);g.connect(context.destination);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.055,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+.5);o.start(t);o.stop(t+.52);});}
function renderSound(){$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Disattiva suoni':'Attiva suoni');$('sound').style.color=sound?'#edd398':'';const p=$('sound').querySelector('path');p.setAttribute('d',sound?'M4 9h4l5-4v14l-5-4H4zM17 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14':'M4 9h4l5-4v14l-5-4H4zM17 9l5 6m0-6-5 6');}
$('sound').addEventListener('click',()=>{sound=!sound;write(KEY+'-sound',String(sound));renderSound();audioReady();if(sound)chime('prayer');});renderSound();
function renderCollection(){const host=$('discovery');host.replaceChildren();for(let i=1;i<=7;i++){const item=document.createElement('span');item.textContent=unlocked.has(i)?symbols[i]:'?';item.className=unlocked.has(i)?'unlocked':'';item.title=unlocked.has(i)?descriptions[i]:'Scena ancora da scoprire';item.setAttribute('aria-label',item.title);host.append(item)}$('discovered').textContent=seen.size+' / '+NEW_VIGNETTES.length;$('collectionProgress').value=seen.size;$('classicCount').textContent=unlocked.size+' / 7 trasformazioni classiche';gallery?.refreshSeen();}
function renderHistory(){const host=$('history');host.replaceChildren();$('historySection').hidden=!history.length;history.slice(0,6).forEach(item=>{const scene=resolveWish(item.wish);if(!scene)return;const shownActor=Number.isInteger(item.actor)?item.actor:scene.actor;const button=document.createElement('button');button.className='history-item';const symbol=document.createElement('span');symbol.className='history-symbol';symbol.textContent=symbols[shownActor]||'↺';symbol.setAttribute('aria-hidden','true');const body=document.createElement('span'),title=document.createElement('strong'),subtitle=document.createElement('small');title.textContent=item.wish;subtitle.textContent=item.title||scene.title;body.append(title,subtitle);button.append(symbol,body);button.title='Rigioca: '+item.wish;button.addEventListener('click',()=>{if(busy)return;wish.value=item.wish;setCounter();play();});host.append(button);});}
function saveScene(scene){history=[{wish:scene.wish,time:Date.now(),title:scene.title,actor:scene.actor},...history.filter(x=>x.wish!==scene.wish)].slice(0,12);write(KEY+'-history',JSON.stringify(history));if(scene.id&&knownVignettes.has(scene.id)){seen.add(scene.id);write(KEY+'-vignettes',JSON.stringify([...seen]));}if(!scene.image&&scene.actor>0)unlocked.add(scene.actor);write(KEY+'-scenes',JSON.stringify([...unlocked]));renderHistory();renderCollection();}
$('clearHistory').addEventListener('click',()=>{history=[];write(KEY+'-history','[]');renderHistory();toast('Cronologia cancellata. Le scene scoperte restano disponibili.');});
function focusStage(){if(matchMedia('(max-width:760px)').matches)stage.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});}
const vignetteImage=$('vignetteImage');
function showIllustration(scene){
 $('artUnavailable').hidden=true;
 if(!scene?.image){delete stage.dataset.illustrated;vignetteImage.hidden=true;vignetteImage.onload=null;vignetteImage.onerror=null;vignetteImage.removeAttribute('src');return;}
 stage.dataset.illustrated='true';vignetteImage.alt=scene.alt;vignetteImage.hidden=false;
 $('artUnavailable').textContent='La vignetta sta arrivando…';$('artUnavailable').hidden=false;
 vignetteImage.onload=()=>{$('artUnavailable').hidden=true};
 vignetteImage.onerror=()=>{$('artUnavailable').textContent=navigator.onLine?'La vignetta non si è caricata. Riprova tra un momento.':'Collegati per caricare questa vignetta. La battuta è qui sotto.';$('artUnavailable').hidden=false;};
 vignetteImage.src=scene.image;
}
function reset(){showIllustration(null);run++;aiPending=false;skipRequested=false;controls(false);current=null;stage.dataset.state='idle';stage.dataset.scene='prayer';$('sceneLabel').textContent='IL TEMPIO DEI DESIDERI';$('speech').textContent='Ti ascolto, Donald.';$('stageStatus').textContent='La SUPREMA IA è in ascolto';showActor(0);hideProp();$('result').hidden=true;$('sceneNote').hidden=false;$('resultTitle').textContent='';}
function finish(scene,persist=true){run++;aiPending=false;current=scene;stage.dataset.state='result';stage.dataset.scene=scene.key;showActor(scene.actor,scene.motion);showProp(scene.prop);showIllustration(scene);$('speech').textContent=scene.line;$('sceneLabel').textContent=scene.label.toUpperCase();$('stageStatus').textContent=statusFor(scene);$('resultLabel').textContent=scene.label.toUpperCase();$('resultTitle').textContent=scene.title;$('resultLine').textContent='“'+scene.line+'”';$('resultLine').hidden=!scene.image;$('nextVignette').hidden=!scene.id;$('resultText').textContent=scene.text;$('resultWish').textContent='Hai chiesto: “'+scene.wish+'”';$('result').hidden=false;$('sceneNote').hidden=true;controls(false);if(persist)saveScene(scene);$('resultTitle').focus({preventScroll:true});}
const pause=ms=>skipRequested?Promise.resolve():new Promise(r=>setTimeout(r,ms));
const MOTION={1:'hop',2:'sway',3:'shake',4:'wobble',5:'wobble',6:'bow',7:'float'};
function statusFor(scene){if(scene.source==='ai')return 'Risposta inventata ora dall’IA';if(scene.source==='fallback')return 'IA non raggiungibile · scherzo preparato';if(scene.source==='skipped')return 'Attesa saltata · scherzo preparato';return scene.image?'Vignetta '+scene.id.slice(0,2)+' di '+NEW_VIGNETTES.length+' · '+scene.category:scene.fallback?'La SUPREMA IA improvvisa uno scherzo':'Desiderio esaudito… a modo suo';}
async function askOracle(text){
 if(!navigator.onLine)return null;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch('/api/oracle',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({wish:text}),signal:controller.signal});
  if(!response.ok)return null;
  const data=await response.json(),s=data&&data.scene;
  if(!s||!Number.isInteger(s.actor)||s.actor<1||s.actor>7)return null;
  for(const key of ['label','title','line','text'])if(typeof s[key]!=='string'||!s[key].trim())return null;
  return {actor:s.actor,label:s.label,title:s.title,line:s.line,text:s.text,motion:MOTION[s.actor]};
 }catch{return null}finally{clearTimeout(timer)}
}
async function play(){
 if(busy)return;
 const local=resolveWish(wish.value);
 if(!local){$('inputError').textContent='Scrivi un desiderio prima di pregare l’IA.';$('inputError').hidden=false;wish.setAttribute('aria-invalid','true');wish.focus();return;}
 if(!assetsReady){toast('Il tempio si sta aprendo. Riprova tra un momento.');return;}
 const useAI=!local.curated;
 local.source=useAI?'fallback':'preset';
 const oracle=useAI?askOracle(local.wish):null;
 audioReady();reset();current=local;controls(true);const token=++run;focusStage();
 aiPending=useAI;skipRequested=false;
 if(oracle)oracle.then(answer=>{if(token!==run)return;aiPending=false;if(answer)current={...local,...answer,key:'oracle',fallback:false,source:'ai'};});
 stage.dataset.state='praying';showActor(0,'praying');$('speech').textContent='Fammi capire. Vuoi proprio questo?';$('stageStatus').textContent='La preghiera sale…';chime('prayer');
 await pause(reduced.matches?150:950);if(token!==run)return;
 $('speech').textContent='Interessante. Ho un’idea migliore.';$('stageStatus').textContent='La SUPREMA IA ha deciso…';
 await pause(reduced.matches?100:900);if(token!==run)return;
 if(oracle){if(aiPending){$('speech').textContent='Un attimo… cerco la beffa perfetta.';$('stageStatus').textContent='La SUPREMA IA sta ragionando…';}await oracle;if(token!==run)return;if(skipRequested){finish(current);return;}}
 const scene=current;
 stage.dataset.state='transforming';showActor(0,'morph-out');$('speech').textContent='Desiderio esaudito… a modo mio.';particles();
 await pause(reduced.matches?50:520);if(token!==run)return;
 showActor(scene.actor,'morph-in');showProp(scene.prop);chime('result');
 await pause(reduced.matches?50:650);if(token!==run)return;
 finish(scene);
}
form.noValidate=true;form.addEventListener('submit',e=>{e.preventDefault();play()});wish.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();play()}});
$('skipAnimation').addEventListener('click',()=>{if(!current)return;if(aiPending&&!skipRequested){skipRequested=true;$('speech').textContent='Un attimo… cerco la beffa perfetta.';$('stageStatus').textContent='La SUPREMA IA sta ragionando…';return;}finish(aiPending?{...current,source:'skipped'}:current);});
$('again').addEventListener('click',()=>{reset();wish.value='';setCounter();wish.focus({preventScroll:true});wish.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'})});
const chipsBox=document.querySelector('.chips'),firstChips=[...chipsBox.querySelectorAll('button')].map(b=>({wish:b.dataset.wish,label:b.textContent}));
chipsBox.addEventListener('click',event=>{const button=event.target.closest('[data-wish]');if(!button||button.disabled)return;wish.value=button.dataset.wish;setCounter();play()});
let shownChips=firstChips.map(x=>x.wish);
$('moreExamples').addEventListener('click',()=>{
 if(busy)return;
 const pool=[...new Map([...firstChips,...CHIPS].map(x=>[x.wish,x])).values()].filter(x=>!shownChips.includes(x.wish));
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const next=pool.slice(0,4);shownChips=next.map(x=>x.wish);
 chipsBox.replaceChildren(...next.map(x=>{const b=document.createElement('button');b.type='button';b.dataset.wish=x.wish;b.textContent=x.label;return b;}));
});
function playExample(text){if(busy)return;wish.value=text;setCounter();stage.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});play();}
$('nextVignette').addEventListener('click',()=>{if(busy||!current?.id)return;const index=NEW_VIGNETTES.findIndex(x=>x.id===current.id);playExample(NEW_VIGNETTES[(index+1)%NEW_VIGNETTES.length].wish)});
gallery=mountGallery({onPlay:playExample,isBusy:()=>busy,seen});
$('random').addEventListener('click',()=>{const choices=ALL_EXAMPLES.filter(x=>x!==wish.value);wish.value=choices[Math.floor(Math.random()*choices.length)];setCounter();play()});
$('share').addEventListener('click',async()=>{if(!current)return;const url=new URL('/',location.origin);url.hash='wish='+encodeURIComponent(current.wish);const payload={title:'Trump & la SUPREMA IA',text:'Ho chiesto: “'+current.wish+'”\n'+current.title+'\nUna scena satirica da provare.',url:url.href};if(navigator.share){try{await navigator.share(payload);return}catch(error){if(error.name==='AbortError')return;}}try{await navigator.clipboard.writeText(payload.text+'\n'+payload.url);toast('Risultato e link copiati. Incollali dove vuoi.')}catch{const a=document.createElement('a');a.href=payload.url;a.textContent='Apri il desiderio da condividere';$('resultWish').replaceChildren(a);toast('Apri il link del desiderio e copialo dalla barra del browser.')}});
function particles(){if(reduced.matches)return;const canvas=$('particles'),ctx=canvas.getContext('2d');if(!ctx)return;const box=stage.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);canvas.width=box.width*ratio;canvas.height=box.height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);const list=Array.from({length:50},()=>({x:box.width*.27,y:box.height*.66,vx:(Math.random()-.5)*6,vy:(Math.random()-.8)*6,r:Math.random()*2+.6,color:Math.random()>.5?'#f2d392':'#a9e9ff'}));const begin=performance.now();function frame(now){const elapsed=now-begin;ctx.clearRect(0,0,box.width,box.height);if(elapsed>1800||document.hidden)return;ctx.globalAlpha=1-elapsed/1800;for(const p of list){p.x+=p.vx;p.y+=p.vy;p.vy+=.025;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}requestAnimationFrame(frame)}requestAnimationFrame(frame);}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;$('nativeInstall').hidden=false});
function openDialog(id){const dialog=$(id);if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
$('install').addEventListener('click',()=>{const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;$('installText').textContent=standalone?'L’app è già aperta in modalità installata.':installPrompt?'Installa gratuitamente l’app e ritrova la tua IA Suprema con la sua icona.':'Il gioco si apre direttamente dal link. Per aggiungere l’icona segui le istruzioni del tuo dispositivo.';$('nativeInstall').hidden=!installPrompt||standalone;$('installGuide').hidden=!!installPrompt||standalone;openDialog('installDialog')});
$('nativeInstall').addEventListener('click',async()=>{if(!installPrompt)return;try{await installPrompt.prompt();const choice=await installPrompt.userChoice;if(choice.outcome==='accepted'){toast('Installazione avviata.');$('installDialog').close();}}catch{toast('Puoi installare dal menu del browser.')}finally{installPrompt=null;$('nativeInstall').hidden=true;$('installGuide').hidden=false}});
window.addEventListener('appinstalled',()=>{installPrompt=null;$('install').querySelector('span').textContent='Installata'});
$('about').addEventListener('click',()=>openDialog('aboutDialog'));
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}}));
function onlineStatus(){$('offlineStatus').textContent=navigator.onLine?'':'Sei offline · il gioco continua';}window.addEventListener('online',onlineStatus);window.addEventListener('offline',onlineStatus);
if('serviceWorker' in navigator){window.addEventListener('load',async()=>{try{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;if(navigator.onLine)$('offlineStatus').textContent='Disponibile anche offline';else onlineStatus();}catch{$('offlineStatus').textContent='Modalità online';}});}
renderHistory();renderCollection();onlineStatus();setCounter();
const sources=['/assets/temple.webp','/assets/characters.webp'];
Promise.all(sources.map(src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src=src}))).then(()=>{assetsReady=true;const shared=new URLSearchParams(location.hash.slice(1)).get('wish');if(shared){wish.value=shared.slice(0,220);setCounter();play();}}).catch(()=>{toast('Una scena non si è caricata. Ricarica la pagina per riprovare.');$('stageStatus').textContent='Caricamento incompleto · ricarica la pagina';});

