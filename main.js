document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector('header');
  const headerOffset = () => header ? header.getBoundingClientRect().height : 0;

  // Theme (dark mode) toggle
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleIcon = document.getElementById('theme-toggle-icon');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const themeToggleIconMobile = document.getElementById('theme-toggle-icon-mobile');

  const getSystemPrefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const getStoredTheme = () => {
    try { return localStorage.getItem('theme'); } catch { return null; }
  };
  const storeTheme = (theme) => {
    try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
  };

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    const icon = isDark ? 'light_mode' : 'dark_mode';
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    if (themeToggle) themeToggle.setAttribute('aria-label', label);
    if (themeToggleMobile) themeToggleMobile.setAttribute('aria-label', label);
    if (themeToggleIcon) {
      themeToggleIcon.textContent = icon;
      themeToggleIcon.setAttribute('data-icon', icon);
    }
    if (themeToggleIconMobile) {
      themeToggleIconMobile.textContent = icon;
      themeToggleIconMobile.setAttribute('data-icon', icon);
    }
  };

  const initTheme = () => {
    const stored = getStoredTheme();
    const initial = stored === 'dark' || stored === 'light' ? stored : (getSystemPrefersDark() ? 'dark' : 'light');
    applyTheme(initial);
  };
  initTheme();

  const setTheme = (theme) => {
    storeTheme(theme);
    applyTheme(theme);
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  };

  themeToggle?.addEventListener('click', toggleTheme);
  themeToggleMobile?.addEventListener('click', toggleTheme);

  // Optional compatibility with inline onclick="toggleDarkMode()"
  window.toggleDarkMode = toggleTheme;

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
  const hamburger = document.querySelector('button[aria-controls="mobile-menu"]');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = hamburger?.querySelector('.menu-icon');
  if (hamburger && mobileMenu && menuIcon) {
    const setMenuOpen = (open) => {
      mobileMenu.classList.toggle('hidden', !open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamburger.classList.toggle('bg-slate-100', open);
      hamburger.classList.toggle('dark:bg-slate-800', open);
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
    document.querySelectorAll('#mobile-menu a').forEach(link => {
      link.addEventListener('click', () => {
        setMenuOpen(false);
      });
    });
  }
});
