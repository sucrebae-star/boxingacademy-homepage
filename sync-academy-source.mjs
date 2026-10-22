import {cp,mkdir,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const repo=path.dirname(fileURLToPath(import.meta.url));
const source=path.resolve(process.argv[2]||'../offline-academy-preview');
const target=path.join(repo,'academy-source');
if(source===target)throw Error('Source must be the editable preview project');
const copied=[];
async function copyFile(rel){const from=path.join(source,rel),to=path.join(target,rel);await stat(from);await mkdir(path.dirname(to),{recursive:true});await cp(from,to);copied.push(rel);}
async function copyAllowed(dir,allowed){for(const item of await readdir(path.join(source,dir),{withFileTypes:true})){const rel=path.posix.join(dir,item.name);if(item.isDirectory())await copyAllowed(rel,allowed);else if(allowed.has(path.extname(item.name)))await copyFile(rel);}}
for(const file of ['package.json','package-lock.json','build.mjs','THIRD-PARTY-NOTICES.txt','docs/korea-geography.json'])await copyFile(file);
await copyAllowed('src',new Set(['.jsx','.js','.mjs','.css','.json']));
await copyAllowed('tests',new Set(['.jsx','.js','.mjs','.json']));
await copyAllowed('assets',new Set(['.webp','.png','.woff2','.mp4']));
console.log(JSON.stringify({target,files:copied.length,excluded:'research documents, reference photos, original generations, screenshots, audit reports, node_modules, local output files'}));
