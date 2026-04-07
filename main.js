document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector('header');
  const headerOffset = () => header ? header.getBoundingClientRect().height : 0;

  // Set CSS var for scroll-margin
  const setNavOffsetVar = () => {
    document.documentElement.style.setProperty('--nav-offset', `${Math.round(headerOffset() + 12)}px`);
  };
  setNavOffsetVar();
  window.addEventListener('resize', setNavOffsetVar);

  const navLinks = document.querySelectorAll('.nav-link');
  const setActiveHref = (activeHref) => navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === activeHref));

  // Active link on scroll (IntersectionObserver)
  const sections = Array.from(navLinks, link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

  let observer = null;
  const initObserver = () => {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => {
      const topMost = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (topMost) setActiveHref(`#${topMost.target.id}`);
    }, {
      rootMargin: `-${headerOffset() + 12}px 0px -25% 0px`,
      threshold: [0, 0.25, 0.5]
    });

    sections.forEach(section => observer.observe(section));
  };

  initObserver();
  let resizeRaf = null;
  window.addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null;
      initObserver();
    });
  });

  // Mobile hamburger menu toggle
  const hamburger = document.querySelector('button.md\\:hidden');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = hamburger?.querySelector('.menu-icon');
  if (hamburger && mobileMenu && menuIcon) {
    const setMenuOpen = (open) => {
      mobileMenu.classList.toggle('hidden', !open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuIcon.textContent = open ? 'close' : 'menu';
      menuIcon.setAttribute('data-icon', open ? 'close' : 'menu');
      document.body.classList.toggle('overflow-hidden', open);
    };

    hamburger.addEventListener('click', () => {
      setMenuOpen(mobileMenu.classList.contains('hidden'));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        setMenuOpen(false);
      }
    });

    // Close on nav link click
    document.querySelectorAll('#mobile-menu .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        setMenuOpen(false);
      });
    });
  }
});
