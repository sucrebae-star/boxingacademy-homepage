import { cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(process.argv[2] || 'source');
const appPath = path.join(source, 'src/academy/App.jsx');
let app = await readFile(appPath, 'utf8');
function replaceOnce(text, from, to) {
  if (text.split(from).length !== 2) throw Error('Pinned source changed: ' + from.slice(0, 70));
  return text.replace(from, to);
}
const photoStart = app.indexOf('function Photo(');
const photoEnd = app.indexOf('function Header()', photoStart);
if (photoStart < 0 || photoEnd < 0) throw Error('Missing original photo component');
app = app.slice(0, photoStart) + app.slice(photoEnd);
app = replaceOnce(app, 'import Curriculum from "./Curriculum.jsx";', 'import Curriculum from "./Curriculum.jsx";\nimport { ResponsivePhoto as Photo } from "./ResponsivePhoto.jsx";');
const heroStart = app.indexOf('      <picture className="hero-photo">');
const heroEnd = app.indexOf('      </picture>', heroStart);
if (heroStart < 0 || heroEnd < 0) throw Error('Missing hero');
app = app.slice(0, heroStart) + '      <Photo name="hero" className="hero-photo" priority alt="코치와 함께 복싱 기본기를 배우는 단체 수업의 AI 콘셉트 사진" />\n' + app.slice(heroEnd + '      </picture>\n'.length);
const aliases = { 'philosophy.webp':'philosophy', 'program-physical.webp':'physical', 'program-boxing.webp':'boxing', 'program-kids.webp':'kids', 'morning.webp':'morning', 'first-visit.webp':'first-visit', 'reservation.webp':'reservation' };
for (const [before, after] of Object.entries(aliases)) app = app.replaceAll('"' + before + '"', '"' + after + '"');
app = app.replace('샌드백 훈련에 집중하는 복서', '코치의 안내에 따라 복싱 기본기를 배우는 AI 콘셉트 수업 장면');
// Keep the original logo and all operating/contact/booking content untouched.
await writeFile(appPath, app);
let content = await readFile(path.join(source, 'src/academy/content.mjs'), 'utf8');
for (const [before, after] of Object.entries(aliases)) content = content.replaceAll('"' + before + '"', '"' + after + '"');
await writeFile(path.join(source, 'src/academy/content.mjs'), content);
let curriculum = await readFile(path.join(source, 'src/academy/Curriculum.jsx'), 'utf8');
curriculum = replaceOnce(curriculum, "import LessonVideo from './LessonVideo.jsx';", "import LessonVideo from './LessonVideo.jsx';\nimport { CurriculumPhoto } from './ResponsivePhoto.jsx';");
const imageStart = curriculum.indexOf('            <img src={part.image}');
const imageEnd = curriculum.indexOf(' />}', imageStart);
if (imageStart < 0 || imageEnd < 0) throw Error('Missing curriculum image');
curriculum = curriculum.slice(0, imageStart) + '            <CurriculumPhoto part={{...part, alt: part.video ? `${program.name} 실제 수업 영상 미리보기` : `${program.name} ${part.title} 수업을 표현한 AI 콘셉트 이미지`}} loading={i === 0 ? \'eager\' : \'lazy\'} />}' + curriculum.slice(imageEnd + ' />}'.length);
await writeFile(path.join(source, 'src/academy/Curriculum.jsx'), curriculum);
const dataPath = path.join(source, 'src/academy/curriculum.mjs');
const data = await readFile(dataPath, 'utf8');
await writeFile(dataPath, data + `\nfor (const part of curricula['physical-training'].parts) {\n  if (part.title === '헤비백 타격') part.photoScene = 'heavy-bag';\n  if (part.title === '서킷트레이닝') part.photoScene = 'circuit';\n}\n`);
for (const file of ['ResponsivePhoto.jsx', 'photo-manifest.json']) await cp(path.join(root, 'photo-renewal', file), path.join(source, 'src/academy', file));
await cp(path.join(root, 'assets/photo-renewal-v2'), path.join(source, 'assets/photo-renewal-v2'), {recursive:true});
const cssPath = path.join(source, 'academy.css');
await writeFile(cssPath, await readFile(cssPath, 'utf8') + '\n' + await readFile(path.join(root, 'photo-renewal/photos.css'), 'utf8'));
console.log('Applied reviewed photo pairs to the isolated academy build.');
