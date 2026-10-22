import {readFile,writeFile,mkdir,readdir,cp} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import {branches} from './src/data.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));process.chdir(root);
const production=process.argv.includes('--production');
const outFlag=process.argv.indexOf('--out');
const output=path.resolve(outFlag>=0?process.argv[outFlag+1]:(production?'output-web':'output'));
if(output===root||output===path.dirname(root)||output.startsWith(path.join(root,'src')+path.sep)||output===path.join(root,'assets'))throw Error('Use a separate build output directory');
await mkdir(output,{recursive:true});await mkdir('.build',{recursive:true});
const types={'.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.mp4':'video/mp4'};
async function assetPaths(dir){let result=[];for(const d of await readdir(dir,{withFileTypes:true})){const p=path.posix.join(dir,d.name);result.push(...(d.isDirectory()?await assetPaths(p):[p]));}return result;}
const files=(await assetPaths('assets')).filter(p=>types[path.extname(p)]);
const data={};const assetHash=createHash('sha256');
for(const p of files){const bytes=await readFile(p);assetHash.update(p).update(bytes);if(!production)data[p]=`data:${types[path.extname(p)]};base64,${bytes.toString('base64')}`;}
const assetVersion=assetHash.digest('hex').slice(0,16);
if(production)for(const p of files){data[p]=`assets/site-${assetVersion}/${p.slice(7)}`;await mkdir(path.dirname(path.join(output,data[p])),{recursive:true});await cp(p,path.join(output,data[p]));}
const cssInput=(await readFile('src/style.css','utf8')).replace("url('../assets/pretendard-variable.woff2')",`url('${data['assets/pretendard-variable.woff2']}')`);
const css=(await postcss([tailwind({optimize:true})]).process(cssInput,{from:path.resolve('src/style.css')})).css;
const script=(await build({absWorkingDir:root,entryPoints:['src/client.jsx'],bundle:true,minify:true,write:false,format:'iife',platform:'browser',target:['es2020'],jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},legalComments:'none'})).outputFiles[0].text;
await build({absWorkingDir:root,entryPoints:['src/render.jsx'],bundle:true,outfile:'.build/render.mjs',platform:'node',format:'esm',packages:'external',jsx:'automatic'});
const renderAssets={...data};if(!production)for(const p of files)if(p.endsWith('.mp4'))delete renderAssets[p];globalThis.__ASSETS__=renderAssets;globalThis.__SITE_MODE__=production?'production':'offline';
const {render}=await import('./.build/render.mjs?'+Date.now());const markup=render();
const notices=(await readFile('THIRD-PARTY-NOTICES.txt','utf8')).replaceAll('</script','<\\/script');
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fallback=Object.entries(branches).map(([id,b])=>`<section style="padding:40px"><h2>${esc(b.official)}</h2><p>${esc(b.description)}</p><p>${esc(b.address)} / ${esc(b.phone)}</p><h3>운영시간</h3>${b.hours.map(row=>`<p>${row.map(esc).join(' · ')}</p>`).join('')}<h3>이용요금</h3>${b.prices.map(row=>`<p>${row.map(esc).join(' · ')}</p>`).join('')}<p><a href="${b.booking}" target="_blank" rel="noopener noreferrer">상담예약 (인터넷 필요)</a></p></section>`).join('');
if(production){
 const origin='https://xn--zb0bzfz85bysd8qd313b.com';
 const routing=`const clubHashes=['dashboard','players','gyms','board','record','post-detail','admin-dashboard'];
const hash=location.hash.slice(1);if(new URLSearchParams(location.search).has('postId')||clubHashes.includes(hash)||hash.startsWith('modal-'))location.replace('https://sparringclub.kr/club.html'+location.search+location.hash);
const academyAliases={about:'about',programs:'programs',schedule:'guide',space:'visit',guide:'guide',reservation:'visit',pricing:'pricing'};
if(academyAliases[hash])history.replaceState(null,'',location.pathname+location.search+'#jeonju/'+academyAliases[hash]);
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));`;
 const version=createHash('sha256').update(css).update(script).update(markup).update(routing).update(assetVersion).digest('hex').slice(0,16);
 const cssName=`academy-v2.${version}.css`,appName=`academy-v2-app.${version}.js`,routeName=`academy-v2-routing.${version}.js`;
 await Promise.all([writeFile(path.join(output,cssName),css),writeFile(path.join(output,appName),script),writeFile(path.join(output,routeName),routing)]);
 const title='복싱사관학교 | 역삼본점 · 전주효천관';
 const description='서울 역삼과 전주 효천에서 나에게 맞는 복싱을 시작하세요. 지점별 프로그램, 수업 시간과 이용요금을 확인하고 상담을 예약할 수 있습니다.';
 const hero=new URL(data['assets/jeonju/01-hero-web.webp'],origin+'/').href;
 const structured={"@context":"https://schema.org","@type":"Organization",name:'복싱사관학교',url:origin+'/',logo:new URL(data['assets/logo.png'],origin+'/').href,department:Object.values(branches).map(b=>({'@type':'SportsActivityLocation',name:b.official,address:b.address,telephone:b.phone,url:b.place}))};
 const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="light"><meta name="theme-color" content="#171A1B"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${origin}/"><meta property="og:type" content="website"><meta property="og:locale" content="ko_KR"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${origin}/"><meta property="og:image" content="${hero}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${data['assets/logo.png']}"><link rel="manifest" href="manifest.json"><link rel="stylesheet" href="${cssName}"><script type="application/ld+json">${JSON.stringify(structured).replaceAll('<','\\u003c')}</script><script src="${routeName}" defer></script></head><body><script type="text/plain" id="third-party-notices">${notices}</script><div id="root">${markup}</div><noscript><div class="shell"><p>자바스크립트가 꺼져 있어 전체 지점 정보를 아래에 표시합니다.</p>${fallback}</div></noscript><script>globalThis.__SITE_MODE__='production';globalThis.__ASSETS__=${JSON.stringify(data).replaceAll('<','\\u003c')};</script><script src="${appName}" defer></script></body></html>`;
 await writeFile(path.join(output,'index.html'),html);
 await writeFile(path.join(output,'CNAME'),new URL(origin).hostname+'\n');
 await writeFile(path.join(output,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /club.html\nSitemap: ${origin}/sitemap.xml\n`);
 await writeFile(path.join(output,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`);
 await writeFile(path.join(output,'manifest.json'),JSON.stringify({name:'복싱사관학교',short_name:'복싱사관학교',start_url:'./',scope:'./',display:'standalone',background_color:'#171A1B',theme_color:'#171A1B',icons:[{src:data['assets/icon-192.png'],sizes:'192x192',type:'image/png',purpose:'any'},{src:data['assets/icon-512.png'],sizes:'512x512',type:'image/png',purpose:'any'}]},null,2));
 await writeFile(path.join(output,'club.html'),`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=https://sparringclub.kr/club.html"><title>스파링클럽으로 이동</title></head><body><a href="https://sparringclub.kr/club.html">스파링클럽 열기</a><script>location.replace('https://sparringclub.kr/club.html'+location.search+location.hash);</script></body></html>`);
 const precache=['index.html','manifest.json',cssName,appName,routeName,data['assets/logo.png'],data['assets/icon-192.png'],data['assets/icon-512.png'],data['assets/pretendard-variable.woff2']];
 const worker=`const CACHE='boxingacademy-v2-${version}',FILES=${JSON.stringify(precache)};const base=new URL('./',self.location.href);const urls=FILES.map(p=>new URL(p,base).href);
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(urls)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('boxingacademy-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==base.origin||u.search)return;
if(e.request.mode==='navigate'&&(u.pathname===base.pathname||u.href===new URL('index.html',base).href)){e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match(new URL('index.html',base).href))));return;}
if(urls.includes(u.href))e.respondWith(caches.open(CACHE).then(c=>c.match(e.request)).then(r=>r||fetch(e.request)));});`;
 await writeFile(path.join(output,'sw.js'),worker);
 await writeFile(path.join(output,'asset-manifest.json'),JSON.stringify({version,assetVersion,mode:'production',assets:files.map(p=>({source:p,url:data[p],type:types[path.extname(p)]}))},null,2));
 console.log(JSON.stringify({output,mode:'production',htmlBytes:Buffer.byteLength(html),version,assets:files.length}));
}else{
 for(const [name,includeVideo] of [['index.html',false],['index-with-videos.html',true]]){const a=includeVideo?data:renderAssets;const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="light"><link rel="icon" href="${data['assets/logo.png']}"><title>복싱사관학교 · 지점 선택 | 오프라인 시연본</title><meta name="description" content="복싱사관학교 역삼본점·전주효천관을 살펴보는 오프라인 디자인 시연본"><style>${css}</style></head><body><script type="text/plain" id="third-party-notices">${notices}</script><div id="root">${markup}</div><noscript><div class="shell"><p>자바스크립트가 꺼져 있어 전체 지점 정보를 아래에 표시합니다.</p>${fallback}</div></noscript><script>globalThis.__SITE_MODE__='offline';<\/script><script>globalThis.__ASSETS__=${JSON.stringify(a).replaceAll('<','\\u003c')};<\/script><script>${script.replaceAll('</script','<\\/script')}<\/script></body></html>`;await writeFile(path.join(output,name),html);console.log(name,(Buffer.byteLength(html)/1048576).toFixed(1)+' MiB');}
 await writeFile('docs/asset-manifest.json',JSON.stringify(files.map(p=>({path:p,type:types[path.extname(p)],embedded:true})),null,2));
}
