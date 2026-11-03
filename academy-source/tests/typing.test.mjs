import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseParentGuide,isMobileDownloadClient,typingRelease,windowsTrialRelease} from '../src/parent-guide.mjs';
import {parseRoute} from '../src/navigation.mjs';
const raw=readFileSync('src/content/parent-guide.md','utf8');
test('approved parent guide retains all eight folds, summaries, table and full story',()=>{
 const g=parseParentGuide(raw);assert.equal(g.folds.length,8);assert.equal(g.title,'주먹만큼 단단한 손가락을 위해');
 assert.equal(g.button,'타이핑사관학교 시작하기');assert.ok(g.folds.every(f=>f.title&&f.summary&&f.detail));
 assert.ok(g.folds[1].detail.includes('1~2시간'));assert.ok(g.folds[6].detail.includes('| 날짜 | 활동 |'));
 assert.ok(g.folds[3].detail.includes('모래처럼 중력의 영향을 받는 블록과 그렇지 않은 블록의 차이를 관찰합니다.'));
 assert.ok(!raw.includes('구조물은 받침이 있어야 버팁니다.'));
 for(const i of [3,7])assert.equal((g.folds[i].detail.match(/^\d+\. /gm)||[]).length,8);
});
test('typing-only anchors do not leak the route onto another branch',()=>{
 assert.deepEqual(parseRoute('#jeonju/typing'),{page:'jeonju',section:'typing'});
 assert.deepEqual(parseRoute('#yeoksam/typing'),{page:'yeoksam',section:null});
 assert.deepEqual(parseRoute('#jeonju/record'),{page:'jeonju',section:'record'});
 assert.deepEqual(parseRoute('#yeoksam/record'),{page:'yeoksam',section:null});
 assert.deepEqual(parseRoute('#record'),{page:'home',section:null});
 for(let i=1;i<=8;i++)assert.deepEqual(parseRoute('#guide-'+i),{page:'jeonju',section:'typing',anchor:'guide-'+i});
 assert.deepEqual(parseRoute('#typing-download'),{page:'jeonju',section:'typing',anchor:'typing-download'});
});
test('phone and tablet downloads are denied without treating a narrow desktop as a phone',()=>{
 for(const client of [{userAgent:'Mozilla iPhone'},{userAgent:'Mozilla Android'},{userAgent:'Mozilla iPad'},{platform:'MacIntel',maxTouchPoints:5},{platform:'Linux armv8l',maxTouchPoints:5},{userAgentData:{mobile:true}},{userAgentData:{platform:'Android'}}])assert.equal(isMobileDownloadClient(client),true,JSON.stringify(client));
 for(const client of [{userAgent:'Macintosh Intel Mac OS X',platform:'MacIntel',maxTouchPoints:0},{userAgent:'Windows NT 10.0',platform:'Win32',maxTouchPoints:10},{userAgent:'Linux x86_64',platform:'Linux x86_64',maxTouchPoints:0},{}])assert.equal(isMobileDownloadClient(client),false,JSON.stringify(client));
 assert.equal(new URL(typingRelease.url).hostname,'github.com');assert.equal(typingRelease.bytes,32163875);
});
test('GitHub mirrors preserve the original complete offline installer and safe fallback',()=>{
 assert.equal(windowsTrialRelease.bytes,248678385);
 assert.equal(windowsTrialRelease.sha256,'4abe117bec0bba6aecd427052fea5c4abcc5f446b3de2f78d1f64deb3520125c');
 for(const release of [typingRelease,windowsTrialRelease]){
  assert.ok(release.url.startsWith('https://github.com/sucrebae-star/boxingacademy-homepage/releases/download/typing-academy-v0.1.8-downloads/'));
  assert.equal(new URL(release.fallbackUrl).hostname,'app.boxingacademy.pe.kr');
  assert.ok(!release.url.includes('light-setup'));
 }
});
