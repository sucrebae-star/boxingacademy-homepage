import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,statSync} from 'node:fs';import {createHash} from 'node:crypto';import path from 'node:path';
const out=path.resolve(process.env.PRODUCTION_OUTPUT||'output-web');
test('all twenty approved responsive photo assets deploy byte-identically',()=>{
 const expected=JSON.parse(readFileSync('docs/jeonju-class-photos.json','utf8'));
 const manifest=JSON.parse(readFileSync(path.join(out,'asset-manifest.json'),'utf8'));
 assert.equal(expected.assets.length,20);
 for(const item of expected.assets){const deployed=manifest.assets.find(a=>a.source===item.path);assert.ok(deployed,item.path);const bytes=readFileSync(path.join(out,deployed.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256,item.path);assert.equal(statSync(path.join(out,deployed.url)).size,item.bytes);}
 assert.ok(expected.caption.includes('AI 재구성'));
});
