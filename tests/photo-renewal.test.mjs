import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(readFileSync('photo-renewal/photo-manifest.json'));
const html=readFileSync('public/index.html','utf8');
test('all 20 reviewed responsive photo assets ship without corruption',()=>{
 assert.equal(Object.keys(manifest.scenes).length,10);
 for(const scene of Object.values(manifest.scenes))for(const variant of ['web','mobile']){
  const item=scene[variant],bytes=readFileSync('public/'+item.src);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
  assert.ok(item.bytes<400000);assert.ok(item.width>900);assert.ok(item.height>900);
 }
});
test('static homepage selects all eight responsive pairs and discloses concept photography',()=>{
 assert.equal((html.match(/data-photo-scene=/g)||[]).length,8);
 assert.equal((html.match(/<source media="\(max-width: 700px\)"/g)||[]).length,8);
 assert.ok(html.includes('AI 콘셉트'));assert.ok(html.includes('실제 수업'));
 for(const scene of ['hero','philosophy','physical','boxing','kids','morning','first-visit','reservation'])assert.ok(html.includes(`data-photo-scene="${scene}"`));
});
