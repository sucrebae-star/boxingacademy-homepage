import {readFile,writeFile,mkdir,copyFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const ORIGIN='https://xn--zb0bzfz85bysd8qd313b.com/';
const assetPath=p=>typeof p==='string'&&/^assets\/site-[a-f0-9]{16}\/[a-zA-Z0-9/._-]+$/.test(p)&&!p.includes('..');
const sourcePath=p=>typeof p==='string'&&/^assets\/[a-zA-Z0-9/._-]+$/.test(p)&&!p.includes('..');
const bundlePath=p=>typeof p==='string'&&/^academy-v2(?:-app|-routing)?\.[a-f0-9]{16}\.(?:js|css)$/.test(p);
export async function preservePreviousAssets({output,source='academy-source',origin=ORIGIN,fetcher=fetch}) {
 output=resolve(output);source=resolve(source);
 async function remote(name,optional=false) {
  const response=await fetcher(new URL(name,origin),{signal:AbortSignal.timeout(20000)});
  if(optional&&response.status===404)return null;
  if(!response.ok)throw Error('Cannot preserve published asset: '+name+' HTTP '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>64000000)throw Error('Asset exceeds preservation size limit');return bytes;
 }
 const manifest=JSON.parse((await remote('asset-manifest.json')).toString());
 const liveHtml=(await remote('index.html')).toString();
 const bundles=[...new Set([...liveHtml.matchAll(/(?:src|href)="(academy-v2[^"/]+)"/g)].map(m=>m[1]))];
 if(!/^[a-f0-9]{16}$/.test(manifest.version)||!bundles.length||!bundles.every(bundlePath)||!manifest.assets?.every(a=>assetPath(a.url)&&sourcePath(a.source)))throw Error('Unexpected published asset manifest');
 const old=await remote('asset-history.json',true);
 const prior=old?JSON.parse(old.toString()).releases||[]:[];
 const releases=[{version:manifest.version,assetVersion:manifest.assetVersion,bundles,assets:manifest.assets},...prior.filter(r=>r.version!==manifest.version)].slice(0,2);
 let reused=0,downloaded=0;
 for(const release of releases) {
  if(!/^[a-f0-9]{16}$/.test(release.version)||!release.bundles?.every(bundlePath)||!release.assets?.every(a=>assetPath(a.url)&&sourcePath(a.source)))throw Error('Unsafe historical asset path');
  const hash=createHash('sha256');let reusable=true;
  try{for(const a of release.assets)hash.update(a.source).update(await readFile(resolve(source,a.source)));reusable=hash.digest('hex').slice(0,16)===release.assetVersion;}catch{reusable=false;}
  for(const name of [...release.bundles,...release.assets.map(a=>a.url)]) {
   const destination=resolve(output,name);try{await access(destination);continue;}catch{}
   await mkdir(dirname(destination),{recursive:true});const a=release.assets.find(a=>a.url===name);
   if(a&&reusable){await copyFile(resolve(source,a.source),destination);reused++;}
   else{await writeFile(destination,await remote(name));downloaded++;}
  }
 }
 await writeFile(resolve(output,'asset-history.json'),JSON.stringify({releases},null,2));
 return {preservedVersions:releases.map(r=>r.version),reused,downloaded};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const i=process.argv.indexOf('--out');if(i<0)throw Error('--out is required');console.log(JSON.stringify(await preservePreviousAssets({output:process.argv[i+1]})));}
