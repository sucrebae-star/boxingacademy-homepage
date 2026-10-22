const sections = new Set(['about', 'programs', 'pricing', 'guide', 'visit']);
const legacy = {about:'about', programs:'programs', pricing:'pricing', schedule:'guide', facilities:'visit', contact:'visit', reservation:'visit', booking:'visit'};

export function parseRoute(hash = '') {
  const [name, section] = hash.replace(/^#/, '').split('/');
  if (legacy[name]) return {page:'jeonju', section:legacy[name]};
  const page = ['yeoksam', 'jeonju', 'collaboration'].includes(name) ? name : 'home';
  return {page, section: sections.has(section) && ['yeoksam','jeonju'].includes(page) ? section : null};
}

export function motionBehavior() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
}
