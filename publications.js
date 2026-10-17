import {esc,reveal} from './app.js';
import {sitePath} from './site-config.js';
import {ui} from './i18n.js';
import {preview,description} from './article-previews.js';

const categories=ui.categories;
const copy=ui.publications;
let articles=[];
const isWk=a=>a.linkSource==='威科先行'||a.platforms.some(platform=>platform.includes('威科'));
const isEnglish=document.documentElement.lang==='en';
const publicSearchUrl=a=>`${isEnglish?'https://www.bing.com':'https://cn.bing.com'}/search?q=${encodeURIComponent(`"${a.title}" 马乃东`)}`;
const resolvedLink=a=>isWk(a)
  ? {url:publicSearchUrl(a),label:copy.searchPublic,version:copy.browserResults}
  : a.url
    ? {url:a.url,label:a.linkSource==='大成律师事务所'?copy.readDacheng:copy.readOriginal,version:isEnglish?copy.original:(a.linkVersion||copy.original)}
    : null;

const title=a=>ui.articleTitles?.[a.id]||a.title;
const platform=value=>ui.platformNames?.[value]||value;
const articlePlatforms=a=>a.platforms.map(platform).join(localeCompareSeparator());
const localeCompareSeparator=()=>isEnglish?', ':'、';
function shortTitle(a){return title(a).replace(/^股权继承诉讼法律风险之（.+?）[—：]+/,'').replace(/^跨境继承（.+?）[—：]+/,'');}
export function card(a){
  const link=resolvedLink(a);
  const source=platform(a.source).replace('Chambers and Partners','Chambers').replace('International Family Law Journal','IFL Journal');
  const inside=`${preview(a)}<div class="article-body"><div class="article-meta"><span>${esc(source)}</span><span>${esc(a.date.replaceAll('-','.'))}</span></div><h3>${esc(shortTitle(a))}</h3>${description(a)}<div class="article-card-bottom"><span>${a.updated?`${a.updated.slice(0,4)} ${copy.updated}`:categories[a.category]}</span><span class="article-open">${link?esc(link.label):copy.record}</span></div></div>`;
  return link
    ? `<a class="article-card" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(title(a))} (${esc(link.version)}, ${copy.newWindow})">${inside}</a>`
    : `<button class="article-card" data-article="${a.id}" aria-label="${copy.record}: ${esc(title(a))}">${inside}</button>`;
}

function row(a){
  const link=resolvedLink(a);
  const content=`<span class="publication-date">${esc(a.date.replaceAll('-','.'))}</span><span class="publication-record"><small>${esc(platform(a.source))}</small><strong>${esc(title(a))}</strong><em>${esc(categories[a.category])}${a.series&&!isEnglish?` · ${esc(a.series)}`:''}</em></span><span class="publication-row-action">${link?esc(link.label):copy.record}</span>`;
  return link
    ? `<a class="publication-row" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(title(a))} (${esc(link.version)}, ${copy.newWindow})">${content}</a>`
    : `<button class="publication-row" data-article="${a.id}" aria-label="${copy.record}: ${esc(title(a))}">${content}</button>`;
}

function showCitation(id){
  const a=articles.find(record=>record.id===id);if(!a)return;
  const search=publicSearchUrl(a);const root=document.querySelector('#dialog-root');
  root.innerHTML=`<dialog class="source-dialog" aria-labelledby="citation-title"><button class="dialog-close" aria-label="${copy.dialogClose}">×</button><p class="eyebrow">${copy.recordEyebrow}</p><h2 id="citation-title">${esc(title(a))}</h2><dl><dt>${copy.platforms}</dt><dd>${esc(articlePlatforms(a))}</dd><dt>${copy.published}</dt><dd>${esc(a.date.replaceAll('-','.'))}${a.updated?`<br>${esc(a.updated.replaceAll('-','.'))} ${copy.updatedEdition}`:''}</dd>${a.series&&!isEnglish?`<dt>${copy.series}</dt><dd>${esc(a.series)}</dd>`:''}</dl><p>${copy.searchHint}</p><a class="button solid" href="${esc(search)}" target="_blank" rel="noopener noreferrer">${copy.browserSearch}</a></dialog>`;
  const dialog=root.querySelector('dialog');dialog.showModal();
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-article]');if(button)showCitation(button.dataset.article);});

function groupedTimeline(result){
  const groups=new Map();
  [...result].sort((a,b)=>b.date.localeCompare(a.date)).forEach(article=>{const year=article.date.slice(0,4);if(!groups.has(year))groups.set(year,[]);groups.get(year).push(article);});
  return [...groups].map(([year,records])=>`<section class="publication-year" id="year-${year}"><header><span>${year}</span><small>${String(records.length).padStart(2,'0')} ${copy.articles}</small></header><div class="publication-list">${records.map(row).join('')}</div></section>`).join('');
}

function activateYearIndex(){
  const links=[...document.querySelectorAll('#year-index a')];const sections=[...document.querySelectorAll('.publication-year')];if(!links.length||!sections.length)return;
  const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;links.forEach(link=>link.toggleAttribute('aria-current',link.getAttribute('href')===`#${visible.target.id}`));},{rootMargin:'-18% 0px -65%',threshold:[0,.1,.5]});
  sections.forEach(section=>observer.observe(section));
}

async function init(){
  try{const response=await fetch(sitePath('/data/articles.json'));if(!response.ok)throw new Error('catalog');articles=await response.json();}
  catch{const host=document.querySelector('#featured-articles')||document.querySelector('#article-results');host.innerHTML=`<p>${copy.loadError}</p>`;return;}
  if(document.body.dataset.page==='home'){
    const ids=['article-b83cc838ee','article-b8c1fb9656','article-d515e7c35b'];
    document.querySelector('#featured-articles').innerHTML=ids.map(id=>articles.find(article=>article.id===id)).filter(Boolean).map(card).join('');reveal();return;
  }
  const params=new URLSearchParams(location.search);let topic=params.get('topic')||'all';if(!Object.hasOwn(categories,topic))topic='all';
  const search=document.querySelector('#article-search');search.value=params.get('q')||'';document.querySelector('#publication-count').textContent=String(articles.length).padStart(2,'0');
  function render(){
    const queryText=search.value.trim().toLowerCase();
    const result=articles.filter(article=>(topic==='all'||article.category===topic||(topic==='english'&&article.language==='en'))&&`${title(article)} ${article.title} ${articlePlatforms(article)} ${article.series||''}`.toLowerCase().includes(queryText));
    const host=document.querySelector('#article-results');host.innerHTML=result.length?groupedTimeline(result):`<div class="empty-state"><h2>${copy.emptyTitle}</h2><p>${copy.emptyBody}</p><button id="reset-filters" class="button">${copy.clear}</button></div>`;
    const years=[...new Set(result.map(article=>article.date.slice(0,4)))].sort((a,b)=>b.localeCompare(a));
    document.querySelector('#year-index').innerHTML=years.map(year=>`<a href="#year-${year}">${year}</a>`).join('');
    document.querySelector('#result-count').textContent=isEnglish?`${result.length} of ${articles.length} publications`:`${result.length} ${copy.works} / ${copy.total} ${articles.length} ${copy.unit}`;
    document.querySelectorAll('[data-topic]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.topic===topic)));
    const query=new URLSearchParams();if(topic!=='all')query.set('topic',topic);if(queryText)query.set('q',search.value.trim());history.replaceState(null,'',location.pathname+(query.size?'?'+query:''));
    document.querySelector('#reset-filters')?.addEventListener('click',()=>{topic='all';search.value='';render();});activateYearIndex();
  }
  document.querySelectorAll('[data-topic]').forEach(button=>button.addEventListener('click',()=>{topic=button.dataset.topic;render();}));search.addEventListener('input',render);render();
}
init();
