import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRoute} from '../src/navigation.mjs';

test('existing homepage section links still reach Jeonju', () => {
  assert.deepEqual(parseRoute('#programs'), {page:'jeonju',section:'programs'});
  assert.deepEqual(parseRoute('#reservation'), {page:'jeonju',section:'visit'});
  assert.deepEqual(parseRoute('#schedule'), {page:'jeonju',section:'guide'});
});
test('branch section links cannot cross routes or navigate to arbitrary element ids', () => {
  assert.deepEqual(parseRoute('#yeoksam/pricing'), {page:'yeoksam',section:'pricing'});
  assert.deepEqual(parseRoute('#collaboration/pricing'), {page:'collaboration',section:null});
  assert.deepEqual(parseRoute('#jeonju/unknown'), {page:'jeonju',section:null});
  assert.deepEqual(parseRoute('#home'), {page:'home',section:null});
});
