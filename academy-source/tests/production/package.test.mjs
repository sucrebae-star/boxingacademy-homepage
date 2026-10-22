import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const output=path.resolve(process.env.PRODUCTION_OUTPUT||'output-web');
const read=p=>readFileSync(path.join(output,p),'utf8');
const html=read('index.html');
const origin='https://xn--zb0bzfz85bysd8qd313b.com';
test('production ships small HTML and externally loaded photo/video assets',()=>{
 assert.ok(Buffer.byteLength(html)<300000);
 assert.ok(!html.includes('data:video/mp4;base64'));
 assert.ok(!html.includes('data:image/webp;base64'));
 const manifest=JSON.parse(read('asset-manifest.json'));
 assert.equal(manifest.mode,'production');
 assert.equal(manifest.assets.filter(p=>p.type==='video/mp4').length,6);
 for(const asset of manifest.assets)assert.ok(existsSync(path.join(output,asset.url)),asset.url);
 assert.ok(html.includes("globalThis.__SITE_MODE__='production'"));
 assert.ok(!html.includes('오프라인 시연본'));
 assert.ok(!html.includes('배포되지 않은 시연본'));
});
test('official domain owns SEO and homepage install identity',()=>{
 assert.equal(read('CNAME').trim(),new URL(origin).hostname);
 assert.ok(html.includes(`rel="canonical" href="${origin}/"`));
 assert.ok(html.includes(`property="og:url" content="${origin}/"`));
 assert.ok(html.includes('application/ld+json'));
 assert.ok(read('sitemap.xml').includes(origin+'/'));
 assert.ok(!read('sitemap.xml').includes('club.html'));
 const manifest=JSON.parse(read('manifest.json'));
 assert.equal(manifest.name,'복싱사관학교');assert.equal(manifest.start_url,'./');
 assert.deepEqual(manifest.icons.map(icon=>icon.sizes),['192x192','512x512']);
 assert.ok(manifest.icons.every(icon=>existsSync(path.join(output,icon.src))));
});
test('new and legacy links retain the correct academy or club destination',()=>{
 const routeName=html.match(/src="(academy-v2-routing\.[^"]+)"/)[1];
 const routing=read(routeName);
 for(const [search,hash,wantedClub,wantedHash] of [
  ['?postId=9','#board','https://sparringclub.kr/club.html?postId=9#board',undefined],
  ['','#players','https://sparringclub.kr/club.html#players',undefined],
  ['','#programs',undefined,'/#jeonju/programs'],
  ['','#reservation',undefined,'/#jeonju/visit'],
  ['','#yeoksam/programs',undefined,undefined],
  ['','#home',undefined,undefined]
 ]){let club,rewritten;vm.runInNewContext(routing,{location:{search,hash,pathname:'/',replace:v=>club=v},history:{replaceState:(a,b,v)=>rewritten=v},navigator:{},URLSearchParams});assert.equal(club,wantedClub);assert.equal(rewritten,wantedHash);}
 assert.ok(html.includes('https://sparringclub.kr/club.html'));
 assert.ok(html.includes('https://booking.kakao.com/detail/ticket/752726'));
 assert.ok(html.includes('https://m.place.naver.com/place/2024734294/ticket'));
 assert.ok(read('club.html').includes("location.search+location.hash"));
 assert.ok(!read('club.html').includes('firebase'));
});
test('worker caches homepage shell only and removes only superseded academy caches',async()=>{
 const callbacks={};let cached;const deleted=[];
 vm.runInNewContext(read('sw.js'),{self:{location:{href:origin+'/sw.js'},addEventListener:(k,v)=>callbacks[k]=v,skipWaiting(){},clients:{claim(){}}},URL,caches:{open:async()=>({addAll:async urls=>{cached=urls}}),keys:async()=>['boxingacademy-old','unrelated-app'],delete:async k=>deleted.push(k)}});
 let install;callbacks.install({waitUntil:p=>install=p});await install;
 assert.ok(cached.every(u=>u.startsWith(origin+'/')));
 assert.ok(!cached.some(u=>/\.mp4|club|api\//.test(u.replace(origin,''))));
 let activate;callbacks.activate({waitUntil:p=>activate=p});await activate;
 assert.deepEqual(deleted,['boxingacademy-old']);
 for(const url of [origin+'/club.html',origin+'/api/private',origin+'/?postId=9','https://sparringclub.kr/club.html'])callbacks.fetch({request:{method:'GET',url,mode:'navigate'},respondWith(){throw Error('must not intercept club/private requests')}});
});
