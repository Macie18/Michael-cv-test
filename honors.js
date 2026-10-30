import {esc} from './app.js';
import {sitePath} from './site-config.js';

const wall = document.querySelector('#honors-wall');
try {
  const response = await fetch(sitePath('/data/honors.json'));
  if (!response.ok) throw new Error('Honors unavailable');
  const honors = await response.json();
  const grouped = honors.reduce((years, honor) => {
    const current = years.at(-1);
    if (!current || current.year !== honor.year) years.push({year: honor.year, records: [honor]});
    else current.records.push(honor);
    return years;
  }, []);
  wall.innerHTML = grouped.map(group => `<section class="honor-year-group">
    <div class="honor-year"><span>${esc(group.year)}</span><small>${String(group.records.length).padStart(2, '0')}</small></div>
    <div class="honor-year-records">${group.records.map(h => `<article class="honor-row ${h.kind === '奖项提名' ? 'nomination' : ''}">
      <div class="honor-source"><span>${esc(h.kind)}</span><strong>${esc(h.publisher)}</strong></div>
      <div class="honor-result"><h3>${esc(h.title)}</h3><p>${esc(h.guide)}</p></div>
      ${h.url ? `<a href="${esc(h.url)}" target="_blank" rel="noopener noreferrer" aria-label="查看 ${esc(h.publisher)} ${esc(h.year)} 榜单">↗</a>` : '<span class="honor-no-link" aria-hidden="true">—</span>'}
    </article>`).join('')}</div>
  </section>`).join('');
  if (location.hash === '#honors') {
    const scrollToHonors = () => document.querySelector('#honors')?.scrollIntoView({block: 'start'});
    scrollToHonors();
    Promise.all([...document.images].map(image => image.complete
      ? Promise.resolve()
      : new Promise(resolve => image.addEventListener('load', resolve, {once: true}))
    )).then(scrollToHonors);
  }
} catch {
  wall.innerHTML = '<p>荣誉记录暂时无法加载，请刷新重试。</p>';
}
