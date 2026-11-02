import React, {useEffect, useState} from 'react';

// The existing routing script owns SW registration. Never register a second worker
// or reload while the visitor is writing their collaboration draft.
export default function WebUpdateNotice({blocked}) {
  const [next, setNext] = useState('');
  useEffect(() => {
    if (!__PRODUCTION_SITE__) return;
    if (!('serviceWorker' in navigator)) return;
    let lastCheck = Date.now(), checking = false, closed = false;
    const deferKey = 'boxingacademy:deferred-web-build';
    const readBuild = () => {
      if (!navigator.serviceWorker.controller) return;
      const channel = new MessageChannel();
      const timer = setTimeout(() => {channel.port1.close();}, 1500);
      channel.port1.onmessage = ({data}) => {
        clearTimeout(timer); channel.port1.close();
        if (closed || !data || typeof data.version !== 'string' || !/^[a-f0-9]{16}$/.test(data.version) || data.version === globalThis.__ACADEMY_BUILD__ || !Number.isFinite(data.builtAt) || data.builtAt <= (globalThis.__ACADEMY_BUILT_AT__ || 0)) return;
        try {const deferred = JSON.parse(sessionStorage.getItem(deferKey) || 'null'); if (deferred?.version === data.version && deferred.until > Date.now()) return;} catch {}
        setNext(data.version);
      };
      navigator.serviceWorker.controller.postMessage({type:'GET_ACADEMY_VERSION'}, [channel.port2]);
    };
    const check = async () => {
      if (document.hidden || checking || Date.now() - lastCheck < 300000) return;
      checking = true; lastCheck = Date.now();
      try {const registration = await navigator.serviceWorker.getRegistration(); if (registration) await Promise.race([registration.update(), new Promise(resolve => setTimeout(resolve, 8000))]);} catch {} finally {checking = false;}
    };
    navigator.serviceWorker.addEventListener('controllerchange', readBuild);
    document.addEventListener('visibilitychange', check);
    readBuild();
    return () => {closed = true; navigator.serviceWorker.removeEventListener('controllerchange', readBuild); document.removeEventListener('visibilitychange', check);};
  }, []);
  if (!next) return null;
  function later() {try {sessionStorage.setItem('boxingacademy:deferred-web-build', JSON.stringify({version:next, until:Date.now()+43200000}));} catch {} setNext('');}
  return <aside className="web-update-notice" role="status" aria-label="홈페이지 업데이트"><h2>새로운 페이지가 준비됐습니다.</h2><p>{blocked ? '작성 중인 문의 초안을 복사하거나 비운 뒤 업데이트해 주세요.' : '지금 업데이트하거나 현재 페이지를 계속 볼 수 있습니다.'}</p><div><button type="button" className="button" disabled={blocked} onClick={() => location.reload()}>지금 업데이트</button><button type="button" className="button secondary" onClick={later}>나중에</button></div></aside>;
}
