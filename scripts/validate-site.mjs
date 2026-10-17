import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const errors = [];

async function walk(directory) {
  const entries = await fs.readdir(directory, {withFileTypes: true});
  const nested = await Promise.all(entries.map(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }));
  return nested.flat();
}

const files = await walk(root);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const referencePattern = /\b(?:href|src)=["']([^"']+)["']/g;

for (const file of htmlFiles) {
  const source = await fs.readFile(file, 'utf8');
  const relative = path.relative(root, file);
  if (relative !== '404.html') {
    if (!source.includes('<link rel="canonical"')) errors.push(`${relative}: missing canonical`);
    if ((source.match(/hreflang=/g) || []).length !== 3) errors.push(`${relative}: expected three hreflang links`);
    if (source.includes('noindex')) errors.push(`${relative}: still contains noindex`);
  }
  if (source.includes('/Michael-cv-test/')) errors.push(`${relative}: contains a hard-coded GitHub project path`);

  for (const match of source.matchAll(referencePattern)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(reference)) continue;
    const pathname = reference.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    let target = path.resolve(path.dirname(file), pathname);
    try {
      const stat = await fs.stat(target);
      if (stat.isDirectory()) target = path.join(target, 'index.html');
      await fs.access(target);
    } catch {
      errors.push(`${relative}: missing local target ${reference}`);
    }
  }
}

const englishLocale = await fs.readFile(path.join(root, 'locales/en.js'), 'utf8');
const articleData = JSON.parse(await fs.readFile(path.join(root, 'data/articles.json'), 'utf8'));
for (const article of articleData) {
  if (!englishLocale.includes(`'${article.id}'`)) errors.push(`locales/en.js: missing English title for ${article.id}`);
}

for (const jsonFile of files.filter(file => file.endsWith('.json'))) {
  try { JSON.parse(await fs.readFile(jsonFile, 'utf8')); }
  catch (error) { errors.push(`${path.relative(root, jsonFile)}: invalid JSON (${error.message})`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} HTML pages, ${articleData.length} translated publication titles and all JSON files.`);
}
