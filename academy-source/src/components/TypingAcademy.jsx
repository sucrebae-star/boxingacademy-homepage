import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import rawGuide from '../content/parent-guide.md';
import {parseParentGuide, typingRelease as release, windowsTrialRelease as windowsRelease, isMobileDownloadClient} from '../parent-guide.mjs';

const guide = parseParentGuide(rawGuide);
const arrow = <span aria-hidden="true">↗</span>;
const asset = name => (globalThis.__ASSETS__ || {})['assets/typing/20261102/' + name + '.webp'] || 'assets/typing/20261102/' + name + '.webp';

const DownloadContext = createContext(null);
function DownloadGuard({children}) {
  const [device, setDevice] = useState('pending'); const dialog = useRef(null); const trigger = useRef(null);
  useEffect(() => setDevice(isMobileDownloadClient(navigator) ? 'mobile' : 'desktop'), []);
  function guard(event) {
    if (!isMobileDownloadClient(navigator)) return false;
    event.preventDefault(); trigger.current = event.currentTarget;
    if (!dialog.current.open) dialog.current.showModal();
    return true;
  }
  return <DownloadContext.Provider value={{device, guard}}>{children}<dialog className="tf-pc-dialog" ref={dialog} aria-labelledby="pc-required-title" aria-describedby="pc-required-message" onClose={() => trigger.current?.focus()}><h2 id="pc-required-title">PC에서 접속해 주세요.</h2><p id="pc-required-message">이 페이지의 다운로드는 PC 프로그램용입니다. 휴대폰·태블릿에서는 다운로드할 수 없습니다. Mac 또는 Windows PC에서 복싱사관학교.com의 효천본관 → 타이핑사관학교에 접속해 주세요.</p><button className="button" type="button" onClick={() => dialog.current.close()}>확인</button></dialog></DownloadContext.Provider>;
}
function DownloadLink({href, children, className='button', ...props}) {
  const {device, guard} = useContext(DownloadContext);
  // No installer URL is emitted into the server-rendered button. Without JS,
  // downloads stay unavailable rather than bypassing the mobile check.
  return device === 'desktop' ? <a {...props} className={className} href={href} onClick={guard}>{children}</a> : <button className={className} type="button" disabled={device === 'pending'} onClick={guard}>{children}</button>;
}
function DownloadJump({children, className='button'}) {
  const {guard} = useContext(DownloadContext);
  return <a className={className} href="#typing-download" onClick={guard}>{children}</a>;
}

function Inline({text}) {
  return text.split(/(\*\*[^*]+\*\*|https:\/\/[^\s]+)/g).map((part, i) =>
    part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> :
    part.startsWith('https://') ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}<span className="sr-only"> (새 창)</span></a> : part);
}

function ContrastItem({text}) {
  const [title, rest] = text.split(' — ✕ ');
  if (!rest) return <Inline text={text}/>;
  const [avoid, prefer] = rest.split(' → ○ ');
  return <><h4><Inline text={title}/></h4><div className="tf-contrast-pair"><p><span aria-hidden="true">✕ </span><span className="sr-only">피할 것: </span>{avoid}</p><p><span aria-hidden="true">○ </span><span className="sr-only">이렇게: </span>{prefer}</p></div></>;
}

function Markdown({source, kind}) {
  const lines = source.split('\n'); const blocks = [];
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) {i++; continue;}
    if (line.startsWith('|')) {
      const rows = []; while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++].split('|').slice(1, -1).map(s => s.trim()));
      blocks.push(<div key={i} className="tf-table-wrap" tabIndex="0" role="region" aria-label="가로로 스크롤할 수 있는 부모님 기록표"><table><caption className="sr-only">관찰 기록 예시</caption><thead><tr>{rows[0].map(c => <th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{rows.slice(2).map((row, r) => <tr key={r}>{row.map((c, n) => <td key={n}><Inline text={c}/></td>)}</tr>)}</tbody></table></div>); continue;
    }
    if (line.startsWith('> ')) {
      const text = []; while (i < lines.length && lines[i].startsWith('> ')) text.push(lines[i++].slice(2));
      blocks.push(<blockquote key={i}><Inline text={text.join(' ')}/></blockquote>); continue;
    }
    if (/^(?:\d+\. |- )/.test(line)) {
      const ordered = /^\d+\./.test(line); const items = [];
      while (i < lines.length && (ordered ? /^\d+\. / : /^- /).test(lines[i])) items.push(lines[i++].replace(/^(?:\d+\. |- )/, ''));
      const Tag = ordered ? 'ol' : 'ul';
      blocks.push(<Tag key={i} className={kind === 4 ? 'tf-ability-grid' : kind === 8 ? 'tf-contrast-list' : undefined}>{items.map((item, n) => <li key={n}>{kind === 8 ? <ContrastItem text={item}/> : <Inline text={item}/>}</li>)}</Tag>); continue;
    }
    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !/^(?:\d+\. |- |> |\|)/.test(lines[i])) paragraph.push(lines[i++]);
    blocks.push(<p key={i}><Inline text={paragraph.join(' ')}/></p>);
  }
  return blocks;
}

function ParentGuide() {
  const elements = useRef(new Map()); const [allOpen, setAllOpen] = useState(false);
  const update = () => setAllOpen([...elements.current.values()].every(el => el.open));
  useEffect(() => {
    const openAnchor = () => {
      const match = location.hash.match(/^#guide-([1-8])$/); if (!match) return;
      const element = elements.current.get(Number(match[1])); if (element) {element.open = true; update();}
    };
    openAnchor(); window.addEventListener('hashchange', openAnchor);
    return () => window.removeEventListener('hashchange', openAnchor);
  }, []);
  function toggleAll() {const next = !allOpen; for (const el of elements.current.values()) el.open = next; setAllOpen(next);}
  return <section className="tf-guide shell" id="typing-guide" aria-labelledby="parent-guide-title">
    <div className="tf-section-title"><h2 id="parent-guide-title" data-reveal="rise">부모님과 함께<br/>펼쳐보는 안내</h2><div><p>궁금한 제목을 눌러 읽어보세요.<br/>여러 항목을 함께 펼칠 수 있습니다.</p><button className="text-link" type="button" onClick={toggleAll} aria-controls={guide.folds.map(f => 'guide-' + f.id).join(' ')}>{allOpen ? '모두 접기 −' : '모두 펼치기 +'}</button></div></div>
    <div className="tf-folds">{guide.folds.map(f => <details key={f.id} id={'guide-' + f.id} ref={el => {if (el) elements.current.set(f.id, el); else elements.current.delete(f.id);}} onToggle={update} className="tf-fold">
      <summary><span><span className="tf-fold-title">{f.title}</span><span className="tf-fold-summary">{f.summary}</span></span><span className="tf-fold-icon" aria-hidden="true">+</span></summary>
      <div className="tf-fold-body"><Markdown source={f.detail} kind={f.id}/></div>
    </details>)}</div>
    <p className="tf-note">위 글은 복싱사관학교의 운영 취지와 가정 활동 제안입니다. 교육 효과를 보장하는 설명이나 모든 아이에게 동일하게 적용하는 시간표는 아닙니다. 나이·컨디션에 맞춰 부모님과 활동·휴식 시간을 정해 주세요.</p>
  </section>;
}

function Downloads() {
  const [platform, setPlatform] = useState('mac'); const tabs = useRef([]);
  useEffect(() => {if (/Windows|Win32|Win64/i.test(navigator.userAgent+' '+navigator.platform)) setPlatform('windows');}, []);
  function moveTab(event, index) {
    const key = event.key; if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
    event.preventDefault(); const next = key === 'Home' ? 0 : key === 'End' ? 1 : 1 - index;
    setPlatform(next ? 'windows' : 'mac'); tabs.current[next]?.focus();
  }
  return <section className="tf-download" id="typing-download" aria-labelledby="typing-download-title"><div className="shell tf-download-grid">
    <div className="tf-download-intro"><h2 id="typing-download-title" data-reveal="rise">오늘의 첫 연습,<br/>부모님과 함께.</h2><p data-reveal="rise">타이핑사관학교는 복싱사관학교 회원용 PC 앱입니다. 이용하려면 로그인과 유효한 회원 계정 연결이 필요합니다.</p><p>한국어·영어·베트남어·일본어·중국어 간체 연습을 지원합니다. 추가 언어팩은 앱 안에서 내려받을 수 있습니다.</p><a className="text-link" href="tel:0637176433">회원 연결·설치 문의 {arrow}</a></div>
    <div className="tf-download-sheet" data-ui="installer-selection"><h3>내 컴퓨터에 맞게<br/>시작하세요.</h3><div className="tf-os-tabs" role="tablist" aria-label="컴퓨터 종류">{[['mac', 'Mac'], ['windows', 'Windows']].map(([id, label], i) => <button key={id} ref={el => {tabs.current[i] = el;}} role="tab" id={'os-' + id} aria-controls={'download-' + id} aria-selected={platform === id} tabIndex={platform === id ? 0 : -1} onKeyDown={e => moveTab(e, i)} onClick={() => setPlatform(id)}>{label}</button>)}</div>
      <div id="download-mac" role="tabpanel" aria-labelledby="os-mac" hidden={platform !== 'mac'}><p className="tf-download-version">Mac · Apple Silicon</p><p>v{release.version} · ZIP · 약 31.9 MB<br/>M1·M2·M3·M4 등 Apple Silicon용</p><DownloadLink href={release.url} download="TypingAcademy-0.1.4-macOS-arm64.zip">Mac용 다운로드 <span aria-hidden="true">↓</span></DownloadLink><p className="tf-note">Apple Developer ID 서명·공증 검증본입니다. 실제 기기에서의 회원 로그인·실사용 검증은 별도이며, Intel Mac용 설치 파일은 아직 제공하지 않습니다.</p><details className="tf-install-help"><summary>설치 방법과 파일 정보</summary><ol><li>ZIP을 내려받아 압축을 풉니다.</li><li>타이핑사관학교 앱을 응용 프로그램 폴더로 옮깁니다.</li><li>앱을 열고 안내에 따라 로그인·회원 연결을 진행합니다.</li></ol><p>macOS의 보안 확인 안내를 따르세요. 차단되면 보안을 우회하지 말고 체육관에 문의해 주세요.</p><p>파일 크기: {release.bytes.toLocaleString('en-US')} 바이트<br/>SHA-256: <span className="tf-hash">{release.sha256}</span></p><p>설치 후 새 버전은 앱의 기존 업데이트 안내에서 확인할 수 있습니다. 연습·저장 중에는 업데이트를 미루고 완료한 뒤 진행해 주세요.</p></details></div>
      <div id="download-windows" role="tabpanel" aria-labelledby="os-windows" hidden={platform !== 'windows'}><p className="tf-download-version">Windows x64 · 검증 중 시험판</p><p>v{windowsRelease.version} · 설치 프로그램 · 약 248.5 MB<br/>Windows 10·11 64비트용</p><p className="tf-note"><strong>Windows 게시자 서명과 실제 PC 설치·업그레이드 검증은 아직 끝나지 않았습니다.</strong> 업데이트 서명과 파일 무결성은 확인했지만 보안 경고가 표시될 수 있습니다. 이 상태를 확인하고 시험판을 이용할 분께 제공합니다.</p><DownloadLink href={windowsRelease.url} download="TypingAcademy-0.1.4-windows-x86_64-setup.exe">Windows 시험판 다운로드 <span aria-hidden="true">↓</span></DownloadLink><details className="tf-install-help"><summary>설치 전 확인과 파일 정보</summary><p>내려받은 설치 프로그램의 Windows 안내를 확인하세요. 보안 차단을 우회하지 말고, 설치가 막히거나 출처를 확인하기 어렵다면 체육관에 문의해 주세요. WebView2 오프라인 설치 파일이 포함되어 있습니다.</p><p>파일 크기: {windowsRelease.bytes.toLocaleString('en-US')} 바이트<br/>SHA-256: <span className="tf-hash">{windowsRelease.sha256}</span></p><p>기존 회원 앱 전용 업데이트 채널을 사용합니다. 설치·회원 로그인·실사용 결과는 별도 확인이 필요합니다.</p></details></div>
    </div></div></section>;
}

export default function TypingAcademy() {
  return <DownloadGuard><article className="typing-academy" id="jeonju-typing">
    <section className="tf-hero shell" aria-labelledby="typing-title"><div className="tf-hero-sheet"><h1 id="typing-title"><span data-reveal="line">주먹만큼 단단한</span><span data-reveal="line">손가락을 위해</span></h1><p className="tf-project-name">{guide.subtitle}</p><div className="tf-intro" data-reveal="rise"><Markdown source={guide.intro}/></div><DownloadJump>타이핑사관학교 다운로드 <span aria-hidden="true">↓</span></DownloadJump><nav className="tf-local-links" aria-label="타이핑사관학교 안내"><a href="#typing-guide">부모님 안내</a><a href="#typing-app">앱 살펴보기</a><a href="#minecraft-education">Minecraft Education</a></nav></div><figure className="tf-family" data-reveal="image"><picture><source media="(max-width:700px)" srcSet={asset('family-small')}/><img src={asset('family')} width="1600" height="900" alt="아이가 키보드를 직접 누르고 부모가 곁에서 손 위치를 함께 살펴보는 AI 콘셉트 이미지" fetchPriority="high" decoding="async"/></picture><figcaption>함께 배우는 순간을 표현한 AI 콘셉트 이미지입니다.<br/>실제 회원이나 시설을 촬영한 사진이 아닙니다.</figcaption></figure></section>
    <section className="tf-showcase shell" id="typing-app" aria-labelledby="typing-app-title"><div className="tf-section-title"><h2 id="typing-app-title" data-reveal="rise">한국어로 한 글자씩,<br/>나의 속도로.</h2><p data-reveal="rise">아래는 메뉴나 설정 화면이 아닌,<br/>한국어를 직접 연습하는 실제 UI 장면입니다.</p></div><figure className="tf-practice tf-korean-main" data-reveal="image"><a className="tf-ui-zoom" href={asset('ko-keys')} target="_blank" rel="noopener noreferrer" aria-label="한국어 자리 연습 화면 크게 보기"><img src={asset('ko-keys')} width="1096" height="588" alt="한국어 ㄹ 자리 연습의 답안 입력 영역과 F 키·왼손 검지 안내 화면" loading="lazy" decoding="async"/></a><figcaption>한국어 자리 연습 · 글자와 손가락 안내를 함께 봅니다. 이미지를 누르면 크게 볼 수 있습니다.</figcaption></figure><div className="tf-proof-layout tf-korean-only"><figure data-reveal="image"><h3>오타를 바로 확인해요.</h3><a className="tf-ui-zoom" href={asset('ko-short')} target="_blank" rel="noopener noreferrer" aria-label="한국어 짧은글 연습 화면 크게 보기"><img src={asset('ko-short')} width="1096" height="588" alt="오늘 우리는 함께 책을 읽습니다를 입력하며 잘못 입력한 익이 붉게 표시된 한국어 짧은글 연습" loading="lazy" decoding="async"/></a><figcaption>한국어 짧은글 · 입력 중인 문장과 오타 표시, 다음 키 안내를 확인합니다.</figcaption></figure><figure data-reveal="image"><h3>긴글도 한 화면씩.</h3><a className="tf-ui-zoom" href={asset('ko-long')} target="_blank" rel="noopener noreferrer" aria-label="한국어 긴글 연습 화면 크게 보기"><img src={asset('ko-long')} width="1096" height="588" alt="한국어 긴글을 화면에 맞춰 나누어 입력하고 다음 글자의 자음 순서를 안내하는 연습 화면" loading="lazy" decoding="async"/></a><figcaption>한국어 긴글 · 문장을 나누어 이어 쓰면서 입력 순서와 손 위치를 봅니다.</figcaption></figure></div><p className="tf-note">실제 앱 웹 미리보기의 한국어 연습 영역만 잘라 담았습니다. 화면 속 입력과 수치는 캡처용 연습 예시이며 실제 회원의 기록이나 성과가 아닙니다. 설치 환경에 따라 표시가 다를 수 있습니다.</p><p className="tf-language-note">앱에서는 한국어 외에도 영어·베트남어·일본어·중국어 간체 연습을 지원합니다. 이 페이지의 사용 화면은 한국어 연습 장면만 보여드립니다. 연습자료는 학습용 초안이며 전문 감수 전입니다.</p></section>
    <ParentGuide/>
    <section className="tf-minecraft shell" id="minecraft-education" aria-labelledby="minecraft-title"><div><h2 id="minecraft-title" data-reveal="rise">좋아하는 활동으로<br/>배움을 이어가요.</h2><p className="tf-product-title">Minecraft Education</p></div><div><p>공식 사이트에서 Mac·Windows 등 내 기기에 맞는 설치 파일을 받을 수 있습니다. 타이핑사관학교에 포함된 게임이 아니라 별도로 설치하는 외부 서비스입니다.</p><div className="actions"><DownloadLink className="button secondary" href="https://education.minecraft.net/en-us/get-started/download" target="_blank" rel="noopener noreferrer">공식 다운로드 {arrow}<span className="sr-only"> (PC에서 새 창)</span></DownloadLink><a className="text-link" href="https://edusupport.minecraft.net/hc/en-us/articles/4415061129236" target="_blank" rel="noopener noreferrer">가정용 계정·라이선스 안내 {arrow}<span className="sr-only"> (새 창)</span></a></div><p className="tf-note">Microsoft 365 계정과 별도 라이선스 조건을 확인해 주세요. 복싱사관학교 회원권에는 Minecraft Education 이용 권한이 포함되어 있지 않습니다. 계정 생성·구매는 이 페이지에서 진행하지 않습니다.</p></div></section>
    <Downloads/>
    <section className="tf-closing shell"><p data-reveal="rise">{guide.closing}</p><DownloadJump>{guide.button} {arrow}</DownloadJump></section>
    <aside className="tf-sources shell" aria-label="참고 출처와 상표 안내"><Markdown source={guide.sources}/><p>자료 확인일: 2026년 11월 2일. 제공 기능·구매 조건은 공식 안내에서 최신 내용을 확인해 주세요. 일반 블록과 중력 블록의 차이는 <a href="https://www.minecraft.net/en-us/article/block-week-sand" target="_blank" rel="noopener noreferrer">Minecraft 공식 Sand 설명<span className="sr-only"> (새 창)</span></a>을 참고했습니다.</p></aside>
  </article></DownloadGuard>;
}
