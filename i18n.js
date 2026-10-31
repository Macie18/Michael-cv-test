import zhCN from './locales/zh-CN.js?v=90cb31687375';
import en from './locales/en.js?v=90cb31687375';
import {languages, localizedPath} from './site-config.js?v=90cb31687375';
const dictionaries = {'zh-CN': zhCN, en};
const requestedLanguage = document.documentElement.lang || 'zh-CN';
export const locale = languages.find(item => item.id === requestedLanguage && item.available);
if (!locale || !dictionaries[locale.id]) throw new Error(`Language not yet released: ${requestedLanguage}`);
export const ui = dictionaries[locale.id];
export const pagePath = page => localizedPath(page, locale.id);
