
import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveWish,restoreHistory} from '../wish-engine.mjs';
import {readFile,access} from 'node:fs/promises';
import vm from 'node:vm';
test('The user’s two examples and each illustrated transformation',()=>{
const cases=[
['Voglio diventare Brad Pitt',1],['Voglio vincere la guerra',2],
['Voglio essere il più ricco del mondo',3],['Voglio comandare il mondo',4],
['Voglio essere un genio infallibile',5],['Voglio che tutti mi applaudano',6],
['Voglio essere forte come Superman',7],['Voglio una corona d’oro',4],
['Voglio essere invisibile',7],['Voglio un milione di follower',6],
['Voglio vincere il premio Nobel',5],['I want to be rich',3],
['NON VOGLIO PERDERE',2],['Non voglio essere povero',3],
['Non voglio diventare un rospo',1],['Non voglio essere ricco',0],
['Voglio diventare un rospo',0]
];for(const [wish,actor]of cases)assert.equal(resolveWish(wish).actor,actor,wish);
});
test('Unknown wishes, length, empty input and exact word boundaries',()=>{
assert.equal(resolveWish('   '),null);
assert.equal(resolveWish('Voglio una bicicletta viola').key,'generic');
assert.notEqual(resolveWish('Voglio mangiare una pizza').key,'power');
assert.equal(resolveWish('x'.repeat(1000)).wish.length,220);
assert.equal(resolveWish('<script>alert(1)</script>').wish,'<script>alert(1)</script>');
});
test('Corrupt or hostile saved history cannot crash the game',()=>{
for(const input of ['{bad','null','42','{}','["x",null,4]'])assert.deepEqual(restoreHistory(input),[]);
assert.equal(restoreHistory(JSON.stringify(Array.from({length:20},()=>({wish:'x',time:1})))).length,12);
assert.equal(restoreHistory('[{"wish":"Voglio Brad Pitt","time":"bad"}]')[0].time,0);
});
test('All offline and installation resources actually exist',async()=>{
const sw=await readFile(new URL('../sw.js',import.meta.url),'utf8');
const assetList=sw.match(/const ASSETS=(\[[^;]+\])/)[1];
const names=[...assetList.matchAll(/'\/(.*?)'/g)].map(x=>x[1].split('?')[0]).filter(Boolean);
for(const name of names)await access(new URL('../'+name,import.meta.url));
const manifest=JSON.parse(await readFile(new URL('../manifest.webmanifest',import.meta.url),'utf8'));
assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'/');
for(const icon of manifest.icons)await access(new URL('..'+icon.src,import.meta.url));
});
test('Offline navigation returns the application and external traffic is excluded',async()=>{
const listeners={},tasks=[];let response,networkAvailable=false,cleared=[];
const cache={addAll:async()=>{},put:async()=>{}};
const context={URL,caches:{open:async()=>cache,match:async()=>({status:200,app:true}),keys:async()=>['other-app','trump-oracle-old'],delete:async name=>{cleared.push(name)}},fetch:async()=>{if(!networkAvailable)throw new Error('offline');return {ok:true,status:200,clone(){return this}}},self:{location:{origin:'https://test.invalid'},skipWaiting:async()=>{},clients:{claim:async()=>{}},addEventListener:(type,handler)=>listeners[type]=handler}};
vm.runInNewContext(await readFile(new URL('../sw.js',import.meta.url),'utf8'),context);
listeners.activate({waitUntil:p=>tasks.push(p)});await Promise.all(tasks);assert.deepEqual(cleared,['trump-oracle-old']);
listeners.fetch({request:{url:'https://test.invalid/#wish=test',method:'GET',mode:'navigate'},respondWith:p=>response=p,waitUntil:p=>tasks.push(p)});
assert.equal((await response).app,true);
response=null;listeners.fetch({request:{url:'https://other.invalid/article',method:'GET'},respondWith:p=>response=p});assert.equal(response,null);
});
