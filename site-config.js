// Shared identity and route inventory; English remains unpublished in this phase.
// Resolve assets and navigation from the actual deployment directory.
// Works at localhost /, GitHub project /Michael-cv-test/, and a future custom domain.
export const basePath = typeof document === 'undefined' ? '/' : new URL('./', import.meta.url).pathname;
export function sitePath(path, base = basePath) {
  return path.startsWith('/') && !path.startsWith('//') ? base + path.slice(1) : path;
}
export const site = {
  name: '马乃东', romanizedName: 'NAIDONG MA',
  email: 'naidong.ma@dentons.cn', telephone: '+86 136 0187 1233',
  telephoneHref: 'tel:+8613601871233',
  firmProfile: 'https://shanghai.dacheng.com/lawyer_1/145.html',
};
export const languages = [
  {id: 'zh-CN', label: '中文', prefix: '', available: true},
  {id: 'en', label: 'English', prefix: '/en', available: false},
];
export const routes = {
  home: '/', profile: '/profile/', team: '/team/', practice: '/practice/',
  updates: '/updates/', publications: '/publications/', global: '/global/',
};
export function localizedPath(page, language = 'zh-CN') {
  const locale = languages.find(item => item.id === language);
  if (!locale || !routes[page]) throw new Error('Unknown locale or page');
  return sitePath(`${locale.prefix}${routes[page]}`);
}
