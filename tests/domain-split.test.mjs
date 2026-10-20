import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const output=path.resolve(process.env.ACADEMY_OUTPUT || 'public');
const read=name=>readFileSync(path.join(output,name),'utf8');
const html=read('index.html');
const origin='https://xn--zb0bzfz85bysd8qd313b.com';
test('new domain owns canonical, sharing, sitemap and homepage installation only',()=>{
  assert.equal(read('CNAME').trim(),new URL(origin).hostname);
  assert.ok(html.includes(`rel="canonical" href="${origin}/"`));
  assert.ok(html.includes(`property="og:url" content="${origin}/"`));
  assert.ok(read('sitemap.xml').includes(origin+'/'));
  assert.ok(!read('sitemap.xml').includes('club.html'));
  assert.ok(read('robots.txt').includes(origin+'/sitemap.xml'));
  const manifest=JSON.parse(read('manifest.json'));
  assert.equal(manifest.name,'복싱사관학교');assert.equal(manifest.start_url,'./');
});
test('booking, contact, academy sections and source photos remain intact',()=>{
  assert.ok((html.match(/https:\/\/booking.kakao.com\/detail\/ticket\/752726/g)||[]).length>=4);
  assert.ok(html.includes('tel:0637176433'));
  for(const id of ['about','programs','schedule','space','guide','reservation'])assert.ok(html.includes(`id="${id}"`));
  for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const url=match[1];if(/^[a-z]+:/.test(url)||url==='./')continue;
    assert.ok(existsSync(path.join(output,url)),url);
  }
});
test('club navigation goes to the original domain, never a duplicate Firebase app',()=>{
  assert.ok((html.match(/href="https:\/\/sparringclub.kr\/club.html"/g)||[]).length>=3);
  assert.ok(!html.includes('href="club.html"'));
  assert.ok(!read('club.html').includes('firebase'));
  assert.ok(!existsSync(path.join(output,'booking-admin.html')));
  const app=html.match(/src="(academy-app\.[^"]+)"/)[1];
  assert.ok(read(app).includes('"https://sparringclub.kr/club.html"'));
  assert.ok(!read(app).includes('"club.html"'));
});
test('shared club links retain query/hash; installed academy stays on academy',()=>{
  const routing=read(html.match(/src="(academy-routing\.[^"]+)"/)[1]);
  for(const [search,hash,wanted] of [['?postId=9','#board','https://sparringclub.kr/club.html?postId=9#board'],['','#players','https://sparringclub.kr/club.html#players'],['','#programs',undefined]]){
    let result;vm.runInNewContext(routing,{location:{search,hash,replace:v=>result=v},navigator:{},URLSearchParams});assert.equal(result,wanted);
  }
  assert.ok(!routing.includes('display-mode'));
});
test('service worker caches only its public homepage and never private/club APIs',()=>{
  const callbacks={};let urls;
  const worker=read('sw.js');
  vm.runInNewContext(worker,{self:{location:{href:origin+'/sw.js'},addEventListener:(k,v)=>callbacks[k]=v,skipWaiting(){},clients:{claim(){}}},URL,caches:{open:async()=>({addAll:async v=>{urls=v}})}});
  return new Promise(resolve=>callbacks.install({waitUntil:async p=>{await p;resolve()}})).then(()=>{
    assert.ok(urls.every(u=>u.startsWith(origin+'/')));
    assert.ok(!urls.some(u=>/club|api\//.test(u.replace(origin,''))));
    for(const url of [origin+'/club.html',origin+'/api/private','https://sparringclub.kr/club.html'])callbacks.fetch({request:{method:'GET',url,mode:'navigate'},respondWith(){throw Error('must not intercept club/private requests')}});
  });
});
