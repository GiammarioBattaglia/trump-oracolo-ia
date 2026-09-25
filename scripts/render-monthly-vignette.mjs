import sharp from 'sharp';

const IMAGE_API='https://api.openai.com/v1/images/generations';
const MODEL=process.env.OPENAI_IMAGE_MODEL||'gpt-image-2.5-sunburst';

function imagePrompt(item){
  const context=String(item.statement_summary||'').slice(0,700);
  const visual=String(item.visual||'').slice(0,900);
  return [
    'Caricatura editoriale satirica di alta qualità, disegnata a mano con inchiostro e colore, formato orizzontale 8:5. Non è una fotografia autentica.',
    'Personaggio principale: caricatura riconoscibile di Donald Trump. Presenza della SUPREMA IA come entità artificiale immaginaria, luminosa e chiaramente non umana.',
    'Premessa narrativa: Trump formula questo desiderio satirico: '+item.wish,
    'La SUPREMA IA lo esaudisce in modo letterale, paradossale e visivamente immediato. Scena richiesta: '+visual,
    'Contesto fattuale usato solo per ancorare la parodia a una dichiarazione pubblica verificata: '+context,
    'La scena deve essere umoristica e non elettorale: nessun invito a votare, nessun endorsement, nessuna previsione elettorale, nessuna accusa di reato o condotta non documentata, nessuna insinuazione su salute, capacità mentale o idoneità.',
    'Non inserire parole, lettere, loghi, citazioni, didascalie o fumetti nell’immagine. I testi restano nell’interfaccia dell’app.',
    'Composizione pulita, leggibile su smartphone, un solo gag visivo forte, volti ed elementi principali nitidi, niente collage e niente pannelli multipli.'
  ].join('\n');
}

async function requestImage(prompt,key){
  if(!key) throw new Error('OPENAI_API_KEY non configurata: pubblicazione bloccata');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),155000);
  try{
    const response=await fetch(IMAGE_API,{
      method:'POST',
      signal:controller.signal,
      headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
      body:JSON.stringify({model:MODEL,prompt,size:'1536x1024',quality:'high',output_format:'jpeg',n:1})
    });
    if(!response.ok){
      const body=await response.text();
      throw new Error('Image API HTTP '+response.status+': '+body.slice(0,380));
    }
    const json=await response.json();
    const encoded=json.data?.[0]?.b64_json;
    if(!encoded||typeof encoded!=='string') throw new Error('Image API non ha restituito un’immagine');
    const buffer=Buffer.from(encoded,'base64');
    if(buffer.length<65000) throw new Error('Immagine generata sospettosamente piccola');
    return buffer;
  }finally{clearTimeout(timeout);}
}

export async function generateMonthlyVignette(item){
  const prompt=imagePrompt(item);
  const source=await requestImage(prompt,process.env.OPENAI_API_KEY);
  const metadata=await sharp(source,{failOn:'error'}).metadata();
  if((metadata.width||0)<1000||(metadata.height||0)<650) throw new Error('Immagine sotto la risoluzione minima');
  if(!['jpeg','png','webp'].includes(metadata.format)) throw new Error('Formato immagine non ammesso');
  const stats=await sharp(source).stats();
  if(!Number.isFinite(stats.entropy)||stats.entropy<2) throw new Error('Immagine visivamente troppo uniforme');
  const result=await sharp(source)
    .resize(1120,700,{fit:'cover',position:'attention'})
    .webp({quality:90,effort:5})
    .toBuffer();
  const validated=await sharp(result,{failOn:'error'}).metadata();
  if(validated.width!==1120||validated.height!==700||validated.format!=='webp'||result.length<50000){
    throw new Error('WebP finale non valido');
  }
  return {buffer:result,prompt,model:MODEL};
}
