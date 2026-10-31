// Independent enhancement: static article lists and maps remain usable on failure.
const jobs=[];
if(document.querySelector('#article-results'))jobs.push(import('./publications.js?v=90cb31687375'));
if(document.querySelector('#home-map,#network-map'))jobs.push(import('./global.js?v=90cb31687375'));
if(document.querySelector('#honors-wall'))jobs.push(import('./honors.js?v=90cb31687375'));
if(document.querySelector('.news-bulletin,[data-writing-carousel]'))jobs.push(import('./home-motion.js?v=90cb31687375'));
for(const result of await Promise.allSettled(jobs))if(result.status==='rejected')console.error('Page enhancement failed:',result.reason);
