// Parse only the small, reviewed Markdown dialect used by the approved source.
export function parseParentGuide(raw) {
  const sections = raw.split(/^## /m).slice(1).map(part => {
    const [heading, ...lines] = part.split('\n');
    return {heading, body: lines.join('\n').replace(/\n---\s*$/, '').trim()};
  });
  const hero = sections.find(s => s.heading.includes('히어로'))?.body || '';
  const closing = sections.find(s => s.heading.includes('마무리'))?.body || '';
  const field = (body, name) => body.match(new RegExp('\\*\\*' + name + ':\\*\\* ?([^\\n]+)'))?.[1] || '';
  const folds = sections.filter(s => /^\[폴드 [1-8]\]/.test(s.heading)).map(s => ({
    id: Number(s.heading.match(/\[폴드 (\d)\]/)[1]),
    title: s.heading.replace(/^\[폴드 \d\] /, ''),
    summary: field(s.body, '요약'),
    detail: s.body.split(/^\*\*상세:\*\*[^\n]*\n/m)[1]?.trim() || '',
  }));
  if (folds.length !== 8 || folds.some(f => !f.summary || !f.detail)) throw Error('Incomplete approved parent guide');
  return {
    title: field(hero, '타이틀'), subtitle: field(hero, '서브타이틀'),
    intro: hero.split('**짧은 소개:**')[1]?.trim() || '', folds,
    closing: field(closing, '문구'), button: field(closing, '버튼').split(' (→')[0],
    sources: sections.find(s => s.heading.startsWith('참고 출처'))?.body || '',
  };
}

export const typingRelease = Object.freeze({
  version: '0.1.6', platform: 'macOS · Apple Silicon (M1 이상)', bytes: 31963264,
  url: 'https://github.com/sucrebae-star/boxingacademy-homepage/releases/download/typing-academy-v0.1.6-downloads/TypingAcademy-0.1.6-macOS-arm64.zip',
  fallbackUrl: 'https://app.boxingacademy.pe.kr/assets/typing-academy/releases/0.1.6/TypingAcademy-0.1.6-macOS-arm64.zip',
  sha256: '739b90f1cd48efcde29b2029dab26282ed817a4355d4fec43974128d36581a12',
});

export const windowsTrialRelease = Object.freeze({
  version:'0.1.6', bytes:248494427,
  url:'https://github.com/sucrebae-star/boxingacademy-homepage/releases/download/typing-academy-v0.1.6-downloads/TypingAcademy-0.1.6-windows-x86_64-setup.exe',
  fallbackUrl:'https://app.boxingacademy.pe.kr/assets/typing-academy/releases/0.1.6/TypingAcademy-0.1.6-windows-x86_64-setup.exe',
  sha256:'30c3d88ee6ab27fbd529a2d6af361c9007809d4cffc43e236f95581dd7561174',
});

export function isMobileDownloadClient(client = {}) {
  const ua = client.userAgent || '';
  return Boolean(client.userAgentData?.mobile || client.userAgentData?.platform === 'Android' || /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Kindle|Silk\//i.test(ua) || (client.platform === 'MacIntel' && client.maxTouchPoints > 1) || (/^Linux arm/i.test(client.platform || '') && client.maxTouchPoints > 0));
}
