import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const {chromium,devices,webkit}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TYPING_TEST_ORIGIN||'http://127.0.0.1:4829';
const target=process.env.TYPING_PAGE_URL||base+'/output-web/typing-academy.html';
const out='.taste-skill/typing-functional';await mkdir(out,{recursive:true});
const report={date:'2026-11-03',checks:[],screens:[],traffic:[],errors:[]};
const browser=await chromium.launch({headless:true});
try {
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',serviceWorkers:'block'});
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(target);await page.locator('.tf-fold').last().waitFor();await page.waitForFunction(()=>document.activeElement?.id==='typing-title');
 assert.equal(await page.locator('.tf-fold[open]').count(),0);
 assert.equal(await page.locator('#guide-2 blockquote').isVisible(),false,'Closed founder quotation must not be painted over another fold');
 const gallery=await page.locator('#typing-app img').evaluateAll(images=>images.map(i=>i.getAttribute('src')));assert.equal(gallery.length,3);assert.ok(gallery.every(src=>/ko-(keys|short|long)\.webp/.test(src)));assert.equal(await page.locator('#typing-app img[src*="packs"],#typing-app img[src*="languages"]').count(),0);report.checks.push('Gallery contains only the three cropped Korean practice scenes, with original-image zoom links');
 await page.locator('#guide-1 summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#guide-1').getAttribute('open'),'');
 await page.keyboard.press('Space');assert.equal(await page.locator('.tf-fold[open]').count(),0);
 await page.locator('#guide-1 summary').click();await page.locator('#guide-2 summary').click();assert.equal(await page.locator('.tf-fold[open]').count(),2);
 await page.getByRole('button',{name:'모두 펼치기 +',exact:true}).click();assert.equal(await page.locator('.tf-fold[open]').count(),8);
 await page.getByRole('button',{name:'모두 접기 −',exact:true}).click();assert.equal(await page.locator('.tf-fold[open]').count(),0);
 await page.goto(target+'#guide-4');await page.waitForFunction(()=>document.getElementById('guide-4')?.open);assert.ok((await page.locator('#guide-4').innerText()).includes('모래처럼 중력'));
 report.checks.push('Eight native folds default closed; Enter/Space; multiple open; expand/collapse all; direct anchor opens correct fold');
 const expected=await readFile('src/content/parent-guide.md','utf8');const supplied=process.env.APPROVED_PARENT_GUIDE?await readFile(process.env.APPROVED_PARENT_GUIDE,'utf8'):null;
 if(supplied)assert.equal(expected.trim(),supplied.replace('구조물은 받침이 있어야 버팁니다.','모래처럼 중력의 영향을 받는 블록과 그렇지 않은 블록의 차이를 관찰합니다.').trim());
 report.checks.push(supplied?'Approved source preserved except the single user-approved factual correction':'Repository source rendered; original-document comparison not requested');
 for(const width of [1440,768,390,360]){
  await page.setViewportSize({width,height:width<600?844:1000});await page.goto(target);
  await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.querySelectorAll('.typing-academy img')){img.loading='eager';await img.decode();}});
  const layout=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.querySelectorAll('.typing-academy img')].filter(i=>!i.naturalWidth).length,headings:[...document.querySelectorAll('.typing-academy h1,.typing-academy h2,.typing-academy h3')].filter(el=>el.getBoundingClientRect().height).map(el=>({text:el.textContent,lines:Math.round(el.getBoundingClientRect().height/parseFloat(getComputedStyle(el).lineHeight))})).filter(x=>x.lines>2)}));
  assert.equal(layout.overflow,false,JSON.stringify(layout));assert.equal(layout.broken,0);assert.deepEqual(layout.headings,[]);
  await page.screenshot({path:`${out}/typing-${width}.png`,fullPage:true});report.screens.push(layout);
  if(width===360){await page.locator('#guide-7 summary').click();assert.ok(await page.locator('.tf-table-wrap').evaluate(el=>el.scrollWidth>el.clientWidth));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:`${out}/guide-table-360.png`,fullPage:true});}
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(target+'#typing-download');
 await page.waitForFunction(()=>document.activeElement?.id==='typing-download-title');await page.getByRole('tab',{name:'Mac',exact:true}).focus();await page.keyboard.press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'Windows',exact:true}).getAttribute('aria-selected'),'true');assert.ok((await page.getByRole('link',{name:'Windows 시험판 다운로드',exact:true}).getAttribute('href')).endsWith('TypingAcademy-0.1.6-windows-x86_64-setup.exe'));assert.ok((await page.locator('#download-windows').innerText()).includes('게시자 서명과 실제 PC 설치·업그레이드 검증은 아직 끝나지 않았습니다'));
 await page.keyboard.press('ArrowLeft');assert.ok((await page.getByRole('link',{name:'Mac용 다운로드',exact:true}).getAttribute('href')).endsWith('TypingAcademy-0.1.6-macOS-arm64.zip'));
 report.checks.push('Download OS tabs support arrow keys; Mac pinned verified release; Windows trial is clearly marked with remaining publisher-signature and physical-installation checks');
 const subnav=await page.locator('.branch-subnav a').allTextContents();assert.ok(subnav.indexOf('타이핑사관학교')===subnav.indexOf('오시는 길')+1);
 const tools=await page.locator('.branch-tools').evaluate(el=>({gap:parseFloat(getComputedStyle(el).marginInlineStart),weights:[...el.querySelectorAll('a')].map(a=>getComputedStyle(a).fontWeight),logo:el.querySelector('img')?.naturalWidth,record:el.querySelectorAll('a')[1]?.href}));assert.equal(tools.gap,24);assert.deepEqual(tools.weights,['800','800']);assert.equal(tools.logo,128);assert.equal(tools.record,new URL('record-system.html',target).href);report.checks.push('Typing app logo, extra spacing and two bold tool tabs; official Record link without member API reads');
 await page.goto(base+'/output-web/#yeoksam');await page.locator('.branch-intro').waitFor();assert.equal(await page.locator('.branch-subnav').getByText('타이핑사관학교',{exact:true}).count(),0);
 await page.goto(base+'/output-web/#jeonju');await page.locator('.branch-intro').waitFor();await page.locator('.branch-subnav').getByRole('link',{name:'타이핑사관학교',exact:true}).click();await page.locator('.typing-academy').waitFor();
 await page.locator('.desktop-nav').getByRole('link',{name:'협업문의',exact:true}).click();await page.locator('#proposal').fill('검증용 문의 초안');await page.locator('.desktop-nav').getByRole('link',{name:'전주효천관',exact:true}).click();await page.locator('.branch-subnav').getByRole('link',{name:'타이핑사관학교',exact:true}).click();
 await page.locator('.desktop-nav').getByRole('link',{name:'협업문의',exact:true}).click();assert.equal(await page.locator('#proposal').inputValue(),'검증용 문의 초안');
 report.checks.push('Collaboration draft survives the new typing-tab navigation without a document reload');
 await page.goto(base+'/output-web/#collaboration');await page.locator('#proposal').fill('검증용 보존 초안');await page.locator('.desktop-nav').getByRole('link',{name:'전주효천관',exact:true}).click();await page.locator('.desktop-nav').getByRole('link',{name:'협업문의',exact:true}).click();assert.equal(await page.locator('#proposal').inputValue(),'검증용 보존 초안');
 report.checks.push('Typing tab follows visit only on Jeonju; branch routes and existing in-memory collaboration draft still work');
 for(const [name,options] of [['iphone',{...devices['iPhone 13'],viewport:{width:360,height:780}}],['android',{...devices['Pixel 5']}],['ipad-desktop',{viewport:{width:768,height:1024},hasTouch:true,userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15'}]]){
  const mobile=await browser.newContext({...options,reducedMotion:'reduce',serviceWorkers:'block'});
  if(name==='ipad-desktop')await mobile.addInitScript(()=>{Object.defineProperty(navigator,'platform',{get:()=> 'MacIntel'});Object.defineProperty(navigator,'maxTouchPoints',{get:()=>5});});
  const m=await mobile.newPage();const external=[];m.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});m.on('pageerror',e=>report.errors.push(e.message));
  await m.goto(target);await m.getByRole('button',{name:'Mac용 다운로드',exact:true}).waitFor();assert.equal(await m.locator('a[href*=".zip"]').count(),0);
  for(const selector of [m.getByRole('link',{name:'타이핑사관학교 다운로드',exact:true}),m.getByRole('button',{name:'Mac용 다운로드',exact:true}),m.getByRole('button',{name:/^공식 다운로드/}),m.getByRole('link',{name:'타이핑사관학교 시작하기',exact:true})]){
   await selector.click();await m.getByRole('dialog').waitFor();assert.ok((await m.getByRole('dialog').innerText()).includes('PC에서 접속해 주세요'));if(name==='iphone')await m.screenshot({path:`${out}/mobile-download-blocked.png`});await m.keyboard.press('Escape');assert.equal(await m.getByRole('dialog').isVisible(),false);
  }
  await m.getByRole('tab',{name:'Windows',exact:true}).click();await m.getByRole('button',{name:'Windows 시험판 다운로드',exact:true}).click();await m.getByRole('dialog').waitFor();await m.keyboard.press('Escape');assert.equal(await m.locator('a[href$=".exe"]').count(),0);
  await m.locator('#download-windows summary').click();await m.getByRole('button',{name:'Windows 기존 서버에서 받기',exact:true}).click();await m.getByRole('dialog').waitFor();await m.keyboard.press('Escape');
  await m.getByRole('tab',{name:'Mac',exact:true}).click();await m.locator('#download-mac summary').click();await m.getByRole('button',{name:'Mac 기존 서버에서 받기',exact:true}).click();await m.getByRole('dialog').waitFor();await m.keyboard.press('Escape');
  assert.deepEqual(external,[]);report.checks.push(name+': all seven download CTAs including both origin fallbacks blocked, PC notice, Escape/focus return, no remote download/request');await mobile.close();
 }
 const windows=await browser.newContext({viewport:{width:360,height:844},hasTouch:true,userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36',serviceWorkers:'block'});await windows.addInitScript(()=>{Object.defineProperty(navigator,'platform',{get:()=> 'Win32'});Object.defineProperty(navigator,'maxTouchPoints',{get:()=>10});});const winPage=await windows.newPage();await winPage.goto(target);await winPage.getByRole('link',{name:'Windows 시험판 다운로드',exact:true}).waitFor();assert.equal(await winPage.getByRole('tab',{name:'Windows',exact:true}).getAttribute('aria-selected'),'true');await windows.close();report.checks.push('Windows touch desktop at 360px remains eligible and automatically selects the Windows trial');
 const noJS=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce',serviceWorkers:'block'});const n=await noJS.newPage();await n.goto(target);assert.equal(await n.locator('.tf-fold').count(),8);await n.locator('#guide-2 summary').click();assert.ok((await n.locator('#guide-2').innerText()).includes('울면서 자판'));assert.equal(await n.locator('a[href$=".zip"]').count(),0);await noJS.close();report.checks.push('No-JS HTML contains full native guide; downloads cannot bypass device check');
 for(const version of ['output-baseline','output-web']){
  const metricContext=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});const metricPage=await metricContext.newPage();await metricPage.goto(`${base}/${version}/`);await metricPage.waitForLoadState('networkidle');
  report.traffic.push({page:'homepage',version,...await metricPage.evaluate(()=>({requests:performance.getEntriesByType('resource').length+1,bodyBytes:performance.getEntriesByType('resource').reduce((n,r)=>n+r.encodedBodySize,0)+performance.getEntriesByType('navigation')[0].encodedBodySize,domContentLoadedMs:Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd),fcpMs:Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0),apiRequests:performance.getEntriesByType('resource').filter(r=>/\/api\/|firestore|firebase/.test(r.name)).length}))});await metricContext.close();
 }
 await ctx.close();
 let web;try{web=await webkit.launch({headless:true});const c=await web.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',serviceWorkers:'block'});const w=await c.newPage();await w.goto(target+'#guide-4');await w.waitForFunction(()=>document.getElementById('guide-4')?.open);assert.equal(await w.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);report.checks.push('WebKit engine: direct fold anchor and 390px layout');await c.close();}catch(e){report.webkitUnverified=e.message;}finally{await web?.close();}
 assert.deepEqual(report.errors,[]);await writeFile('docs/typing-page-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
