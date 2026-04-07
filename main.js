dwoocument.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('header');
  const headerOffset = () => header ? header.getBoundingClientRect().height : 0;

  // Set CSS var for scroll-margin
  const setNavOffsetVar = () => {
    document.documentElement.style.setProperty('--nav-offset', `${Math.round(headerOffset() + 12)}px`);
  };
  setNavOffsetVar();
  window.addEventListener('resize', setNavOffsetVar);

  // Smooth wheel scroll (mouse wheel only)
  if (!prefersReducedMotion) {
    const scrollingElement = document.scrollingElement || document.documentElement;
    let targetScrollTop = scrollingElement.scrollTop;
    let isTicking = false;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const animate = () => {
      isTicking = true;
      const current = scrollingElement.scrollTop;
      const next = current + (targetScrollTop - current) * 0.18;
      scrollingElement.scrollTop = Math.abs(next - targetScrollTop) < 0.5 ? targetScrollTop : next;
      if (Math.abs(scrollingElement.scrollTop - targetScrollTop) > 0.5) requestAnimationFrame(animate);
      else isTicking = false;
    };

    window.addEventListener('wheel', (event) => {
      if (event.ctrlKey || Math.abs(event.deltaY) < 50) return;
      event.preventDefault();
      const multiplier = event.deltaMode === 1 ? 32 : 1;
      targetScrollTop = clamp(targetScrollTop + event.deltaY * multiplier, 0, document.documentElement.scrollHeight - window.innerHeight);
      if (!isTicking) requestAnimationFrame(animate);
    }, { passive: false });
  }

  const navLinks = document.querySelectorAll('.nav-link');
  const setActiveLink = (activeLink) => navLinks.forEach(l => l.classList.toggle('active', l === activeLink));

  // Navbar click handlers + smooth scroll
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveLink(link);
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.scrollY - headerOffset() - 20;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  // Active link on scroll (IntersectionObserver)
  const sections = Array.from(navLinks, link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const navLinksById = new Map([...navLinks].map(link => [link.getAttribute('href').slice(1), link]));

  const observerOptions = {
    rootMargin: `-${headerOffset() + 12}px 0px -25% 0px`,
    threshold: [0, 0.25, 0.5]
  };

  const observer = new IntersectionObserver((entries) => {
    const topMost = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (topMost) setActiveLink(navLinksById.get(topMost.target.id));
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
  window.addEventListener('resize', () => observer.disconnect() || observer.observe(sections));
});
