import {site, languages, localizedPath, routes} from './site-config.js';
import {ui, locale, pagePath} from './i18n.js';

export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

const page = document.body.dataset.page;
if (!document.querySelector('link[rel="icon"]')) {
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.type = 'image/svg+xml';
  icon.href = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#171719"/><text x="32" y="46" font-family="Georgia" font-size="45" text-anchor="middle" fill="#d1be97">M</text></svg>');
  document.head.append(icon);
}

// Only released languages receive a switch; never send visitors to placeholder pages.
const otherLanguages = languages.filter(item => item.available && item.id !== locale.id);
const languageLinks = otherLanguages.map(item =>
  '<a class="language-link" href="' + localizedPath(page, item.id) + '" lang="' + item.id + '" hreflang="' + item.id + '">' + esc(item.label) + '</a>'
).join('');
const navigation = Object.keys(routes).map(id =>
  '<a href="' + pagePath(id) + '" ' + (id === page ? 'aria-current="page"' : '') + '>' + ui.nav[id] + '</a>'
).join('');
document.querySelector('#site-header').innerHTML = `
  <header class="site-header wrap">
    <a class="brand" href="${pagePath('home')}" aria-label="${esc(ui.brand.name)} · ${ui.nav.home}">
      <span class="brand-mark" aria-hidden="true">M</span>
      <span class="brand-name">${esc(ui.brand.name)}<small>${esc(ui.brand.subtitle)}</small></span>
    </a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="main-nav">${ui.nav.menu} <span aria-hidden="true">☰</span></button>
    <nav class="nav" id="main-nav" aria-label="${ui.nav.label}">
      ${navigation}${languageLinks}<a class="contact-link" href="#contact">${ui.nav.contact}</a>
    </nav>
  </header>`;

const footer = ui.footer;
document.querySelector('#site-footer').innerHTML = `
  <footer class="site-footer" id="contact"><div class="wrap">
    <div class="footer-top">
      <div><p class="eyebrow">${footer.eyebrow}</p><h2>${footer.heading.map(esc).join('<br>')}</h2>
        <a class="footer-email" href="mailto:${site.email}">${site.email}</a>
      </div>
      <div class="footer-detail"><strong>${footer.position}</strong>${footer.firm}<br>${footer.languages}<br>
        <a href="${site.telephoneHref}">${site.telephone}</a><br>
        <a href="${site.firmProfile}" target="_blank" rel="noopener noreferrer">${footer.officialProfile}</a>
      </div>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} ${footer.copyright}</span>
      <span>${footer.practices}</span><span>${footer.disclaimer}</span>
    </div>
  </div></footer>`;

const menu = document.querySelector('.menu-toggle');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  document.querySelector('.nav').classList.remove('open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.querySelector('.nav').classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});
document.querySelector('.contact-link').addEventListener('click', closeMenu);

const revealObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.remove('pending');
    revealObserver.unobserve(entry.target);
  }
}, {threshold: .04});
export function reveal() {
  revealObserver.disconnect();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.section-heading,.introduction>div,.practice-grid>a,.article-card,.team-card,.member-profile').forEach(element => {
    if (!element.classList.contains('reveal')) {
      element.classList.add('reveal');
      if (element.getBoundingClientRect().top > innerHeight) element.classList.add('pending');
    }
    if (element.classList.contains('pending')) revealObserver.observe(element);
  });
}
export function toast(message) {
  document.querySelector('.toast')?.remove();
  const element = document.createElement('div');
  element.className = 'toast';
  element.setAttribute('role', 'status');
  element.textContent = message;
  document.body.append(element);
  setTimeout(() => element.remove(), 2600);
}
document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-copy-phone]');if(!button)return;
  try{await navigator.clipboard.writeText(button.dataset.copyPhone);toast(ui.common.phoneCopied);}
  catch{toast(ui.common.copyFailed);}
});
reveal();
document.querySelector('.print-profile')?.addEventListener('click', () => window.print());
if (page === 'home' || page === 'publications') import('./publications.js');
if (page === 'home' || page === 'global') import('./global.js');
if (page === 'profile') import('./honors.js');
