// Content features share these helpers without importing the page shell.
export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
}[char]));

let observer;
export function reveal() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  observer ||= new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.remove('pending'); observer.unobserve(entry.target);
    }
  }, {threshold:.04});
  document.querySelectorAll('.section-heading,.introduction>div,.practice-grid>a,.article-card,.team-card,.member-profile').forEach(element => {
    if (!element.classList.contains('reveal')) {
      element.classList.add('reveal');
      if (element.getBoundingClientRect().top > innerHeight) element.classList.add('pending');
    }
    if (element.classList.contains('pending')) observer.observe(element);
  });
}

export async function embeddedOrFetch(id, url) {
  const embedded = document.getElementById(id);
  if (embedded) return JSON.parse(embedded.textContent);
  const response = await fetch(url, {cache:'no-cache', signal:AbortSignal.timeout(8000)});
  if (!response.ok) throw new Error('Content unavailable: ' + response.status);
  return response.json();
}
