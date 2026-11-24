if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const { isIntersecting, target } of entries) {
      if (!isIntersecting) continue;
      target.classList.add('featured-enter');
      observer.unobserve(target);
    }
  }, { rootMargin: '0px 0px -25px 0px' });
  document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
}
