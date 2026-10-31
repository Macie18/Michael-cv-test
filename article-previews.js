import {esc} from './core.js?v=90cb31687375';

// Only verified, article-specific covers. Never substitute a webpage screenshot,
// a publisher's site banner, or a made-up image for an unavailable original cover.
export const linkPreviews = {
  'article-b83cc838ee': {
    description: '从非诉讼角度梳理跨境遗产办理：境外人士如何继承境内遗产，以及内地公民办理境外继承的流程。',
    source: 'https://www.dacheng.com/Content/2024/10-11/0000001081.html',
  },
  'article-d515e7c35b': {
    description: '跨境继承纠纷应在哪里起诉？从法院管辖、平行诉讼与司法层级出发，讨论境内外程序的衔接。',
    source: 'https://www.dacheng.com/Content/2024/10-29/0000009854.html',
  },
  'article-b8c1fb9656': {
    description: '围绕股东会决议，讨论股权继承中的股东身份、人事安排与企业控制权争议。',
    source: 'https://dacheng.com/Content/2023/12-04/0000002628.html',
  },
  'article-83b408415b': {
    image: 'https://img.hubbis.com/article_detail_optimiser/img/article/cropped/54852f43be3f685ca945fcd1134d57adfcf6b1b6.jpg',
    source: 'https://hubbis.com/article/commentary-on-implementation-of-new-individual-income-tax-law-regulation-in-china',
    imageType: 'og:image',
    verifiedOn: '2026-10-09',
  },
};

export function preview(a) {
  const image = linkPreviews[a.id]?.image;
  if (!image) return '';
  return `<div class="article-preview"><img class="article-thumbnail" src="${esc(image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" width="600" height="400"></div>`;
}

export function description(a) {
  const text = linkPreviews[a.id]?.description;
  return text ? `<p class="article-excerpt">${esc(text)}</p>` : '';
}

// A blocked or removed remote cover falls back to the same text-only link card.
document.addEventListener('error', event => {
  if (event.target.matches?.('.article-thumbnail')) event.target.closest('.article-preview')?.remove();
}, true);
