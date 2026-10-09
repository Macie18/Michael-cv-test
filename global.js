// The geographic view is loaded locally; it never calls a third-party map API.
import {esc} from './app.js';
import {sitePath} from './site-config.js';
const hub=[121.47,31.23];
const project=([lon,lat])=>[(lon+180)/360*1000,(85-lat)/145*440];
const [hx,hy]=project(hub);
function landPaths(geo){return geo.features.flatMap(f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).map(p=>p.map(r=>r.map((c,i)=>{const [x,y]=project(c);return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;}).join('')+'Z').join('')).join('');}
function arc(coordinates){const [x,y]=project(coordinates);return `M${hx},${hy} Q${(hx+x)/2},${Math.min(hy,y)-Math.min(Math.abs(hx-x)*.23,100)} ${x},${y}`;}
function mapMarkup(geo,places,interactive){return `<svg viewBox="0 0 1000 440" aria-hidden="true" focusable="false"><defs><clipPath id="${interactive?'large':'small'}-map-clip"><rect width="1000" height="440"/></clipPath></defs><g clip-path="url(#${interactive?'large':'small'}-map-clip)"><path class="land" d="${landPaths(geo)}"/>${places.map(p=>`<path class="map-route ${interactive?'':'visible'}" data-route="${p.id}" d="${arc(p.coordinates)}" pathLength="1"/>`).join('')}<circle class="hub-halo" cx="${hx}" cy="${hy}" r="12"/><circle class="hub-dot" cx="${hx}" cy="${hy}" r="4"/>${!interactive?places.map(p=>{const [x,y]=project(p.coordinates);return `<circle class="static-dot" cx="${x}" cy="${y}" r="4"/>`;}).join(''):''}<text class="hub-label" x="${hx+16}" y="${hy-9}">上海</text></g></svg>${interactive?places.map(p=>{const [x,y]=project(p.coordinates);return `<button class="map-point" style="left:${x/10}%;top:${y/4.4}%" data-country="${p.id}" aria-label="${p.name}：查看专业联络" aria-pressed="false" aria-controls="network-detail"><span class="point-core"></span><span class="point-label">${p.name}</span></button>`;}).join(''):''}`;}
async function init(){const interactive=document.body.dataset.page==='global';const host=document.querySelector(interactive?'#network-map':'#home-map');let places;
 try{const response=await fetch(sitePath('/data/network.json'));if(!response.ok)throw new Error('network');places=await response.json();}catch{host.innerHTML='<p>专业联络信息暂时无法加载，请刷新重试。</p>';return;}
 if(interactive){document.querySelector('#country-controls').innerHTML=places.map(p=>`<button data-country="${p.id}" aria-pressed="false" aria-controls="network-detail">${p.name}</button>`).join('');}
 try{const response=await fetch(sitePath('/Assets/maps/ne-110m-land.geojson'));if(!response.ok)throw new Error('map');host.innerHTML=mapMarkup(await response.json(),places,interactive)+(!interactive?'<p class="map-caption">SHANGHAI & THE WORLD</p>':'');}catch{host.innerHTML='<p class="map-fallback">上海 · 连接英国、加拿大、新加坡、澳大利亚与阿联酋的专业交流。<br>地图暂时不可用，可通过下方法域选项浏览。</p>';}
 if(!interactive)return;
 const panel=document.querySelector('#network-detail');let active;
 function select(id,updateUrl=true){const p=places.find(p=>p.id===id)||places[0];if(active===p.id)return;active=p.id;document.querySelectorAll('[data-country]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.country===active)));host.querySelectorAll('[data-route]').forEach(route=>route.classList.toggle('visible',route.dataset.route===active));panel.innerHTML=`<p class="eyebrow">${esc(p.english)}</p><h2>${esc(p.name)}<span>${esc(p.city)}</span></h2><p class="network-intro">${esc(p.intro)}</p><div class="network-people">${p.people.map(person=>`<figure><img src="${sitePath('/Assets/network/')}${esc(person.image)}" alt="${esc(person.name)}相关专业交流资料" width="200" height="120"><figcaption><strong>${esc(person.name)}</strong><span>${esc(person.firm)}</span></figcaption></figure>`).join('')}</div><p class="network-record">${esc(p.note)}</p>`;
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){panel.getAnimations().forEach(a=>a.cancel());panel.animate([{opacity:.25,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'cubic-bezier(.2,.75,.25,1)'});}
 if(updateUrl)history.replaceState(null,'',`${location.pathname}?region=${active}`);
 }
 document.querySelector('.network-stage').addEventListener('click',e=>{const b=e.target.closest('[data-country]');if(b)select(b.dataset.country);});
 select(new URLSearchParams(location.search).get('region')||'uk',false);
}
init();
