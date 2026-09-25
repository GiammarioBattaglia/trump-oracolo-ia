import fs from 'node:fs/promises';
import path from 'node:path';
import {generateMonthlyVignette} from './render-monthly-vignette.mjs';
import {NEW_VIGNETTES} from '../new-vignettes.mjs';
import {MONTHLY_VIGNETTES} from '../monthly-vignettes.mjs';

const root=process.cwd();
const incomingDir=path.join(root,'incoming-monthly');
const monthlyFile=path.join(root,'monthly-vignettes.mjs');
const assetsDir=path.join(root,'assets','vignettes');
const REQUIRED=['month','slug','category','wish','chip','actor','label','title','line','text','alt','visual','statement_summary','statement_date'];

function currentMonthRome(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit'}).formatToParts(new Date());
  const year=parts.find(x=>x.type==='year')?.value;
  const month=parts.find(x=>x.type==='month')?.value;
  return year+'-'+month;
}
function host(url){
  const u=new URL(url);
  if(u.protocol!=='https:') throw new Error('Le fonti devono usare HTTPS');
  return u.hostname.toLowerCase().replace(/^www\./,'');
}
function normalize(value){
  return String(value||'').trim().toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function validate(item){
  for(const key of REQUIRED) if(item[key]===undefined||String(item[key]).trim()==='') throw new Error('Campo obbligatorio mancante: '+key);
  if(!/^\d{4}-\d{2}$/.test(item.month)) throw new Error('month non valido');
  if(item.month!==currentMonthRome()) throw new Error('Il JSON deve appartenere al mese corrente in Europe/Rome');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(item.statement_date)) throw new Error('statement_date non valida');
  if(!/^[a-z0-9-]{3,80}$/.test(item.slug)) throw new Error('slug non valido');
  if(!/^Vorrei\s+/i.test(item.wish)) throw new Error('Il desiderio autonomo deve iniziare con “Vorrei”');
  if(item.wish.length>220) throw new Error('Desiderio troppo lungo');
  if(!Number.isInteger(item.actor)||item.actor<1||item.actor>7) throw new Error('actor deve essere un intero da 1 a 7');
  if(!Array.isArray(item.sources)||item.sources.length<2) throw new Error('Servono almeno due fonti indipendenti');
  if(item.sources.some(s=>!s?.name||!s?.url)) throw new Error('Fonte incompleta');
  if(new Set(item.sources.map(s=>host(s.url))).size<2) throw new Error('Servono almeno due domini fonte indipendenti');
  if(item.autonomous!==true) throw new Error('Manca autonomous=true');
  if(item.factual_verification_pass!==true) throw new Error('Manca factual_verification_pass=true');
  if(item.satire_quality_pass!==true) throw new Error('Manca satire_quality_pass=true');
  if(item.political_neutrality_pass!==true) throw new Error('Manca political_neutrality_pass=true');
  if(MONTHLY_VIGNETTES.some(x=>x.month===item.month)) throw new Error('Esiste già una vignetta autonoma per '+item.month);
  if(NEW_VIGNETTES.some(x=>normalize(x.wish)===normalize(item.wish))) throw new Error('Desiderio già presente');
  if(NEW_VIGNETTES.some(x=>normalize(x.title)===normalize(item.title))) throw new Error('Titolo già presente');
}
function nextNumber(){
  return Math.max(0,...NEW_VIGNETTES.map(x=>Number.parseInt(String(x.id||'').match(/^(\d+)-/)?.[1]||'0',10)))+1;
}
async function publish(file){
  const sourcePath=path.join(incomingDir,file);
  const item=JSON.parse(await fs.readFile(sourcePath,'utf8'));
  validate(item);
  const number=nextNumber();
  const id=String(number).padStart(2,'0')+'-'+item.slug;
  if(NEW_VIGNETTES.some(x=>x.id===id)) throw new Error('ID già presente: '+id);
  const image='/assets/vignettes/'+id+'.webp';
  const imagePath=path.join(root,image);
  await fs.mkdir(assetsDir,{recursive:true});
  const generated=await generateMonthlyVignette({...item,id,image});
  try{
    await fs.writeFile(imagePath,generated.buffer,{flag:'wx'});
    const record={
      id,
      category:item.category,
      wish:item.wish,
      chip:item.chip,
      actor:item.actor,
      label:item.label,
      title:item.title,
      line:item.line,
      text:item.text,
      alt:item.alt,
      image,
      month:item.month,
      autonomous:true,
      statement_summary:item.statement_summary,
      statement_date:item.statement_date,
      sources:item.sources,
      factual_verification_pass:true,
      satire_quality_pass:true,
      political_neutrality_pass:true,
      satire_notice:item.satire_notice||'Satira indipendente. Il desiderio e la scena sono invenzioni umoristiche ispirate a una dichiarazione pubblica verificata.',
      image_prompt:generated.prompt,
      image_model:generated.model,
      published_at:new Date().toISOString()
    };
    const next=[...MONTHLY_VIGNETTES,record];
    await fs.writeFile(monthlyFile,'// Vignette mensili create dalla pipeline editoriale verificata.\n// Questo file è aggiornato automaticamente; le 24 vignette base restano in new-vignettes.mjs.\nexport const MONTHLY_VIGNETTES='+JSON.stringify(next,null,2)+';\n');
    await fs.rm(sourcePath);
    if(process.env.GITHUB_OUTPUT){
      await fs.appendFile(process.env.GITHUB_OUTPUT,'id='+id+'\n');
      await fs.appendFile(process.env.GITHUB_OUTPUT,'image='+image+'\n');
    }
    console.log('MONTHLY_VIGNETTE_PUBLISHED='+id);
    return true;
  }catch(error){
    await fs.rm(imagePath,{force:true});
    throw error;
  }
}
async function main(){
  await fs.mkdir(incomingDir,{recursive:true});
  const files=(await fs.readdir(incomingDir)).filter(x=>x.endsWith('.json')).sort();
  if(!files.length){console.log('MONTHLY_VIGNETTE_CHANGED=0');return;}
  if(files.length>1) throw new Error('Più di un JSON mensile in attesa: fail-closed');
  await publish(files[0]);
  console.log('MONTHLY_VIGNETTE_CHANGED=1');
}
main().catch(error=>{console.error(error);process.exit(1);});
