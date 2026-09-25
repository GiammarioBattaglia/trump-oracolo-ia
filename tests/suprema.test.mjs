import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {NEW_VIGNETTES} from '../new-vignettes.mjs';
import {LIBRARY} from '../wish-library.mjs';
import {resolveWish,ALL_EXAMPLES} from '../wish-engine.mjs';
import {filterVignettes} from '../gallery.mjs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const oracle=require('../api/oracle.js');

test('Catalogo estensibile: vignette complete, desideri originali e nessun duplicato',()=>{
 assert(NEW_VIGNETTES.length>=24);assert.equal(ALL_EXAMPLES.length,62+NEW_VIGNETTES.length);
 for(const key of ['id','wish','title','line','image'])assert.equal(new Set(NEW_VIGNETTES.map(x=>x[key])).size,NEW_VIGNETTES.length,key);
 const previous=new Set(LIBRARY.map(x=>x.wish));
 for(const item of NEW_VIGNETTES){
  assert(!previous.has(item.wish));assert(item.wish.length<=220);
  const result=resolveWish(item.wish);assert.equal(result.id,item.id);assert.equal(result.image,item.image);assert.equal(result.curated,true);
  const shared=new URL('https://trump-oracolo-ia.vercel.app/');shared.hash='wish='+encodeURIComponent(item.wish);
  const decoded=new URLSearchParams(shared.hash.slice(1)).get('wish');assert.equal(resolveWish(decoded).id,item.id);
  assert.equal(resolveWish(item.wish.toUpperCase()+'.').id,item.id);
 }
 for(const item of LIBRARY){const result=resolveWish(item.wish);assert.equal(result.prop,item.prop);assert.equal(result.curated,true);}
 assert.equal(resolveWish('Vorrei una bicicletta a forma di nuvola').curated,false);
});

test('Ricerca e temi restituiscono le vignette corrette',()=>{
 assert.equal(filterVignettes().length,NEW_VIGNETTES.length);
 const affari=filterVignettes('','Affari');assert(affari.length>=10);assert(affari.every(x=>x.category==='Affari'));
 assert(filterVignettes('LIQUIDITA').some(x=>x.id==='12-liquidita-infinita'));
 assert.equal(filterVignettes('parola inesistente zzzz').length,0);
});

test('Tutte le immagini sono WebP reali, distinte e non vuote',async()=>{
 const hashes=new Set();
 for(const item of NEW_VIGNETTES){
  const file=new URL('..'+item.image,import.meta.url);const data=await readFile(file);
  assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');assert((await stat(file)).size>20000);
  hashes.add(createHash('sha256').update(data).digest('hex'));
 }
 assert.equal(hashes.size,NEW_VIGNETTES.length);
});

test('Vignette mensili autonome: massimo una per mese e fonti verificabili',()=>{
 const monthly=NEW_VIGNETTES.filter(x=>x.autonomous===true);
 assert.equal(new Set(monthly.map(x=>x.month)).size,monthly.length);
 for(const item of monthly){
  assert.match(item.month,/^\d{4}-\d{2}$/);
  assert.match(item.statement_date,/^\d{4}-\d{2}-\d{2}$/);
  assert(/^Vorrei\s+/i.test(item.wish));
  assert.equal(item.factual_verification_pass,true);
  assert.equal(item.satire_quality_pass,true);
  assert.equal(item.political_neutrality_pass,true);
  assert(Array.isArray(item.sources)&&item.sources.length>=2);
  assert.equal(new Set(item.sources.map(x=>new URL(x.url).hostname.replace(/^www\\./,''))).size>=2,true);
 }
});

test('Il backend conserva provider, validazione e protezione delle risposte',()=>{
 assert.equal(oracle.pickProvider({OPENAI_API_KEY:'test-placeholder'}),'openai');
 assert.equal(oracle.pickProvider({}),null);
 const scene={safe:true,actor:4,label:'Prova',title:'Titolo',line:'Battuta',text:'Conseguenza'};
 assert(oracle.validateScene(scene));assert.equal(oracle.validateScene({...scene,actor:99}),null);
 assert.equal(oracle.validateScene({...scene,safe:false}),null);
 assert.equal(oracle.validateScene({...scene,title:'https://bad.invalid'}),null);
 assert(!Object.hasOwn(oracle.validateScene({...scene,ragionamento:'privato'}),'ragionamento'));
});

test('Endpoint rifiuta metodi e origini non validi senza chiamare il fornitore',async()=>{
 function response(){return {headers:{},setHeader(k,v){this.headers[k]=v},end(value){this.body=JSON.parse(value)}}}
 let res=response();await oracle({method:'GET'},res);assert.equal(res.statusCode,405);
 res=response();await oracle({method:'POST',headers:{origin:'https://unrelated.invalid',host:'trump-oracolo-ia.vercel.app'}},res);assert.equal(res.statusCode,403);
});

test('Cache: nessuna API, immagine visitata disponibile offline, nessuna pagina estranea sulla home',async()=>{
 const handlers={},writes=[],tasks=[];let response=null,online=true;
 const memory=new Map();
 const context={URL,caches:{match:async req=>memory.get(typeof req==='string'?req:req.url),open:async()=>({put:async(req,value)=>{const key=typeof req==='string'?req:req.url;writes.push(key);memory.set(key,value)}})},fetch:async()=>{if(!online)throw Error('offline');return {ok:true,image:true,clone(){return this}}},self:{location:{origin:'https://game.invalid'},addEventListener:(name,fn)=>handlers[name]=fn}};
 vm.runInNewContext(await readFile(new URL('../sw.js',import.meta.url),'utf8'),context);
 const call=(path,method='GET',mode='cors')=>{response=null;handlers.fetch({request:{url:'https://game.invalid'+path,method,mode},respondWith:p=>response=p,waitUntil:p=>tasks.push(p)});return response};
 assert.equal(call('/api/oracle','POST'),null);assert.equal(call('/api/oracle'),null);
 assert.equal(call('/qa-mobile.html','GET','navigate'),null);
 assert(await call('/monthly-vignettes.mjs'));await Promise.all(tasks);
 assert((await call('/assets/vignettes/example.webp')).image);await Promise.all(tasks);
 online=false;assert(await call('/monthly-vignettes.mjs'));assert((await call('/assets/vignettes/example.webp')).image);
 assert.deepEqual(writes,['https://game.invalid/monthly-vignettes.mjs','https://game.invalid/assets/vignettes/example.webp']);
});
