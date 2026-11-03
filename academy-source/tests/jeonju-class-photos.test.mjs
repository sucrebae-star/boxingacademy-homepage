import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,statSync} from 'node:fs';import {build} from 'esbuild';import {pathToFileURL} from 'node:url';import path from 'node:path';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {classPhotos,coursePhotoIds,reconstructionCaption,classPhotoForScene} from '../src/jeonju-class-photos.mjs';import {branches,lessons} from '../src/data.mjs';
test('ten reviewed AI photos have bounded, proportional mobile/full assets',()=>{
 assert.equal(Object.keys(classPhotos).length,10);assert.deepEqual(Object.values(coursePhotoIds).map(a=>a.length),[3,4,3]);
 for(const p of Object.values(classPhotos)){assert.ok(p.scene.startsWith('assets/jeonju/'));for(const suffix of ['web','mobile'])assert.ok(statSync(p.scene+'-'+suffix+'.webp').size>10000);assert.ok(p.width<=1280);assert.equal(p.mobileWidth,640);assert.ok(Math.abs(p.mobileHeight-p.height*p.mobileWidth/p.width)<=1,'allow only one-pixel resize rounding');assert.equal(classPhotoForScene(p.scene),p);}
 const p=classPhotos['boxing-04'];assert.ok(p.height>p.width);assert.ok(p.mobileHeight>p.mobileWidth);
});
test('two actual videos remain first, every old exercise survives, new photos match each course',()=>{
 const original={'physical-training':['단체 스트레칭','뮤직복싱','헤비백 타격','서킷트레이닝','크로스핏'],'adult-boxing':['체조·스트레칭','줄넘기','도약·플라이오메트릭','쉐도우복싱','친선게임','근력·체력 서킷'],'kids-boxing':['체조·스트레칭','줄넘기','도약·플라이오메트릭','쉐도우복싱','친선게임','근력·체력 서킷']};
 for(const[id,parts]of Object.entries(lessons)){assert.ok(parts.parts[0].video);assert.ok(parts.parts[1].video);assert.deepEqual(parts.parts.filter(p=>p.reconstructedPhoto).map(p=>p.reconstructedPhoto),coursePhotoIds[id]);assert.deepEqual(parts.parts.filter(p=>!p.video&&!p.reconstructedPhoto).map(p=>p.title),original[id]);}
 assert.equal(Object.values(lessons).flatMap(p=>p.parts).filter(p=>p.video).length,6);
});
test('existing principal asset paths avoid duplicate hidden-home and branch downloads',()=>{
 assert.equal(classPhotos['boxing-02'].scene,branches.jeonju.hero);assert.equal(classPhotos['crossfit-01'].scene,branches.jeonju.programs[0].scene);assert.equal(classPhotos['boxing-03'].scene,branches.jeonju.programs[1].scene);assert.equal(classPhotos['kids-02'].scene,branches.jeonju.programs[2].scene);
 assert.ok(branches.yeoksam.hero.startsWith('assets/yeoksam/'));assert.equal(branches.jeonju.booking,'https://booking.kakao.com/detail/ticket/752726');
});
test('photo rendering includes truthful disclosure, proportional sources, and lazy detail images',async()=>{
 const target=path.resolve('.build/class-photo-component-test.mjs');await build({entryPoints:['src/components/LessonCarousel.jsx'],outfile:target,bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic'});
 const {default:Carousel}=await import(pathToFileURL(target).href);globalThis.__ASSETS__={};
 const id='boxing-04',p=classPhotos[id];const html=renderToStaticMarkup(React.createElement(Carousel,{parts:[{reconstructedPhoto:id,title:p.title,description:reconstructionCaption}],program:'photo-test'}));
 assert.ok(html.includes(reconstructionCaption));assert.ok(html.includes('width="941" height="1672"'));assert.ok(html.includes('-mobile.webp'));assert.ok(html.includes('loading="lazy"'));assert.ok(!html.includes('<video'));
 const untouched=renderToStaticMarkup(React.createElement(Carousel,{parts:lessons['adult-boxing'].parts,program:'adult-boxing'}));
 for(const id of coursePhotoIds['adult-boxing'])assert.ok(!untouched.includes(classPhotos[id].scene+'-web.webp'),'defer distant reconstructed photos until selected or adjacent');
 const css=readFileSync('src/style.css','utf8');assert.ok(css.includes('#jeonju .branch-hero .photo.class-photo img'));assert.ok(css.includes('aspect-ratio:16/9;object-fit:contain;object-position:center'));
});
