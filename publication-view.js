import {esc} from './core.js?v=6c47ece14ac5';
import {sitePath} from './site-config.js?v=6c47ece14ac5';
export const categoryLabels={equity:'股权继承',cross:'跨境继承',family:'婚姻家事',tax:'财富与税务',litigation:'争议解决',english:'英文著述'};
export function articleTitle(article,ui,english=false){return english?(ui.articleTitles?.[article.id]||article.title):article.title;}
export function articleLink(article,english=false){
  if(article.localUrl)return {url:sitePath(article.localUrl),label:english?'Read article →':'阅读全文 →',local:true};
  if(article.url)return {url:article.url,label:english?'Original publication ↗':'发表平台原文 ↗',local:false};
  return {url:sitePath((english?'/en':'')+'/publications/?q='+encodeURIComponent(article.title)),label:english?'Publication details →':'发表信息 →',local:true,record:true};
}
export function writingCard(article,index,ui,english=false){
  const link=articleLink(article,english);
  const title=articleTitle(article,ui,english);
  return `<a class="writing-card" data-writing-id="${esc(article.id)}" href="${esc(link.url)}"${link.local?'':' target="_blank" rel="noopener noreferrer"'}><div class="writing-card-meta"><span>${String(index+1).padStart(2,'0')}</span><span>${esc((ui.categories||categoryLabels)[article.category])}</span><time datetime="${esc(article.date)}">${esc(article.date.replaceAll('-','.'))}</time></div><h3>${esc(title)}</h3><div class="writing-card-foot"><span>${esc(article.platforms?.[0]||article.source)}</span><span>${link.label}</span></div></a>`;
}
export function publicationRow(article,ui,english=false){
  const link=articleLink(article,english);
  const title=articleTitle(article,ui,english);
  const action=link.record
    ?`<button class="publication-row" data-article="${esc(article.id)}" id="${esc(article.id)}">`
    :`<a class="publication-row" id="${esc(article.id)}" href="${esc(link.url)}"${link.local?'':' target="_blank" rel="noopener noreferrer"'}>`;
  const tag=link.record?'button':'a';
  return `${action}<span class="publication-date">${esc(article.date.replaceAll('-','.'))}</span><span class="publication-record"><small>${esc(english?(ui.platformNames?.[article.source]||article.source):article.source)}</small><strong>${esc(title)}</strong><em>${esc((ui.categories||categoryLabels)[article.category])}${article.editionLabel?` · ${esc(article.editionLabel)}`:''}</em></span><span class="publication-row-action">${link.label}</span></${tag}>`;
}
export function groupedTimeline(articles,ui,english=false){
  const groups=new Map();
  [...articles].sort((a,b)=>b.date.localeCompare(a.date)).forEach(article=>{const year=article.date.slice(0,4);if(!groups.has(year))groups.set(year,[]);groups.get(year).push(article);});
  return [...groups].map(([year,records])=>`<section class="publication-year" id="year-${year}"><header><span>${year}</span><small>${String(records.length).padStart(2,'0')} ARTICLES</small></header><div class="publication-list">${records.map(article=>publicationRow(article,ui,english)).join('')}</div></section>`).join('');
}
