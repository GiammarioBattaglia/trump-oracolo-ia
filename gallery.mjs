import { NEW_VIGNETTES } from './new-vignettes.mjs?v=suprema-5';

const normalize=value=>String(value).toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function filterVignettes(query='',category='all'){
  const needle=normalize(query.trim());
  return NEW_VIGNETTES.filter(item=>(category==='all'||item.category===category)&&normalize(item.wish+' '+item.title+' '+item.category).includes(needle));
}

export function mountGallery({onPlay,isBusy,seen}){
  const grid=document.getElementById('galleryGrid');
  const search=document.getElementById('gallerySearch');
  const category=document.getElementById('galleryCategory');
  const more=document.getElementById('galleryMore');
  const count=document.getElementById('galleryCount');
  let limit=12;
  for(const name of new Set(NEW_VIGNETTES.map(x=>x.category))){
    const option=document.createElement('option');option.value=name;option.textContent=name;category.append(option);
  }
  function render(){
    const list=filterVignettes(search.value,category.value);
    const slice=list.slice(0,limit);
    grid.replaceChildren(...slice.map(item=>{
      const card=document.createElement('button');card.type='button';card.className='vignette-card';card.dataset.wish=item.wish;card.dataset.vignetteId=item.id;card.disabled=isBusy();
      card.setAttribute('aria-label','Gioca: '+item.wish);
      const picture=document.createElement('img');picture.src=item.image;picture.alt='';picture.loading='lazy';picture.decoding='async';picture.width=1120;picture.height=700;
      const body=document.createElement('span');body.className='vignette-card-body';
      const eyebrow=document.createElement('span');eyebrow.className='vignette-category';eyebrow.textContent=item.id.slice(0,2)+' / '+item.category;
      const title=document.createElement('strong');title.textContent=item.wish;
      const action=document.createElement('span');action.className='vignette-action';action.textContent=seen.has(item.id)?'Rigioca la vignetta ↗':'Scopri la risposta ↗';
      body.append(eyebrow,title,action);card.append(picture,body);return card;
    }));
    count.textContent=list.length?`${slice.length} di ${list.length} vignette`:'Nessuna vignetta trovata. Prova un’altra parola.';
    more.hidden=slice.length>=list.length;
  }
  search.addEventListener('input',()=>{limit=12;render()});
  category.addEventListener('change',()=>{limit=12;render()});
  more.addEventListener('click',()=>{limit+=12;render()});
  grid.addEventListener('click',event=>{const card=event.target.closest('[data-vignette-id]');if(card&&!isBusy())onPlay(card.dataset.wish)});
  render();
  return {refreshSeen(){for(const card of grid.querySelectorAll('[data-vignette-id]'))card.querySelector('.vignette-action').textContent=seen.has(card.dataset.vignetteId)?'Rigioca la vignetta ↗':'Scopri la risposta ↗';}};
}
