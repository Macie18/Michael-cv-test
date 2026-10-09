import zhCN from './locales/zh-CN.js';
import {languages, localizedPath} from './site-config.js';
const dictionaries = {'zh-CN': zhCN};
const requestedLanguage = document.documentElement.lang || 'zh-CN';
export const locale = languages.find(item => item.id === requestedLanguage && item.available);
if (!locale || !dictionaries[locale.id]) throw new Error(`Language not yet released: ${requestedLanguage}`);
export const ui = dictionaries[locale.id];
export const pagePath = page => localizedPath(page, locale.id);
