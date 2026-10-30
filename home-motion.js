import {embeddedOrFetch} from './core.js?v=6c47ece14ac5';
import {sitePath} from './site-config.js?v=6c47ece14ac5';
import {writingCard} from './publication-view.js?v=6c47ece14ac5';
import {ui,locale} from './i18n.js?v=6c47ece14ac5';

function motionClock(element,advance,interval){
  let timer,paused=false,hovered=false,focused=false,visible=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const stop=()=>{clearTimeout(timer);timer=undefined;};
  const schedule=()=>{stop();if(paused||hovered||focused||!visible||document.hidden||reduced.matches)return;timer=setTimeout(async()=>{await advance();schedule();},interval);};
  const pause=element.querySelector('[data-motion-pause]');
  pause?.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'继续自动轮播':'暂停自动轮播');pause.textContent=paused?'▷':'Ⅱ';schedule();});
  element.addEventListener('pointerenter',()=>{hovered=true;stop();});
  element.addEventListener('pointerleave',()=>{hovered=false;schedule();});
  element.addEventListener('focusin',()=>{focused=true;stop();});
  element.addEventListener('focusout',event=>{if(!element.contains(event.relatedTarget)){focused=false;schedule();}});
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',schedule);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.05}).observe(element);
  return {reset:schedule};
}

const bulletin=document.querySelector('.news-bulletin');
if(bulletin){
  const track=bulletin.querySelector('.bulletin-track');const rows=[...track.children];
  let current=0;const realCount=rows.length;
  if(realCount>1){
    const clone=rows[0].cloneNode(true);clone.setAttribute('aria-hidden','true');clone.inert=true;track.append(clone);
    function accessible(){rows.forEach((row,index)=>{row.inert=index!==current;row.setAttribute('aria-hidden',String(index!==current));});}
    accessible();
    motionClock(bulletin,()=>new Promise(resolve=>{
      current++;track.style.transition='transform 650ms cubic-bezier(.22,.75,.25,1)';track.style.transform=`translateY(-${current*100/(realCount+1)}%)`;
      setTimeout(()=>{if(current===realCount){current=0;track.style.transition='none';track.style.transform='translateY(0)';}accessible();bulletin.dataset.current=String(current);resolve();},680);
    }),4200);
  }
}

const writing=document.querySelector('[data-writing-carousel]');
if(writing){
  const english=locale.id==='en';
  const articles=await embeddedOrFetch('publication-catalog',sitePath('/data/articles.json'));
  const ordered=[...articles].sort((a,b)=>b.date.localeCompare(a.date));
  const slots=[...writing.querySelectorAll('.writing-slot')];
  const shown=slots.map(slot=>slot.querySelector('[data-writing-id]')?.dataset.writingId);
  let cursor=5,slotIndex=0,busy=false;
  async function advance(){
    if(busy||!slots.length||ordered.length<=slots.length)return;
    busy=true;const slot=slots[slotIndex];
    let next;for(let tries=0;tries<ordered.length;tries++){next=ordered[cursor++%ordered.length];if(!shown.includes(next.id))break;}
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!reduced)await slot.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:220,easing:'ease-in',fill:'forwards'}).finished;
    slot.getAnimations().forEach(animation=>animation.cancel());
    slot.innerHTML=writingCard(next,slotIndex,ui,english);shown[slotIndex]=next.id;
    if(!reduced)slot.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:520,easing:'cubic-bezier(.2,.75,.25,1)'});
    slotIndex=(slotIndex+1)%slots.length;writing.dataset.lastArticle=next.id;busy=false;
  }
  const clock=motionClock(writing,advance,4600);
  writing.querySelector('[data-writing-next]')?.addEventListener('click',async()=>{for(let i=0;i<slots.length;i++)await advance();clock.reset();});
}
