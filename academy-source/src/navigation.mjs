const sections = new Set(['about', 'programs', 'pricing', 'guide', 'visit', 'typing', 'record', 'philosophy']);
const legacy = {about:'about', programs:'programs', pricing:'pricing', schedule:'guide', facilities:'visit', contact:'visit', reservation:'visit', booking:'visit'};

export function parseRoute(hash = '') {
  const [name, section, article, ...rest] = hash.replace(/^#/, '').split('/');
  if (/^guide-[1-8]$/.test(name) || ['typing-download','typing-guide','typing-app','minecraft-education'].includes(name)) return {page:'jeonju',section:'typing',anchor:name};
  if (legacy[name]) return {page:'jeonju', section:legacy[name]};
  const page = ['yeoksam', 'jeonju', 'collaboration'].includes(name) ? name : 'home';
  if (page === 'jeonju' && section === 'philosophy') {
    return {page, section, ...(article && rest.length === 0 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article) ? {article} : {})};
  }
  return {page, section: sections.has(section) && (!['typing','record','philosophy'].includes(section) || page === 'jeonju') && ['yeoksam','jeonju'].includes(page) ? section : null};
}

export function motionBehavior() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
}
