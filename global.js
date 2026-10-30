// The geographic view is loaded locally; it never calls a third-party map API.
import {esc,embeddedOrFetch} from './core.js?v=6c47ece14ac5';
import {sitePath} from './site-config.js?v=6c47ece14ac5';
import {locale} from './i18n.js?v=6c47ece14ac5';
import {mapMarkup,detailMarkup} from './map-shapes.js?v=6c47ece14ac5';
async function init(){const interactive=document.body.dataset.page==='global';const host=document.querySelector(interactive?'#network-map':'#home-map');let places;
 if(!host)return;
 try{places=await embeddedOrFetch('network-data',sitePath(locale.id==='en'?'/data/network.en.json':'/data/network.json'));}catch{if(!host.querySelector('svg'))host.innerHTML='<p>专业联络信息暂时无法加载，请刷新重试。</p>';return;}
 if(interactive){document.querySelector('#country-controls').innerHTML=places.map(p=>`<button data-country="${p.id}" aria-pressed="false" aria-controls="network-detail">${p.name}</button>`).join('');}
 if(!host.querySelector('svg'))try{const response=await fetch(sitePath('/Assets/maps/ne-110m-land.geojson'),{signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('map');host.innerHTML=mapMarkup(await response.json(),places,interactive,locale.id==='en');}catch{host.innerHTML='<p class="map-fallback">上海 · 连接英国、加拿大、新加坡、澳大利亚与阿联酋的专业交流。<br>地图暂时不可用，可通过下方法域选项浏览。</p>';}
 if(!interactive)return;
 const panel=document.querySelector('#network-detail');const stage=document.querySelector('.network-stage');let active;let rotationTimer;
 function select(id,updateUrl=true){const p=places.find(p=>p.id===id)||places[0];if(active===p.id)return;active=p.id;document.querySelectorAll('[data-country]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.country===active)));host.querySelectorAll('[data-route]').forEach(route=>route.classList.toggle('visible',route.dataset.route===active));panel.innerHTML=detailMarkup(p,locale.id==='en');
 panel.querySelectorAll('.network-people img').forEach(image=>{image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label',`${image.alt}，点击查看完整图片`);});
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){panel.getAnimations().forEach(a=>a.cancel());panel.animate([{opacity:.25,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'cubic-bezier(.2,.75,.25,1)'});}
 if(updateUrl)history.replaceState(null,'',`${location.pathname}?region=${active}`);
 }
 const lightboxRoot=document.querySelector('#dialog-root');
 lightboxRoot.innerHTML='<dialog class="network-lightbox" aria-label="查看完整图片"><button class="network-lightbox-close" aria-label="关闭完整图片">×</button><img alt=""><p></p></dialog>';
 const lightbox=lightboxRoot.querySelector('dialog');
 function showImage(image){lightbox.querySelector('img').src=image.currentSrc||image.src;lightbox.querySelector('img').alt=image.alt;lightbox.querySelector('p').textContent=image.alt;lightbox.showModal();}
 lightbox.querySelector('.network-lightbox-close').addEventListener('click',()=>lightbox.close());
 lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close();});
 document.querySelectorAll('.event-grid img').forEach(image=>{image.dataset.zoomable='true';image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label',`${image.alt}，点击查看完整图片`);});
 function stopRotation(){clearTimeout(rotationTimer);rotationTimer=undefined;}
 function scheduleRotation(){stopRotation();if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.hidden)return;rotationTimer=setTimeout(()=>{const index=places.findIndex(place=>place.id===active);select(places[(index+1)%places.length].id,false);scheduleRotation();},7000);}
 stage.addEventListener('click',event=>{const button=event.target.closest('[data-country]');if(button){select(button.dataset.country);scheduleRotation();return;}const image=event.target.closest('.network-people img');if(image)showImage(image);});
 stage.addEventListener('keydown',event=>{const image=event.target.closest('.network-people img');if(image&&(event.key==='Enter'||event.key===' ')){event.preventDefault();showImage(image);}});
 stage.addEventListener('pointerenter',stopRotation);stage.addEventListener('pointerleave',scheduleRotation);stage.addEventListener('focusin',stopRotation);stage.addEventListener('focusout',event=>{if(!stage.contains(event.relatedTarget))scheduleRotation();});
 document.querySelector('.event-grid')?.addEventListener('click',event=>{const image=event.target.closest('img[data-zoomable]');if(image)showImage(image);});
 document.querySelector('.event-grid')?.addEventListener('keydown',event=>{const image=event.target.closest('img[data-zoomable]');if(image&&(event.key==='Enter'||event.key===' ')){event.preventDefault();showImage(image);}});
 document.addEventListener('visibilitychange',()=>document.hidden?stopRotation():scheduleRotation());
 select(new URLSearchParams(location.search).get('region')||'uk',false);scheduleRotation();
}
init();
