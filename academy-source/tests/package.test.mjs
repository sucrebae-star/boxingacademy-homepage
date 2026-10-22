import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {branches,lessons} from '../src/data.mjs';
const html=readFileSync('output/index.html','utf8');
const assetText=html.split('<script>globalThis.__ASSETS__=')[1].split(';</script>')[0];
const assets=JSON.parse(assetText);
test('standalone file embeds every photograph, font and official logo',()=>{
 for(const [p,v] of Object.entries(assets)){assert.ok(/^data:(image\/webp|image\/png|font\/woff2);base64,/.test(v),p);const bytes=Buffer.from(v.split(',')[1],'base64');assert.equal(createHash('sha256').update(bytes).digest('hex'),createHash('sha256').update(readFileSync(p)).digest('hex'),p);}
 assert.ok(assets['assets/logo.png']);assert.ok(assets['assets/pretendard-variable.woff2']);
 for(const m of html.matchAll(/<(?:img|source|script|link)\b[^>]*\s(?:src|srcset|href)="([^"]+)"/g))assert.ok(m[1].startsWith('data:'),m[0].slice(0,100));
 assert.ok(!/navigator\.serviceWorker|firebase|googletagmanager\.com/.test(html));
});
test('the video edition includes exactly the six original class videos',()=>{
 const all=readFileSync('output/index-with-videos.html','utf8');const data=JSON.parse(all.split('<script>globalThis.__ASSETS__=')[1].split(';</script>')[0]);const videos=Object.entries(data).filter(([p])=>p.endsWith('.mp4'));assert.equal(videos.length,6);
 for(const [p,v] of videos){assert.ok(v.startsWith('data:video/mp4;base64,'));const hash=b=>createHash('sha256').update(b).digest('hex');assert.equal(hash(Buffer.from(v.split(',')[1],'base64')),hash(readFileSync(p)));}
});
test('branch data keeps pricing, phone and reservation destinations independent',()=>{
 assert.equal(branches.yeoksam.phone,'0507-1494-2783');assert.equal(branches.jeonju.phone,'063-717-6433');assert.notEqual(branches.yeoksam.booking,branches.jeonju.booking);assert.ok(branches.yeoksam.booking.includes('2024734294'));assert.ok(branches.jeonju.booking.includes('752726'));assert.ok(branches.yeoksam.prices.some(r=>r.includes('전화 문의')));assert.ok(branches.jeonju.prices.some(r=>r.includes('200,000원')));
 assert.equal(Object.values(lessons).flatMap(p=>p.parts).filter(p=>!p.video).length,17);
});
test('all new Yeoksam scenes have independently composed mobile and desktop assets',()=>{
 for(const scene of ['hero','mitt','bag','conditioning'])for(const mode of ['web','mobile'])assert.ok(existsSync(`assets/yeoksam/${scene}-${mode}.webp`));
 assert.equal((html.match(/<div\b[^>]*data-page="/g)||[]).length,4);assert.ok(html.includes('<noscript>'));assert.ok(!html.includes('피지컬사관학교'));
});
