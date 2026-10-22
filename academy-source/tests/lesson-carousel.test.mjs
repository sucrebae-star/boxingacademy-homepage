import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir, unlink} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {build} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

await mkdir('.build', {recursive: true});
const compiled = path.resolve(`.build/lesson-carousel-test-${process.pid}.mjs`);
await build({entryPoints: ['src/components/LessonCarousel.jsx'], outfile: compiled,
  bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic'});
const {default: LessonCarousel} = await import(pathToFileURL(compiled).href);
await unlink(compiled);
const parts = [
  {title: '수업 하이라이트', description: '실제 수업 영상.', image: 'first.webp', video: 'first.mp4'},
  {title: '함께하는 훈련', description: '두 번째 영상.', image: 'second.webp', video: 'second.mp4'},
  {title: '스트레칭', description: '운동 준비.', scene: 'stretch'},
];

test('basic edition exposes posters without broken video sources or hidden video controls', () => {
  globalThis.__ASSETS__ = {'first.webp': 'data:image/webp;base64,AA=='};
  const html = renderToStaticMarkup(React.createElement(LessonCarousel, {parts, program: 'test'}));
  assert.equal((html.match(/<video\b/g) || []).length, 0);
  assert.equal((html.match(/aria-hidden="true" inert=""/g) || []).length, 2);
  assert.match(html, /영상 포함본에서는 실제 수업 영상을/);
  assert.match(html, /data:image\/webp;base64,AA==/);
  assert.match(html, /aria-label="이전 운동 장면" disabled=""/);
  assert.match(html, /aria-describedby="lesson-/);
  assert.ok(!html.includes('<h3>'), 'parent supplies the course heading when title is omitted');
});

test('video edition mounts only the selected video, with an explicit playback fallback', () => {
  globalThis.__ASSETS__ = {'first.mp4': 'first-local.mp4', 'second.mp4': 'second-local.mp4'};
  const html = renderToStaticMarkup(React.createElement(LessonCarousel, {parts, program: 'test', title: '수업'}));
  assert.equal((html.match(/<video\b/g) || []).length, 1);
  assert.match(html, /src="first-local.mp4"/);
  assert.ok(!html.includes('src="second-local.mp4"'));
  assert.match(html, /aria-label="수업 하이라이트 영상 재생"/);
  assert.match(html, /controls="" muted="" loop="" playsInline="" preload="none"/);
  assert.ok(!html.includes('autoPlay'), 'autoplay is gated by visibility and reduced motion');
});

test('a single image needs no next action and an empty curriculum is harmless', () => {
  globalThis.__ASSETS__ = {};
  const html = renderToStaticMarkup(React.createElement(LessonCarousel, {parts: [parts[2]], program: 'one'}));
  assert.match(html, /aria-label="다음 운동 장면" disabled=""/);
  assert.match(html, /stretch-web.webp/); // Keep the full landscape exercise composition at every width.
  assert.match(html, /AI 콘셉트 사진/);
  assert.equal(renderToStaticMarkup(React.createElement(LessonCarousel, {parts: [], program: 'empty'})), '');
});
