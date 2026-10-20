import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const academyOrigin = 'https://xn--zb0bzfz85bysd8qd313b.com';
export const clubOrigin = 'https://sparringclub.kr';

export async function prepare(sourceDirectory, outputDirectory) {
  const source = path.resolve(sourceDirectory), output = path.resolve(outputDirectory);
  if (output === source || output.startsWith(source + path.sep)) throw Error('Use a separate output directory');
  // Refuse to overwrite an existing deployment or unrelated files.
  await mkdir(output, { recursive: false });
  let html = await readFile(path.join(source, 'index.html'), 'utf8');
  if (!html.includes('복싱사관학교 효천본관') || !html.includes('https://sparringclub.kr/')) throw Error('Unexpected academy source');
  const bundles = [...html.matchAll(/(?:src|href)="(academy[^"/]+\.(?:css|js))"/g)].map(match => match[1]);
  if (bundles.length !== 3 || new Set(bundles).size !== 3) throw Error('Unexpected source bundles');
  html = html.replaceAll(clubOrigin + '/', academyOrigin + '/').replaceAll('href="club.html"', `href="${clubOrigin}/club.html"`);
  const routing = `const legacy=['dashboard','players','gyms','board','record','post-detail','admin-dashboard'];
const hash=location.hash.slice(1);
if(new URLSearchParams(location.search).has('postId')||legacy.includes(hash)||hash.startsWith('modal-'))location.replace('https://sparringclub.kr/club.html'+location.search+location.hash);
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
`;
  const content = new Map();
  for (const bundle of bundles) {
    let body = await readFile(path.join(source, bundle), 'utf8');
    if (bundle.startsWith('academy-routing.')) body = routing;
    else if (bundle.startsWith('academy-app.')) body = body.replaceAll('"club.html"', '"https://sparringclub.kr/club.html"');
    content.set(bundle, body);
  }
  const digest = createHash('sha256').update(html);
  for (const body of content.values()) digest.update(body);
  const version = digest.digest('hex').slice(0, 16), published = [];
  for (const [oldName, body] of content) {
    const name = oldName.replace(/\.[a-f0-9]{16}\./, '.' + version + '.');
    if (name === oldName) throw Error('Source bundle must have a content version');
    html = html.replaceAll(oldName, name);
    await writeFile(path.join(output, name), body);
    published.push(name);
  }
  await writeFile(path.join(output, 'index.html'), html);
  for (const item of ['assets', 'icon-192.png', 'icon-512.png']) await cp(path.join(source, item), path.join(output, item), { recursive: true });
  await writeFile(path.join(output, 'CNAME'), new URL(academyOrigin).hostname + '\n');
  await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /club.html\nSitemap: ${academyOrigin}/sitemap.xml\n`);
  await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${academyOrigin}/</loc></url></urlset>\n`);
  await writeFile(path.join(output, 'manifest.json'), JSON.stringify({ name: '복싱사관학교', short_name: '복싱사관학교', start_url: './', scope: './', display: 'standalone', background_color: '#171A1B', theme_color: '#171A1B', icons: [{ src: 'assets/academy-generated-v1/boxing-logo-original.png', sizes: 'any', type: 'image/png' }] }, null, 2) + '\n');
  // Preserve old links without hosting a second copy of club authentication/data code.
  await writeFile(path.join(output, 'club.html'), `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=https://sparringclub.kr/club.html"><title>스파링클럽으로 이동</title><a href="https://sparringclub.kr/club.html">스파링클럽 열기</a><script>location.replace('https://sparringclub.kr/club.html'+location.search+location.hash);</script></html>`);
  const precache = ['index.html', 'manifest.json', 'assets/pretendard-variable.woff2', 'assets/academy-generated-v1/boxing-logo-original.png', ...published];
  await writeFile(path.join(output, 'sw.js'), `const CACHE='boxingacademy-${version}',FILES=${JSON.stringify(precache)};
const base=new URL('./',self.location.href);const urls=FILES.map(p=>new URL(p,base).href);
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(urls)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==base.origin||u.search)return;
if(e.request.mode==='navigate'&&(u.pathname===base.pathname||u.href===new URL('index.html',base).href)){e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match(new URL('index.html',base).href))));return;}
if(urls.includes(u.href))e.respondWith(caches.open(CACHE).then(c=>c.match(e.request)).then(r=>r||fetch(e.request)));});\n`);
  return { output, version, bundles: published };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (process.argv.length !== 4) throw Error('Usage: node prepare.mjs <source-dist> <new-output>');
  console.log(JSON.stringify(await prepare(process.argv[2], process.argv[3])));
}
