import {esc,embeddedOrFetch} from './core.js?v=90cb31687375';
import {sitePath} from './site-config.js?v=90cb31687375';
import {ui,locale} from './i18n.js?v=90cb31687375';
import {groupedTimeline,articleTitle} from './publication-view.js?v=90cb31687375';

const english=locale.id==='en';
const categories=ui.categories;
let articles=[],yearObserver;
const publicSearchUrl=article=>`https://cn.bing.com/search?q=${encodeURIComponent('"'+article.title+'" 马乃东')}`;

function showCitation(id){
  const article=articles.find(record=>record.id===id);if(!article)return;
  const root=document.querySelector('#dialog-root');if(!root)return;
  const source=article.sourceUrl||article.url;
  root.innerHTML=`<dialog class="source-dialog" aria-labelledby="citation-title"><button class="dialog-close" aria-label="${english?'Close':'关闭文献信息'}">×</button><p class="eyebrow">PUBLICATION RECORD</p><h2 id="citation-title">${esc(articleTitle(article,ui,english))}</h2><dl><dt>${english?'Published by':'发表平台'}</dt><dd>${esc(article.platforms.join('、'))}</dd><dt>${english?'Publication date':'发表日期'}</dt><dd>${esc(article.date.replaceAll('-','.'))}</dd></dl><a class="button solid" href="${esc(source||publicSearchUrl(article))}" target="_blank" rel="noopener noreferrer">${source?(english?'Original publication ↗':'发表平台原文 ↗'):(english?'Find a public version ↗':'检索公开版本 ↗')}</a></dialog>`;
  const dialog=root.querySelector('dialog');dialog.showModal();
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
}

function activateYearIndex(){
  yearObserver?.disconnect();
  const links=[...document.querySelectorAll('#year-index a')];
  if(!links.length)return;
  yearObserver=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(visible)links.forEach(link=>link.toggleAttribute('aria-current',link.getAttribute('href')==='#'+visible.target.id));
  },{rootMargin:'-18% 0px -65%',threshold:[0,.1,.5]});
  document.querySelectorAll('.publication-year').forEach(section=>yearObserver.observe(section));
}

async function init(){
  const host=document.querySelector('#article-results');if(!host)return;
  try{articles=await embeddedOrFetch('publication-catalog',sitePath('/data/articles.json'));}
  catch(error){
    console.error(error);
    document.querySelector('#result-count').textContent=english?'Interactive filters are unavailable. The article list remains below.':'筛选暂不可用，以下仍可阅读文章目录。';
    return;
  }
  const params=new URLSearchParams(location.search);
  let topic=params.get('topic')||'all';if(!Object.hasOwn(categories,topic))topic='all';
  const search=document.querySelector('#article-search');search.value=params.get('q')||'';
  document.querySelector('#publication-count').textContent=String(articles.length).padStart(2,'0');
  function render(){
    const queryText=search.value.trim().toLowerCase();
    const result=articles.filter(article=>(topic==='all'||article.category===topic||(topic==='english'&&article.language==='en'))&&`${article.title} ${articleTitle(article,ui,english)} ${article.platforms.join(' ')} ${article.series||''}`.toLowerCase().includes(queryText));
    host.innerHTML=result.length?groupedTimeline(result,ui,english):`<div class="empty-state"><h2>${english?'No matching publications':'暂无符合条件的文章'}</h2><p>${english?'Try another keyword or clear the filters.':'可以尝试其他关键词或清除筛选。'}</p><button id="reset-filters" class="button">${english?'Clear filters':'清除筛选'}</button></div>`;
    const years=[...new Set(result.map(article=>article.date.slice(0,4)))].sort((a,b)=>b.localeCompare(a));
    document.querySelector('#year-index').innerHTML=years.map(year=>`<a href="#year-${year}">${year}</a>`).join('');
    document.querySelector('#result-count').textContent=english?`${result.length} of ${articles.length} publications`:`${result.length} 篇作品 / 共 ${articles.length} 篇`;
    document.querySelectorAll('[data-topic]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.topic===topic)));
    const query=new URLSearchParams();if(topic!=='all')query.set('topic',topic);if(queryText)query.set('q',search.value.trim());
    history.replaceState(null,'',location.pathname+(query.size?'?'+query:''));
    document.querySelector('#reset-filters')?.addEventListener('click',()=>{topic='all';search.value='';render();});
    activateYearIndex();
  }
  document.addEventListener('click',event=>{const button=event.target.closest('[data-article]');if(button)showCitation(button.dataset.article);});
  document.querySelectorAll('[data-topic]').forEach(button=>button.addEventListener('click',()=>{topic=button.dataset.topic;render();}));
  search.addEventListener('input',render);render();
}
await init();
