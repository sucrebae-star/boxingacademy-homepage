import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.RECORD_SITE_BASE||'http://127.0.0.1:4829/output-web/';
const target=new URL('record-system.html',base).href;
const out='.taste-skill/record-integrated';await mkdir(out,{recursive:true});
const report={url:target,errors:[],layouts:[],metrics:{},checks:[]};
const browser=await chromium.launch();
const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',serviceWorkers:'block'});
const p=await ctx.newPage();p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});
try {
 for(const suffix of ['','typing-academy.html','record-system.html']){
  const c=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',serviceWorkers:'block'});const page=await c.newPage(),responses=[];
  page.on('response',r=>responses.push(r));await page.goto(new URL(suffix,base).href);await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
  const rows=await Promise.all(responses.map(async r=>({url:r.url(),status:r.status(),bytes:(await r.body()).length})));
  report.metrics[suffix||'home']={requests:rows.length,bytes:rows.reduce((n,r)=>n+r.bytes,0),api:rows.filter(r=>/\/api\//.test(r.url)).length,recordAssets:rows.filter(r=>r.url.includes('/record-system/')).length,timing:await page.evaluate(()=>({dcl:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime}))};
  assert.equal(report.metrics[suffix||'home'].api,0);if(suffix!=='record-system.html')assert.equal(report.metrics[suffix||'home'].recordAssets,0);
  assert.deepEqual(rows.filter(r=>r.status>=400),[]);await c.close();
 }
 for(const width of [320,360,390,768,1440]){
  await p.setViewportSize({width,height:width<=390?844:1000});await p.goto(target);await p.locator('.record-system').waitFor();
  await p.waitForFunction(()=>document.activeElement?.tagName==='H1'&&document.activeElement?.closest('.record-system'));
  await p.evaluate(async()=>{await document.fonts.ready;for(const i of document.querySelectorAll('.record-system img')){i.loading='eager';await i.decode()}});
  const l=await p.evaluate(()=>({width:innerWidth,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),badTitles:[...document.querySelectorAll('.record-system h1,.record-system h2,.record-system h3')].filter(e=>e.getBoundingClientRect().height&&e.getBoundingClientRect().height/parseFloat(getComputedStyle(e).lineHeight)>2.1).map(e=>e.textContent),broken:[...document.querySelectorAll('.record-system img')].filter(i=>!i.naturalWidth).length,stores:[...document.querySelectorAll('.rs-store-badges a')].map(a=>({href:a.href,bottom:a.getBoundingClientRect().bottom})),activeNavVisible:[...document.querySelectorAll('.branch-tools a')].every(a=>{const r=a.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1}),current:document.querySelector('.branch-tools [aria-current]')?.textContent,weight:[...document.querySelectorAll('.branch-tools a')].map(a=>getComputedStyle(a).fontWeight)}));
  assert.equal(l.overflow,0);assert.deepEqual(l.badTitles,[]);assert.equal(l.broken,0);assert.equal(l.stores.length,2);assert.ok(l.stores.every(s=>s.bottom<(width<=390?844:1000)));assert.equal(l.activeNavVisible,true);assert.equal(l.current,'기록시스템');assert.deepEqual(l.weight,['800','800']);report.layouts.push(l);
  await p.screenshot({path:out+'/record-'+width+'.png',fullPage:true});
 }
 const tabs=p.getByRole('tablist',{name:'기록시스템 화면 살펴보기'});await tabs.getByRole('tab',{name:/달력/}).focus();await p.keyboard.press('End');assert.equal(await tabs.getByRole('tab',{name:/달리기 요약/}).getAttribute('aria-selected'),'true');await p.keyboard.press('Home');await p.keyboard.press('ArrowDown');assert.equal(await tabs.getByRole('tab',{name:/운동 상세/}).getAttribute('aria-selected'),'true');
 const zoom=p.getByRole('button',{name:'운동 상세 예시 화면 크게 보기'});await zoom.click();assert.equal(await p.locator('.rs-image-dialog').evaluate(e=>e.open),true);await p.keyboard.press('Escape');assert.equal(await p.locator('.rs-image-dialog').evaluate(e=>e.open),false);assert.equal(await zoom.evaluate(e=>e===document.activeElement),true);
 for(const label of ['Android','iPhone','둘 다']){await p.getByRole('radio',{name:label,exact:true}).check();assert.ok((await p.locator('.rs-health-note').innerText()).length>30);assert.equal(await p.locator('.rs-download-option .button').count(),2)}
 assert.equal(await p.locator('.rs-faq a').getAttribute('href'),'https://app.boxingacademy.pe.kr/record.html');
 await p.getByText('건강 앱을 꼭 연결해야 하나요?',{exact:true}).click();assert.ok((await p.locator('.rs-faq details[open]').innerText()).includes('심박수·칼로리·GPS 경로는 가져오지 않습니다'));
 report.checks.push('Four-screen keyboard tabs, native dialog/Escape/focus, all three device choices, health FAQ and old web link');
 await p.goto(new URL('#jeonju/record',base).href);await p.locator('.record-system').waitFor();await p.locator('.branch-tools').getByRole('link',{name:'타이핑사관학교',exact:true}).click();await p.locator('.typing-academy').waitFor();await p.locator('.branch-tools').getByRole('link',{name:'기록시스템',exact:true}).click();await p.locator('.record-system').waitFor();await p.goBack();await p.locator('.typing-academy').waitFor();await p.goForward();await p.locator('.record-system').waitFor();
 await p.goto(new URL('#collaboration',base).href);await p.locator('#proposal').fill('Record 연결 후에도 보존할 임시 문의');await p.locator('.desktop-nav').getByRole('link',{name:'전주효천관',exact:true}).click();await p.locator('.branch-tools').getByRole('link',{name:'기록시스템',exact:true}).click();await p.locator('.record-system').waitFor();await p.locator('.desktop-nav').getByRole('link',{name:'협업문의',exact:true}).click();assert.equal(await p.locator('#proposal').inputValue(),'Record 연결 후에도 보존할 임시 문의');
 report.checks.push('Direct SSR/hash route, Typing/Record transitions, back/forward and in-memory collaboration draft preserved');
 const phone=await browser.newContext({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',isMobile:true,hasTouch:true,serviceWorkers:'block'});const fp=await phone.newPage();await fp.goto(target);assert.equal(await fp.locator('.rs-store-badges a[href^="https://apps.apple.com/"]').count(),1);assert.equal(await fp.locator('.rs-store-badges a[href^="https://play.google.com/"]').count(),1);assert.equal(await fp.locator('.tf-pc-dialog[open]').count(),0);await phone.close();
 const nojs=await browser.newContext({javaScriptEnabled:false});const np=await nojs.newPage();await np.goto(target);assert.ok(await np.locator('h1').isVisible());assert.equal(await np.locator('.rs-store-badges a').count(),2);await nojs.close();
 const wb=await webkit.launch();const wp=await wb.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await wp.goto(target);await wp.locator('.record-system').waitFor();assert.equal(await wp.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await wb.close();
 report.checks.push('Phone store links remain available; no-JS core/store/FAQ access; WebKit narrow layout');
 assert.deepEqual(report.errors,[]);await writeFile('docs/record-page-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
} finally {await browser.close()}
