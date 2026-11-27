import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

test('press article is accurately attributed and single article has no empty carousel controls', async()=>{
  const outfile=path.resolve('.build/press-carousel-test.mjs');
  await build({entryPoints:['src/components/PressCarousel.jsx'],bundle:true,platform:'node',format:'esm',external:['react'],outfile});
  const {default:PressCarousel}=await import(pathToFileURL(outfile).href);
  const html=renderToStaticMarkup(React.createElement(PressCarousel));
  assert.ok(html.includes('베스트타임즈 · 2026.11.27'));
  assert.ok(html.includes('2026 완산구 우수 복싱장으로 선정'));
  assert.ok(html.includes('href="https://www.besttimes.co.kr/17553"'));
  assert.ok(!html.includes('aria-label="다음 기사"'));
  assert.ok(!html.includes('aria-label="이전 기사"'));
  assert.match(readFileSync('src/App.jsx','utf8'),/\{isJeonju&&<PressCarousel\/>\}/);
});
