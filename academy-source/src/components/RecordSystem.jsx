import React, {useEffect, useId, useRef, useState} from 'react';

const STORE = {
  iphone: 'https://apps.apple.com/kr/app/id6795803128',
  android: 'https://play.google.com/store/apps/details?id=kr.pe.boxingacademy.record',
};
const PATH = 'assets/record-system/20261102/';
const SCREENS = [
  {key:'calendar', label:'달력', cue:'운동한 날을 찾아보기', title:'날짜를 누르면 그날의 기록', text:'월별 달력에서 운동한 날을 찾고, 날짜를 눌러 종목과 기록을 다시 확인합니다.', file:'calendar.webp', width:390, height:844, alt:'예시 회원의 2026년 10월 운동 기록 달력'},
  {key:'detail', label:'운동 상세', cue:'종목과 결과 다시 확인', title:'어떤 운동을 했는지 자세히', text:'날짜별 상세 화면에서 운동 종목과 측정 기록, 순위를 확인할 수 있습니다.', file:'detail.webp', width:390, height:330, alt:'예시 회원의 날짜별 달리기 종목과 5km 기록 상세'},
  {key:'entry', label:'직접 기록', cue:'오늘 한 운동을 남기기', title:'나의 운동도 빠짐없이', text:'자율운동은 날짜와 운동내용, 운동기록을 직접 입력합니다. 저장과 공개 범위는 앱의 설정을 따릅니다.', file:'entry.webp', width:390, height:844, alt:'날짜, 운동내용, 운동기록을 입력하는 자율운동 작성 화면'},
  {key:'running', label:'달리기 요약', cue:'거리와 시간 함께 보기', title:'한 달의 달리기를 한눈에', text:'한 달에 저장한 달리기의 총거리와 총운동시간, 평균 페이스와 속도를 확인합니다.', file:'running.webp', width:390, height:425, alt:'총거리, 총운동시간, 평균 페이스와 속도를 표시한 예시 월간 달리기 요약'},
];
const DEVICES = [
  {key:'both', name:'둘 다'}, {key:'iphone', name:'iPhone'}, {key:'android', name:'Android'},
];
const HEALTH = {
  both:'기기에 맞는 스토어에서 설치하세요. 건강 기록을 연결하는 방식은 iPhone과 Android가 다르며, 가져오기와 뉴스피드 공개는 각각 선택할 수 있습니다.',
  iphone:'iPhone에서는 건강 앱과 Apple Watch의 달리기 날짜·거리·시간을 가져올 수 있습니다. 건강 앱 연결은 직접 동의한 뒤 사용합니다.',
  android:'Android에서는 Health Connect를 통해 연결된 건강 앱의 달리기 기록을 가져올 수 있습니다. 기기와 권한에 따라 지원 범위가 달라집니다.',
};

export default function RecordSystem({assets = {}}) {
  const asset = name => assets[PATH + name] || PATH + name;
  const id = useId();
  const root = useRef(null), dialog = useRef(null), screenTabs = useRef([]);
  const [screenIndex, setScreenIndex] = useState(0);
  const [device, setDevice] = useState('both');
  const screen = SCREENS[screenIndex];

  useEffect(() => {
    const nodes = root.current?.querySelectorAll('[data-rs-enter]') || [];
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Unobserved content stays visible; a failed animation cannot hide information.
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('rs-entered');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:0.1});
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const onTabKey = event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (screenIndex + 1) % SCREENS.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (screenIndex + SCREENS.length - 1) % SCREENS.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = SCREENS.length - 1;
    if (next !== undefined) {
      event.preventDefault(); setScreenIndex(next); screenTabs.current[next]?.focus();
    }
  };

  return <div className="record-system" id="jeonju-record" ref={root}>
    <section className="rs-hero" aria-labelledby={`${id}-hero`}>
      <div className="shell rs-hero-grid">
        <div className="rs-hero-copy">
          <h1 id={`${id}-hero`}><span>오늘의 운동,</span><span>나의 기록으로</span></h1>
          <p className="rs-intro">복싱사관학교 기록시스템에서<br/>출석과 WOD, 달리기를 한눈에 확인하세요.</p>
          <div className="rs-store-badges" aria-label="공식 앱 다운로드">
            <a href={STORE.iphone} target="_blank" rel="noopener noreferrer" className="rs-app-store" aria-label="iPhone용 기록시스템 App Store에서 다운로드 (새 창)">
              <img src={asset('app-store-badge.svg')} width="156" height="52" alt="App Store에서 다운로드"/>
            </a>
            <a href={STORE.android} target="_blank" rel="noopener noreferrer" className="rs-google-play" aria-label="Android용 기록시스템 Google Play에서 다운로드 (새 창)">
              <img src={asset('google-play-badge.png')} width="197" height="76" alt="Google Play에서 다운로드"/>
            </a>
          </div>
          <p className="rs-member-note">유효 회원권이 있는 복싱사관학교 회원 전용 앱입니다.</p>
        </div>
        <div className="rs-hero-art">
          <picture className="rs-scene" aria-hidden="true">
            <source media="(max-width:700px)" srcSet={asset('hero-mobile.webp')}/>
            <img src={asset('hero-desktop.webp')} width="1600" height="900" alt="" decoding="async" fetchPriority="high"/>
          </picture>
          <figure className="rs-phone" data-ui="record-app">
            <img src={asset('profile.webp')} width="390" height="844" alt="나의 프로필에서 회원권과 운동 기록을 확인하는 실제 앱 화면. 표시된 회원과 기록은 예시입니다." decoding="async"/>
          </figure>
          <p className="rs-art-note">실제 앱 화면 · 회원과 기록은 예시입니다.</p>
        </div>
      </div>
    </section>

    <section className="shell rs-showcase" aria-labelledby={`${id}-showcase`}>
      <h2 id={`${id}-showcase`} data-rs-enter="title">기록을 꺼내보는<br/>네 가지 방법</h2>
      <div className="rs-showcase-grid">
        <div className="rs-screen-index" role="tablist" aria-label="기록시스템 화면 살펴보기" aria-orientation="vertical" onKeyDown={onTabKey}>
          {SCREENS.map((item,index) => <button type="button" key={item.key} ref={node => {screenTabs.current[index] = node;}}
            id={`${id}-tab-${item.key}`} role="tab" aria-selected={screenIndex === index}
            aria-controls={`${id}-screen-panel`} tabIndex={screenIndex === index ? 0 : -1}
            onClick={() => setScreenIndex(index)} data-rs-enter="index">
            <span className="rs-screen-label">{item.label}</span><span className="rs-screen-cue">{item.cue}</span>
          </button>)}
        </div>
        <div className="rs-screen-panel" id={`${id}-screen-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${screen.key}`} tabIndex="0">
          <div className="rs-screen-copy"><h3>{screen.title}</h3><p>{screen.text}</p></div>
          <figure className={`rs-proof rs-proof-${screen.key}`} data-ui="record-app">
            <button className="rs-screen-zoom" type="button" onClick={() => {if(typeof dialog.current?.showModal === 'function') dialog.current.showModal(); else window.open(asset(screen.file),'_blank','noopener,noreferrer');}} aria-label={`${screen.label} 예시 화면 크게 보기`}>
              <img src={asset(screen.file)} width={screen.width} height={screen.height} alt={screen.alt} loading="lazy" decoding="async"/>
            </button>
            <figcaption>화면을 누르면 크게 볼 수 있습니다. 모든 회원·기록은 예시입니다.</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section className="rs-start" aria-labelledby={`${id}-start`}>
      <div className="shell rs-start-grid">
        <h2 id={`${id}-start`} data-rs-enter="title">설치하고,<br/>나의 기록 시작</h2>
        <ol className="rs-steps">
          <li data-rs-enter="step"><h3>공식 스토어에서 설치</h3><p>iPhone은 App Store, Android는 Google Play에서 ‘복싱사관학교 기록시스템’을 설치하세요.</p></li>
          <li data-rs-enter="step"><h3>회원 계정으로 로그인</h3><p>등록된 회원 정보로 로그인하세요. 회원 확인이 어려우면 이용 중인 지점에 문의해 주세요.</p></li>
          <li data-rs-enter="step"><h3>나의 프로필에서 확인</h3><p>회원권과 출석, 운동 달력을 확인하고 오늘의 운동을 남겨보세요.</p></li>
        </ol>
      </div>
    </section>

    <section className="shell rs-download" aria-labelledby={`${id}-download`}>
      <div className="rs-download-heading"><h2 id={`${id}-download`} data-rs-enter="title">내 휴대전화에<br/>기록시스템 담기</h2><p>두 스토어 모두 공식 배포 페이지로 연결됩니다.<br/>컴퓨터에서는 QR 코드를 휴대전화로 스캔하세요.</p></div>
      <fieldset className="rs-device-picker"><legend>사용하는 휴대전화</legend><div>{DEVICES.map(item => <label key={item.key}><input type="radio" name={`${id}-device`} value={item.key} checked={device === item.key} onChange={() => setDevice(item.key)}/><span>{item.name}</span></label>)}</div></fieldset>
      <p className="rs-health-note" aria-live="polite" aria-atomic="true">{HEALTH[device]}</p>
      <div className="rs-download-grid">
        {[
          {key:'iphone',title:'iPhone',store:'App Store',label:'iPhone용 다운로드',qr:'qr-app-store.png'},
          {key:'android',title:'Android',store:'Google Play',label:'Android용 다운로드',qr:'qr-google-play.png'},
        ].map(item => <article key={item.key} className={`rs-download-option${device === item.key ? ' rs-selected-device' : ''}`}>
          <div><h3>{item.title}</h3><p>{item.store} 공식 앱</p><a className="button" href={STORE[item.key]} target="_blank" rel="noopener noreferrer">{item.label}<span className="rs-sr-only"> (새 창)</span></a></div>
          <a className="rs-qr" href={STORE[item.key]} target="_blank" rel="noopener noreferrer" aria-label={`${item.store} 다운로드 QR 코드와 공식 설치 페이지 (새 창)`}><img src={asset(item.qr)} width="240" height="240" alt={`${item.store} 설치 QR 코드`} loading="lazy" decoding="async"/></a>
        </article>)}
      </div>
    </section>

    <section className="shell rs-faq" aria-labelledby={`${id}-faq`}>
      <h2 id={`${id}-faq`} data-rs-enter="title">설치 전 궁금한 점</h2>
      <div>
        <details><summary>누가 이용할 수 있나요?</summary><p>유효 회원권이 있는 복싱사관학교 회원을 위한 앱입니다. 회원 가입과 이용 가능 여부는 다니는 지점에 문의해 주세요.</p></details>
        <details><summary>회원 정보가 확인되지 않으면 어떻게 하나요?</summary><p>이용 중인 지점에 회원 등록 정보와 회원권 상태를 확인해 주세요. 이 소개 페이지에서는 회원정보를 입력하거나 변경하지 않습니다.</p></details>
        <details><summary>건강 앱을 꼭 연결해야 하나요?</summary><p>직접 운동을 기록하거나 달력을 확인할 때는 건강 앱 연결이 필요하지 않습니다. Android의 Health Connect와 iPhone의 건강 앱 연동은 별도로 동의한 경우에 사용합니다. iPhone 건강 앱에서는 달리기 날짜·거리·시간을 가져오며, 심박수·칼로리·GPS 경로는 가져오지 않습니다.</p></details>
        <details><summary>운동기록이 모두 공개되나요?</summary><p>기록 저장과 뉴스피드 공개는 별도 설정입니다. 앱에서 현재 저장·공개 설정을 확인하고, 건강 기록 가져오기와 공개 여부를 각각 선택해 주세요.</p></details>
        <details><summary>기존 웹 기록시스템도 열 수 있나요?</summary><p><a className="text-link" href="https://app.boxingacademy.pe.kr/record.html" target="_blank" rel="noopener noreferrer">웹 기록시스템 열기<span className="rs-sr-only"> (새 창)</span></a>에서 기존 웹 화면을 이용할 수 있습니다. 건강 앱 연결 등 기기 기능은 설치 앱에서 지원 범위를 확인해 주세요.</p></details>
      </div>
      <p className="rs-provenance">앱 화면의 회원과 운동기록은 설명을 위한 예시입니다. 배경은 AI로 제작한 홍보용 이미지이며 실제 지점 사진이 아닙니다. 기기와 앱 버전에 따라 화면과 지원 기능이 다를 수 있습니다.<br/>Apple, Apple 로고, iPhone 및 Apple Watch는 Apple Inc.의 상표이며, App Store는 Apple Inc.의 서비스 마크입니다. Google Play, Google Play 로고 및 Android는 Google LLC의 상표입니다.</p>
    </section>

    <dialog className="rs-image-dialog" ref={dialog} aria-labelledby={`${id}-zoom-title`} onClick={event => {if(event.target === dialog.current) dialog.current.close();}}>
      <div className="rs-dialog-head"><h3 id={`${id}-zoom-title`}>{screen.label} 화면 예시</h3><button type="button" onClick={() => dialog.current.close()}>닫기</button></div>
      <img src={asset(screen.file)} width={screen.width} height={screen.height} alt={screen.alt}/>
      <p>회원과 운동기록은 예시입니다.</p>
    </dialog>
  </div>;
}
