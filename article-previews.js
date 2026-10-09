import {esc} from './app.js';
import {sitePath} from './site-config.js';

// Supplied PPT screenshots, not authenticated web captures. Replace by stable article ID.
const screenshots = {
  'article-b83cc838ee': '/Assets/publications/cross-border-inheritance-01.webp',
  'article-d515e7c35b': '/Assets/publications/cross-border-inheritance-02.webp',
};

export function preview(a) {
  const image = screenshots[a.id] || a.cover;
  const citation = [...new Set(a.records.map(r => r.citation))].slice(0, 2);
  const contents = image
    ? `<img src="${esc(sitePath(image))}" alt="" loading="lazy"><p class="image-context">原始材料所附发表页截图。点击卡片前往${esc(a.linkSource || a.source)}的文章页面；不同平台的排版和日期可能不同。</p>`
    : `<span class="preview-publisher">${esc(a.source)}</span><h4>${esc(a.title)}</h4>
      <p>首次记录：${esc(a.date)}${a.updated ? `<br>更新版本：${esc(a.updated)}` : ''}</p>
      ${citation.map(c => `<p>${esc(c)}</p>`).join('')}
      <p class="preview-note">文献题录预览，非原文截图。${esc(a.accessNote || (a.url ? '完整文章请前往发表平台阅读。' : '原文链接待补充。'))}</p>`;
  return `<div class="article-preview" aria-hidden="true"><div class="preview-sheet ${image ? 'preview-image' : ''}">${contents}</div><div class="preview-label"><span>${image ? '原始材料截图' : '文献预览'}</span><span>上下浏览 ↕</span></div></div>`;
}

// Scroll a local preview, never attempt to control a third-party frame.
const states = new WeakMap();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
function stateFor(frame) {
  if (!states.has(frame)) states.set(frame, {current: 0, target: 0, raf: 0});
  return states.get(frame);
}
function move(frame, value) {
  const sheet = frame.querySelector('.preview-sheet');
  const state = stateFor(frame);
  const max = Math.max(0, sheet.scrollHeight - frame.clientHeight + 32);
  state.target = Math.max(0, Math.min(max, value));
  if (state.raf) return;
  const tick = () => {
    state.current = reduced.matches ? state.target : state.current + (state.target - state.current) * .14;
    if (Math.abs(state.current - state.target) < .2) state.current = state.target;
    sheet.style.transform = `translateY(${-state.current}px)`;
    state.raf = state.current !== state.target && frame.isConnected ? requestAnimationFrame(tick) : 0;
  };
  state.raf = requestAnimationFrame(tick);
}
document.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || reduced.matches) return;
  const frame = e.target.closest('.article-preview');
  if (!frame) return;
  const rect = frame.getBoundingClientRect();
  const max = Math.max(0, frame.querySelector('.preview-sheet').scrollHeight - frame.clientHeight + 32);
  move(frame, ((e.clientY - rect.top) / rect.height) * max);
});
document.addEventListener('pointerout', e => {
  const frame = e.target.closest('.article-preview');
  if (frame && !frame.contains(e.relatedTarget)) move(frame, 0);
});
document.addEventListener('focusout', e => {
  const frame = e.target.closest('.article-card')?.querySelector('.article-preview');
  if (frame) move(frame, 0);
});
document.addEventListener('keydown', e => {
  if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
  const frame = e.target.closest('.article-card')?.querySelector('.article-preview');
  if (!frame) return;
  e.preventDefault();
  move(frame, stateFor(frame).target + (e.key === 'ArrowDown' ? 65 : -65));
});
document.addEventListener('wheel', e => {
  const frame = e.target.closest('.article-preview');
  if (!frame || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
  const state = stateFor(frame);
  const max = Math.max(0, frame.querySelector('.preview-sheet').scrollHeight - frame.clientHeight + 32);
  if ((e.deltaY > 0 && state.target >= max) || (e.deltaY < 0 && state.target <= 0)) return;
  e.preventDefault();
  move(frame, state.target + e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? frame.clientHeight : 1));
}, {passive: false});
