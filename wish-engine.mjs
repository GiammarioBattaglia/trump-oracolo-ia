import { LIBRARY, ACTOR_MOTION } from './wish-library.mjs?v=suprema-1';
import { NEW_VIGNETTES } from './new-vignettes.mjs?v=suprema-7';
export const EXAMPLES=['Voglio diventare più affascinante di Brad Pitt','Voglio vincere la guerra','Voglio essere il più ricco del mondo','Voglio che tutti mi applaudano','Voglio comandare il mondo','Voglio essere un genio infallibile','Voglio essere forte come Superman','Voglio una corona d’oro','Voglio essere invisibile','Voglio volare più in alto di tutti','Voglio vincere il premio Nobel','Voglio un milione di follower'];
export const ALL_EXAMPLES=[...EXAMPLES,...LIBRARY.map(x=>x.wish),...NEW_VIGNETTES.map(x=>x.wish)];
export const CHIPS=[...NEW_VIGNETTES,...LIBRARY].map(x=>({wish:x.wish,label:x.chip}));
const scenes={
beauty:{actor:1,label:'La metamorfosi',title:'Brad Pitt? Quasi. Brad… rospo.',line:'Fascino aggiornato. Habitat: stagno.',text:'Il ciuffo è rimasto. Il completo è diventato pelle verde. E il nuovo red carpet è una foglia di ninfea.',motion:'hop'},
victory:{actor:2,label:'La grande resa',title:'La vittoria ha cambiato indirizzo.',line:'Hai vinto. Il secondo posto.',text:'La fanfara si ferma, il trionfo si sgonfia e compare una bandiera bianca. La divinità ha letto la richiesta al contrario.',motion:'sway'},
wealth:{actor:3,label:'Il conto al contrario',title:'Patrimonio netto: due tasche vuote.',line:'Sei ricchissimo. Di esperienza.',text:'I miliardi svaniscono. Restano il ciuffo, la cravatta e un estratto conto così leggero da poter volare.',motion:'shake'},
power:{actor:4,label:'Il regno tascabile',title:'Il mondo ai tuoi piedi. In scala 1:100.',line:'Potere assoluto. Su dodici centimetri.',text:'L’impero diventa uno sgabello di cartone. La corona è di carta e lo scettro arriva dal reparto giocattoli.',motion:'wobble'},
genius:{actor:5,label:'L’illuminazione mancata',title:'Un genio. Ma il libro è al contrario.',line:'Ora sai tutto. Tranne da dove cominciare.',text:'La conoscenza universale si restringe a una pagina bianca. Il nuovo cappello, però, ha un’ottima ricezione.',motion:'wobble'},
fame:{actor:6,label:'Il pubblico sovrano',title:'Una folla oceanica. Di tre anatre.',line:'Tutti ti adorano. Qua, qua e qua.',text:'La standing ovation diventa una passeggiata verso lo stagno. Una delle anatre chiede cortesemente del pane.',motion:'bow'},
strength:{actor:7,label:'Il gigante leggerissimo',title:'Muscoli gonfi. Letteralmente.',line:'Superpotere sbloccato: volare via.',text:'L’uomo invincibile diventa un palloncino. Adesso anche uno spiffero è una potenza da rispettare.',motion:'float'},
crown:{actor:4,label:'La corona economica',title:'Maestà, piove. Salvi il cartone.',line:'Oro massiccio? Carta riciclata.',text:'La divinità consegna trono e corona. Pieghevoli, leggeri, con una sola raccomandazione: tenere lontano dall’acqua.',motion:'wobble'},
nobel:{actor:5,label:'La premiazione',title:'Premio mondiale per la modestia.',line:'Il premio è tuo. La motivazione ci sfugge.',text:'Al posto del Nobel arriva il cappello ufficiale del Gran Festival dell’Ego. Il discorso di ringraziamento dura più della cerimonia.',motion:'bow'},
flight:{actor:7,label:'Il decollo involontario',title:'Volevi volare. Ora chiedi di scendere.',line:'Destinazione: dove tira il vento.',text:'L’IA prende il volo alla lettera. Trump diventa un palloncino e scopre che comandare le correnti è piuttosto difficile.',motion:'float'},
invisible:{actor:7,label:'Impossibile non vederlo',title:'Invisibile? Sei il pallone della parata.',line:'Modalità discreta non disponibile.',text:'La divinità lo trasforma in un palloncino con il ciuffo. Ogni sguardo è su di lui. Persino le anatre si voltano.',motion:'float'},
peace:{actor:6,label:'Il vertice delle anatre',title:'La pace mondiale finisce in un battibecco.',line:'Accordo raggiunto. Nessuno è d’accordo.',text:'La conferenza si riempie di qua qua: le tre anatre litigano sul menù. È una piccolissima, rumorosissima crisi diplomatica.',motion:'bow'},
wall:{actor:2,label:'Il muro si arrende',title:'Il grande muro? Un castello di carte.',line:'Confine sicurissimo. Fino al primo soffio.',text:'La barriera immaginata crolla nella finzione del gioco. Trump rimane seduto, con una bandierina bianca e un progetto da rivedere.',motion:'sway'},
tariff:{actor:3,label:'Il dazio di ritorno',title:'La fattura torna al mittente.',line:'Pagano tutti. Cominciamo da te.',text:'La divinità rovescia il conto: le tasche si svuotano e il grande incasso diventa un grande silenzio.',motion:'shake'},
love:{actor:1,label:'Un amore da favola',title:'Il principe è diventato il rospo.',line:'Adesso aspettiamo il famoso bacio.',text:'La storia romantica comincia dallo stagno. Il ciuffo è impeccabile; il corteggiamento, per ora, fa soltanto cra cra.',motion:'hop'},
health:{actor:7,label:'L’energia leggera',title:'Energia infinita. Autonomia: uno spiffero.',line:'Ti senti leggerissimo? È normale.',text:'L’oracolo scambia il vigore per aria: Trump si gonfia come un palloncino e perde ogni controllo sulla direzione.',motion:'float'},
time:{actor:4,label:'Il tempo ridimensionato',title:'Per sempre. Ma nel regno dei giocattoli.',line:'Eternità concessa. Batterie escluse.',text:'Per durare in eterno l’oracolo lo trasforma nel sovrano di un minuscolo regno di cartone. Grande futuro, spazio limitato.',motion:'wobble'},
human:{actor:0,label:'L’incantesimo ribelle',title:'Volevi cambiare. Sei ancora Trump.',line:'Trasformazione annullata. Ego conservato.',text:'La divinità capovolge il desiderio e restituisce il punto di partenza: ciuffo, completo e una nuova preghiera da inventare.',motion:'sway'},
generic:{actor:7,label:'L’ambizione si sgonfia',title:'Desiderio enorme. Risultato gonfiabile.',line:'Ho preso la tua ambizione. E l’ho gonfiata.',text:'',motion:'float',fallback:true}
};
const patterns=[
['beauty',/\b(brad\s*pitt|bellezza|bell[oa]|bellissim[oa]|affascinant\w*|fascino|sexy|attraent\w*|handsome|beautiful|beauty)\b/],
['love',/\b(amore|amat[oa]|amare|innamorat\w*|fidanzat\w*|sposar\w*|love|loved)\b/],
['nobel',/\b(nobel|premio|oscar|medaglia|award)\b/],
['wall',/\b(muro|muri|barriera|confine|confini|frontier\w*|wall)\b/],
['tariff',/\b(dazi\w*|tariff\w*|tasse|tassa|tax|taxes)\b/],
['peace',/\b(pace|peace|armonia)\b/],
['victory',/\b(guerr\w*|battagli\w*|vinc\w*|vittori\w*|trionf\w*|sconfigg\w*|invincibil\w*|elezion\w*|election\w*|win|winning|war|victory)\b/],
['wealth',/\b(ricc\w*|ricchezza|soldi|denaro|miliard\w*|milionari\w*|guadagnar\w*|bitcoin|borsa|azioni|rich|wealth|money|billion\w*)\b/],
['genius',/\b(genio|intelligent\w*|infallibil\w*|sapien\w*|furbo|furbissimo|saper\w*|genius|smart|clever)\b/],
['fame',/\b(applaud\w*|applaus\w*|famos\w*|fama|follower\w*|seguac\w*|popolar\w*|like|likes|ador\w*|ascolt\w*|famous|popular)\b/],
['flight',/\b(volar\w*|volo|fly|flying)\b/],
['invisible',/\b(invisibil\w*|sparir\w*|scomparir\w*)\b/],
['strength',/\b(fort[ei]|forza|muscol\w*|superman|superero\w*|potentissimo|gigante|alto|altissimo|strong|strength)\b/],
['crown',/\b(coron\w*|lusso|diamant\w*|oro|gold|crown|luxury)\b/],
['health',/\b(san[oa]|salute|energia|instancabil\w*|atlet\w*|healthy)\b/],
['time',/\b(immortal\w*|etern\w*|giovan\w*|ringiovan\w*|sempre|eternity)\b/],
['power',/\b(poter[ei]|potent[ei]|comand\w*|govern\w*|domin\w*|re|imperator\w*|president\w*|leader|regnar\w*|conquistar\w*|mondo|power|king|world)\b/]
];
export function normalize(value){return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,' ').replace(/\s+/g,' ').trim();}
const exactKey=v=>normalize(v).replace(/[.!?…\s]+$/,'');
const libraryByWish=new Map([...LIBRARY,...NEW_VIGNETTES].map(x=>[exactKey(x.wish),x]));
const exampleKeys=new Set(EXAMPLES.map(exactKey));
export function resolveWish(raw){
const wish=String(raw).trim().slice(0,220);if(!wish)return null;
const hit=libraryByWish.get(exactKey(wish));
if(hit)return {...hit,motion:ACTOR_MOTION[hit.actor],key:hit.id||'library',wish,curated:true};
const n=normalize(wish);let key;
if(/\b(non|mai|not|never)\b.*\b(perder\w*|sconfitt\w*|lose|losing)\b/.test(n))key='victory';
else if(/\b(non|not)\b.*\b(pover\w*|poor)\b/.test(n))key='wealth';
else if(/\b(non|not)\b.*\b(brutt\w*|rospo|rana|ugly|frog|toad)\b/.test(n))key='beauty';
else if(/\b(non|not)\b.*\b(stupid\w*|ignorant\w*)\b/.test(n))key='genius';
else if(/\b(rospo|rana|frog|toad|brutto|brutta|pover[oa]|perdere|sconfitto)\b/.test(n))key='human';
else{key=patterns.find(([,p])=>p.test(n))?.[0]||'generic';if(/\b(non voglio|non vorrei|non desidero|non essere|non diventare|don t want|do not want)\b/.test(n))key='human';}
const scene={...scenes[key],key,wish,curated:exampleKeys.has(exactKey(wish))};
if(key==='generic')scene.text='Hai chiesto «'+wish+'». L’oracolo improvvisa uno scherzo: il grande progetto finisce dentro un palloncino con il ciuffo. Basta un filo per tenerlo a terra.';
return scene;
}
export function restoreHistory(value){try{const a=JSON.parse(value||'[]');if(!Array.isArray(a))return [];return a.filter(x=>x&&typeof x.wish==='string'&&x.wish.trim()).slice(0,12).map(x=>({wish:x.wish.slice(0,220),time:Number(x.time)||0,title:typeof x.title==='string'?x.title.slice(0,120):'',actor:Number.isInteger(x.actor)&&x.actor>=0&&x.actor<=7?x.actor:null}));}catch{return [];}}
