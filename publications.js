import {esc,reveal} from './app.js';
import {sitePath} from './site-config.js';
import {ui} from './i18n.js';
import {preview,description} from './article-previews.js';

const categories=ui.categories;
let articles=[];
const isWk=a=>a.linkSource==='威科先行'||a.platforms.some(platform=>platform.includes('威科'));
const publicSearchUrl=a=>`https://cn.bing.com/search?q=${encodeURIComponent(`"${a.title}" 马乃东`)}`;
const resolvedLink=a=>a.localUrl
  ? {url:sitePath(a.localUrl),label:'阅读全文 →',version:'站内全文',local:true}
  : isWk(a)
  ? {url:publicSearchUrl(a),label:'检索公开版本 ↗',version:'浏览器检索结果'}
  : a.url
    ? {url:a.url,label:a.linkSource==='大成律师事务所'?'阅读大成版本':'阅读原文 ↗',version:a.linkVersion||'原文'}
    : null;

function shortTitle(a){return a.title.replace(/^股权继承诉讼法律风险之（.+?）[—：]+/,'').replace(/^跨境继承（.+?）[—：]+/,'');}
export function card(a){
  const link=resolvedLink(a);
  const inside=`${preview(a)}<div class="article-body"><div class="article-meta"><span>${esc(a.source.replace('Chambers and Partners','Chambers').replace('International Family Law Journal','IFL Journal'))}</span><span>${esc(a.date.replaceAll('-','.'))}</span></div><h3>${esc(shortTitle(a))}</h3>${description(a)}<div class="article-card-bottom"><span>${a.updated?`${a.updated.slice(0,4)} 更新`:categories[a.category]}</span><span class="article-open">${link?esc(link.label):'文献详情'}</span></div></div>`;
  return link
    ? `<a class="article-card" href="${esc(link.url)}" ${link.local?'':'target="_blank" rel="noopener noreferrer"'} aria-label="${esc(a.title)}（${esc(link.version)}${link.local?'':'，新窗口'}）">${inside}</a>`
    : `<button class="article-card" data-article="${a.id}" aria-label="查看文献信息：${esc(a.title)}">${inside}</button>`;
}

function row(a){
  const link=resolvedLink(a);
  const content=`<span class="publication-date">${esc(a.date.replaceAll('-','.'))}</span><span class="publication-record"><small>${esc(a.source)}</small><strong>${esc(a.title)}</strong><em>${esc(categories[a.category])}${a.series?` · ${esc(a.series)}`:''}</em></span><span class="publication-row-action">${link?esc(link.label):'文献详情'}</span>`;
  return link
    ? `<a class="publication-row" href="${esc(link.url)}" ${link.local?'':'target="_blank" rel="noopener noreferrer"'} aria-label="${esc(a.title)}（${esc(link.version)}${link.local?'':'，新窗口'}）">${content}</a>`
    : `<button class="publication-row" data-article="${a.id}" aria-label="查看文献信息：${esc(a.title)}">${content}</button>`;
}

function showCitation(id){
  const a=articles.find(record=>record.id===id);if(!a)return;
  const search=publicSearchUrl(a);const root=document.querySelector('#dialog-root');
  root.innerHTML=`<dialog class="source-dialog" aria-labelledby="citation-title"><button class="dialog-close" aria-label="关闭文献信息">×</button><p class="eyebrow">PUBLICATION RECORD</p><h2 id="citation-title">${esc(a.title)}</h2><dl><dt>发表平台</dt><dd>${esc(a.platforms.join('、'))}</dd><dt>发表日期</dt><dd>${esc(a.date.replaceAll('-','.'))}${a.updated?`<br>${esc(a.updated.replaceAll('-','.'))} 更新版`:''}</dd>${a.series?`<dt>所属系列</dt><dd>${esc(a.series)}</dd>`:''}</dl><p>可通过浏览器检索文章标题及作者，查找发表记录或公开转载版本。</p><a class="button solid" href="${esc(search)}" target="_blank" rel="noopener noreferrer">浏览器检索</a></dialog>`;
  const dialog=root.querySelector('dialog');dialog.showModal();
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-article]');if(button)showCitation(button.dataset.article);});

function groupedTimeline(result){
  const groups=new Map();
  [...result].sort((a,b)=>b.date.localeCompare(a.date)).forEach(article=>{const year=article.date.slice(0,4);if(!groups.has(year))groups.set(year,[]);groups.get(year).push(article);});
  return [...groups].map(([year,records])=>`<section class="publication-year" id="year-${year}"><header><span>${year}</span><small>${String(records.length).padStart(2,'0')} ARTICLES</small></header><div class="publication-list">${records.map(row).join('')}</div></section>`).join('');
}

function activateYearIndex(){
  const links=[...document.querySelectorAll('#year-index a')];const sections=[...document.querySelectorAll('.publication-year')];if(!links.length||!sections.length)return;
  const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;links.forEach(link=>link.toggleAttribute('aria-current',link.getAttribute('href')===`#${visible.target.id}`));},{rootMargin:'-18% 0px -65%',threshold:[0,.1,.5]});
  sections.forEach(section=>observer.observe(section));
}

async function init(){
  try{const response=await fetch(sitePath('/data/articles.json'));if(!response.ok)throw new Error('catalog');articles=await response.json();}
  catch{const host=document.querySelector('#featured-articles')||document.querySelector('#article-results');host.innerHTML='<p>文章目录暂时无法加载，请刷新页面重试。</p>';return;}
  if(document.body.dataset.page==='home'){
    const titles=['跨境继承（一）','股权继承诉讼法律风险之（十一）','跨境继承（二）'];
    document.querySelector('#featured-articles').innerHTML=titles.map(title=>articles.find(article=>article.title.startsWith(title))).filter(Boolean).map(card).join('');reveal();return;
  }
  const params=new URLSearchParams(location.search);let topic=params.get('topic')||'all';if(!Object.hasOwn(categories,topic))topic='all';
  const search=document.querySelector('#article-search');search.value=params.get('q')||'';document.querySelector('#publication-count').textContent=String(articles.length).padStart(2,'0');
  function render(){
    const queryText=search.value.trim().toLowerCase();
    const result=articles.filter(article=>(topic==='all'||article.category===topic||(topic==='english'&&article.language==='en'))&&`${article.title} ${article.platforms.join(' ')} ${article.series||''}`.toLowerCase().includes(queryText));
    const host=document.querySelector('#article-results');host.innerHTML=result.length?groupedTimeline(result):'<div class="empty-state"><h2>暂无符合条件的文章</h2><p>可以尝试其他关键词或清除筛选。</p><button id="reset-filters" class="button">清除筛选</button></div>';
    const years=[...new Set(result.map(article=>article.date.slice(0,4)))].sort((a,b)=>b.localeCompare(a));
    document.querySelector('#year-index').innerHTML=years.map(year=>`<a href="#year-${year}">${year}</a>`).join('');
    document.querySelector('#result-count').textContent=`${result.length} 篇作品 / 共 ${articles.length} 篇`;
    document.querySelectorAll('[data-topic]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.topic===topic)));
    const query=new URLSearchParams();if(topic!=='all')query.set('topic',topic);if(queryText)query.set('q',search.value.trim());history.replaceState(null,'',location.pathname+(query.size?'?'+query:''));
    document.querySelector('#reset-filters')?.addEventListener('click',()=>{topic='all';search.value='';render();});activateYearIndex();
  }
  document.querySelectorAll('[data-topic]').forEach(button=>button.addEventListener('click',()=>{topic=button.dataset.topic;render();}));search.addEventListener('input',render);render();
}
init();
