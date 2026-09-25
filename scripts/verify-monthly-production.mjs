const base='https://trump-oracolo-ia.vercel.app';
const id=process.env.PUBLISHED_ID;
const image=process.env.PUBLISHED_IMAGE;
if(!id||!image) process.exit(0);

async function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function verify(){
  const home=await fetch(base+'/',{cache:'no-store'});
  if(!home.ok) throw new Error('Home HTTP '+home.status);
  const catalog=await fetch(base+'/monthly-vignettes.mjs?verify='+Date.now(),{cache:'no-store'});
  if(!catalog.ok) throw new Error('Catalogo mensile HTTP '+catalog.status);
  const text=await catalog.text();
  if(!text.includes(id)) throw new Error('Nuova vignetta non ancora presente nel catalogo pubblico');
  const art=await fetch(base+image+'?verify='+Date.now(),{cache:'no-store'});
  if(!art.ok) throw new Error('Immagine HTTP '+art.status);
  const type=art.headers.get('content-type')||'';
  if(!type.includes('image/')) throw new Error('Content-Type immagine non valido: '+type);
}
let last;
for(let attempt=1;attempt<=18;attempt++){
  try{await verify();console.log('PRODUCTION_VERIFIED='+id);process.exit(0);}
  catch(error){last=error;console.log('Tentativo '+attempt+': '+error.message);if(attempt<18) await sleep(10000);}
}
throw last;
