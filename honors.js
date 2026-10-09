import {esc} from './app.js';
import {sitePath} from './site-config.js';

const wall = document.querySelector('#honors-wall');
try {
  const response = await fetch(sitePath('/data/honors.json'));
  if (!response.ok) throw new Error('Honors unavailable');
  const honors = await response.json();
  wall.innerHTML = honors.map(h => `<article class="honor-card ${h.kind === '奖项提名' ? 'nomination' : ''}">
    <div class="honor-meta"><span>${esc(h.year)}</span><span>${esc(h.kind)}</span></div>
    <div class="honor-publisher">${esc(h.publisher)}</div>
    <h3>${esc(h.title)}</h3><p>${esc(h.guide)}</p>
    ${h.url ? `<a href="${esc(h.url)}" target="_blank" rel="noopener noreferrer">查看榜单 ↗</a>` : ''}
  </article>`).join('');
} catch {
  wall.innerHTML = '<p>荣誉记录暂时无法加载，请刷新重试。</p>';
}
