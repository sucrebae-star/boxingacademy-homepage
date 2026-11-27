import React, {useEffect, useRef, useState} from 'react';
import articles from '../press-articles.json';

const style = `.academy-press{background:#202326;color:#f8f6f0;border-left:5px solid #c51f2e;box-sizing:border-box;margin:0;padding:12px 0}.academy-press .press-inner{display:flex;align-items:center;gap:14px;flex-wrap:wrap}.academy-press .press-badge{font-weight:800;font-size:12px;border:1px solid #f8f6f0;border-radius:13px;padding:4px 10px;white-space:nowrap}.academy-press .press-info{min-width:130px;flex:1;display:grid;gap:3px;line-height:1.45;word-break:keep-all}.academy-press .press-info small{color:#d2d1cd;font-size:11px}.academy-press .press-info strong{font-size:15px}.academy-press .press-link{flex-shrink:0;color:#fff;text-decoration:none;border:1px solid #fff;padding:9px 14px;font-weight:800;font-size:13px;border-radius:3px;white-space:nowrap}.academy-press .press-controls{display:flex;gap:8px;align-items:center;font-size:12px}.academy-press .press-controls button{border:1px solid #ddd;background:transparent;color:#fff;padding:7px 12px;border-radius:3px;cursor:pointer}.academy-press a:focus-visible,.academy-press button:focus-visible{outline:2px solid #fff;outline-offset:3px}@media(max-width:480px){.academy-press .press-inner{gap:7px}.academy-press .press-info strong{font-size:13px}.academy-press .press-link{font-size:11px;padding:7px 9px}.academy-press .press-badge{font-size:10px;padding:3px 7px}}`;
export default function PressCarousel() {
  const [index,setIndex]=useState(0),[visible,setVisible]=useState(false),[hover,setHover]=useState(false),[focused,setFocused]=useState(false);
  const root=useRef(null), count=articles.length;
  useEffect(()=>{
    if(count<2)return;
    if(!('IntersectionObserver' in window)){setVisible(true);return;}
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));
    if(root.current)observer.observe(root.current);
    return()=>observer.disconnect();
  },[count]);
  useEffect(()=>{
    if(count<2||!visible||hover||focused)return;
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer;
    const sync=()=>{clearInterval(timer);if(!document.hidden&&!motion.matches)timer=setInterval(()=>setIndex(i=>(i+1)%count),7000);};
    sync(); document.addEventListener('visibilitychange',sync);motion.addEventListener?.('change',sync);
    return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',sync);motion.removeEventListener?.('change',sync);};
  },[count,visible,hover,focused]);
  if(!count)return null;
  const current=articles[index%count];
  return <section className="academy-press" ref={root} aria-label="전주효천관 언론보도" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocus={()=>setFocused(true)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false)}}>
    <style>{style}</style><div className="shell press-inner">
      <span className="press-badge">언론보도</span><div className="press-info"><small>{current.publisher} · {current.date.replaceAll('-','.')}</small><strong title={current.title}>{current.title}</strong></div>
      <a className="press-link" href={current.url} target="_blank" rel="noopener noreferrer">기사 원문 보기 ↗</a>
      {count>1&&<div className="press-controls"><button type="button" aria-label="이전 기사" onClick={()=>setIndex(i=>(i+count-1)%count)}>‹</button><span>{index+1} / {count}</span><button type="button" aria-label="다음 기사" onClick={()=>setIndex(i=>(i+1)%count)}>›</button></div>}
    </div></section>;
}
