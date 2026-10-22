import React, {useCallback, useEffect, useId, useRef, useState} from 'react';

const assets = () => globalThis.__ASSETS__ || {};
const media = path => assets()[path] || path;
const reducedMotion = () => typeof matchMedia === 'function'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

function ExercisePhoto({part}) {
  if (part.scene) {
    return <picture className="photo">
      <img src={media(`${part.scene}-web.webp`)} width="1672" height="941" loading="lazy" decoding="async" alt={`${part.title} 운동을 표현한 AI 콘셉트 사진`}/>
    </picture>;
  }
  return <img src={media(part.image)} width="1672" height="941" loading="lazy" decoding="async" alt={part.video ? '전주효천관 실제 수업 영상 미리보기' : `${part.title} AI 콘셉트 사진`}/>;
}

function ClassVideo({part}) {
  const videoRef = useRef(null);
  const attempted = useRef(false);
  const [paused, setPaused] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const pause = () => video.pause();
    const onVisibility = () => { if (document.hidden) pause(); };
    const onMotion = () => { if (motion.matches) pause(); };
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= 0.55;
      if (!visible) {
        pause();
      } else if (!attempted.current && !document.hidden && !motion.matches) {
        attempted.current = true;
        video.play().catch(() => setPaused(true));
      }
    }, {threshold: [0, 0.55]});
    observer.observe(video);
    document.addEventListener('visibilitychange', onVisibility);
    motion.addEventListener('change', onMotion);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      motion.removeEventListener('change', onMotion);
      pause();
    };
  }, []);

  async function play() {
    setMessage('');
    try {
      await videoRef.current?.play();
    } catch {
      setMessage('영상을 재생하지 못했습니다. 잠시 후 다시 눌러주세요.');
    }
  }

  return <div className="lesson-video">
    <video ref={videoRef} controls muted loop playsInline preload="none"
      poster={media(part.image)} src={media(part.video)} width="1280" height="720"
      aria-label={`${part.title} 실제 수업 영상`}
      onPlay={() => setPaused(false)} onPause={() => setPaused(true)}
      onError={() => { setPaused(true); setMessage('영상을 불러오지 못했습니다. 미리보기 사진을 확인해 주세요.'); }}/>
    {paused && <button type="button" className="video-play-button button" onClick={play} aria-label={`${part.title} 영상 재생`}>영상 재생 <span aria-hidden="true">▶</span></button>}
    {message && <p className="video-message caption" role="status">{message}</p>}
  </div>;
}

/** One settled selection drives the caption, live announcement, and mounted video. */
export default function LessonCarousel({parts, program, title}) {
  const railRef = useRef(null);
  const selectorRef = useRef(null);
  const pendingRef = useRef(null);
  const idleRef = useRef(null);
  const selectedRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [moving, setMoving] = useState(false);
  const generatedId = useId();
  const railId = `lesson-${generatedId.replaceAll(':', '')}`;
  const instructionsId = `${railId}-instructions`;

  const select = useCallback(next => {
    selectedRef.current = next;
    setIndex(next);
  }, []);

  const positionFor = useCallback(i => {
    const rail = railRef.current;
    return rail?.children[i] && rail.children[0]
      ? rail.children[i].offsetLeft - rail.children[0].offsetLeft : 0;
  }, []);

  const settle = useCallback(() => {
    clearTimeout(idleRef.current);
    const rail = railRef.current;
    if (!rail || !parts.length) return;
    let nearest = 0;
    let distance = Infinity;
    for (let i = 0; i < rail.children.length; i++) {
      const nextDistance = Math.abs(rail.scrollLeft - positionFor(i));
      if (nextDistance < distance) { nearest = i; distance = nextDistance; }
    }
    pendingRef.current = null;
    setMoving(false);
    select(nearest);
  }, [parts.length, positionFor, select]);

  const step = useCallback(requested => {
    const rail = railRef.current;
    if (!rail || !parts.length) return;
    const next = Math.max(0, Math.min(parts.length - 1, requested));
    clearTimeout(idleRef.current);
    const left = positionFor(next);
    // Keep the clicked destination selected while intermediate slides pass by.
    pendingRef.current = next;
    select(next);
    const needsMotion = Math.abs(rail.scrollLeft - left) > 2;
    setMoving(needsMotion);
    rail.scrollTo({left, behavior: reducedMotion() ? 'instant' : 'smooth'});
    if (!needsMotion || reducedMotion()) {
      pendingRef.current = null;
      setMoving(false);
    }
  }, [parts.length, positionFor, select]);

  useEffect(() => {
    clearTimeout(idleRef.current);
    pendingRef.current = null;
    selectedRef.current = 0;
    setIndex(0);
    setMoving(false);
    railRef.current?.scrollTo({left: 0, behavior: 'instant'});
    selectorRef.current?.scrollTo({left: 0, behavior: 'instant'});
  }, [program]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.addEventListener('scrollend', settle);
    return () => {
      rail.removeEventListener('scrollend', settle);
      clearTimeout(idleRef.current);
    };
  }, [settle]);

  function onScroll() {
    setMoving(true);
    clearTimeout(idleRef.current);
    // Also covers browsers that do not expose scrollend. Captions do not cycle
    // through intermediate items during either a swipe or smooth scrolling.
    idleRef.current = setTimeout(settle, 180);
  }

  function takeManualControl() {
    const rail = railRef.current;
    if (pendingRef.current !== null && rail) {
      pendingRef.current = null;
      rail.scrollTo({left: rail.scrollLeft, behavior: 'instant'});
      settle();
    }
  }

  function onKeyDown(event) {
    // Native video controls retain their arrow-key seeking behavior.
    if (event.target !== event.currentTarget) return;
    const key = event.key;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    step(key === 'Home' ? 0 : key === 'End' ? parts.length - 1
      : selectedRef.current + (key === 'ArrowRight' ? 1 : -1));
  }

  const current = parts[index] || parts[0];
  if (!current) return null;
  return <div className="lesson">
    {title && <div className="lesson-head"><h3>{title}</h3></div>}
    <div className="lesson-layout">
      <div className="exercise-buttons" ref={selectorRef} role="group" aria-label="운동 파트 선택">
        {parts.map((part, i) => <button type="button" key={`${program}-${i}`} aria-pressed={i === index} aria-controls={railId} onClick={() => step(i)}>
          <span>{part.title}</span>
          {part.video && <small>{assets()[part.video] ? '실제 영상' : '영상 미리보기'}</small>}
          <span aria-hidden="true">↗</span>
        </button>)}
      </div>
      <div className="lesson-visual">
        <p className="carousel-hint caption" id={instructionsId}>운동 파트를 고르거나 사진을 좌우로 넘겨보세요.</p>
        <div className="carousel" id={railId} ref={railRef} role="region" aria-label="운동 내용 캐러셀" aria-roledescription="캐러셀" aria-describedby={instructionsId} tabIndex={0}
          onKeyDown={onKeyDown} onScroll={onScroll} onPointerDown={takeManualControl}
          onWheel={event => { if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey) takeManualControl(); }}>
          {parts.map((part, i) => <figure className="slide" key={`${program}-${i}`} aria-hidden={i !== index} inert={i !== index} role="group" aria-roledescription="슬라이드" aria-label={`${i + 1} / ${parts.length}: ${part.title}`}>
            {part.video && i === index && !moving && assets()[part.video]
              ? <ClassVideo key={`${program}-${i}`} part={part}/>
              : <ExercisePhoto part={part}/>}
          </figure>)}
        </div>
        <div className="carousel-bottom">
          <div className="carousel-caption" aria-live="polite" aria-atomic="true">
            <h4>{current.title}</h4>
            <p>{current.description}</p>
            {current.video && !assets()[current.video] && <p className="caption">영상 포함본에서는 실제 수업 영상을 재생할 수 있습니다.</p>}
          </div>
          <div className="carousel-controls">
            <button type="button" aria-label="이전 운동 장면" disabled={index === 0} onClick={() => step(index - 1)}>←</button>
            <span aria-label={`${parts.length}개 중 ${index + 1}번째`}>{index + 1} / {parts.length}</span>
            <button type="button" aria-label="다음 운동 장면" disabled={index === parts.length - 1} onClick={() => step(index + 1)}>→</button>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
