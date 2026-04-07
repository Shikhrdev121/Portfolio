document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector("header");
  const headerOffset = () => (header ? header.getBoundingClientRect().height : 0);

  const setNavOffsetVar = () => {
    const offsetPx = Math.round(headerOffset() + 12);
    document.documentElement.style.setProperty("--nav-offset", `${offsetPx}px`);
  };

  setNavOffsetVar();
  window.addEventListener("resize", setNavOffsetVar);


  // Smooth mouse-wheel scrolling (Windows wheel can feel "hard"/steppy).
  // Applies only to classic wheel deltas (not trackpad micro-deltas).
  if (!prefersReducedMotion) {
    const scrollingElement = document.scrollingElement || document.documentElement;
    let targetScrollTop = scrollingElement.scrollTop;
    let isTicking = false;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const maxScrollTop = () =>
      Math.max(0, scrollingElement.scrollHeight - window.innerHeight);

    const animate = () => {
      isTicking = true;
      const current = scrollingElement.scrollTop;
      const next = current + (targetScrollTop - current) * 0.18;
      scrollingElement.scrollTop = Math.abs(next - targetScrollTop) < 0.5 ? targetScrollTop : next;

      if (Math.abs(scrollingElement.scrollTop - targetScrollTop) > 0.5) {
        requestAnimationFrame(animate);
      } else {
        isTicking = false;
      }
    };

    window.addEventListener(
      "wheel",
      (event) => {
        if (event.ctrlKey) return; // keep browser zoom behavior

        // Trackpads send many small deltas; let them behave natively.
        if (Math.abs(event.deltaY) < 50) return;

        event.preventDefault();

        const multiplier = event.deltaMode === 1 ? 32 : event.deltaMode === 2 ? window.innerHeight : 1;
        targetScrollTop = clamp(
          targetScrollTop + event.deltaY * multiplier,
          0,
          maxScrollTop(),
        );

        if (!isTicking) requestAnimationFrame(animate);
      },
      { passive: false },
    );

    window.addEventListener("scroll", () => {
      if (!isTicking) targetScrollTop = scrollingElement.scrollTop;
    });
  }

  // Mobile menu toggle
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const primaryNav = document.getElementById("primary-nav");
  if (mobileBtn && primaryNav) {
    mobileBtn.addEventListener("click", () => {
      primaryNav.classList.toggle("hidden");
    });
    // Close on nav link click
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        primaryNav.classList.add("hidden");
      });
    });
  }

  const navLinks = document.querySelectorAll(".nav-link");
  const navLinksById = new Map();

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#") || href.length < 2) return;
    navLinksById.set(href.slice(1), link);
  });

  const setActiveLink = (activeLink) => {
    navLinks.forEach((l) => l.classList.toggle("active", l === activeLink));
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setActiveLink(link);

      const targetId = link.getAttribute("href");
      if (!targetId) return;

      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;

      if (prefersReducedMotion) {
        const y =
          targetSection.getBoundingClientRect().top +
          window.scrollY -
          headerOffset();
        window.scrollTo(0, y);
        return;
      }

      const startY = window.scrollY;
      const targetY =
        targetSection.getBoundingClientRect().top +
        window.scrollY -
        headerOffset();
      const distance = targetY - startY;
      const durationMs = 280;
      const startTime = performance.now();

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / durationMs);
        const y = startY + distance * easeOutCubic(t);
        window.scrollTo(0, y);
        if (t < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });
  });

  // Update active nav item based on scroll position.
  if ("IntersectionObserver" in window && navLinksById.size) {
    const sections = Array.from(navLinksById.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const pickActive = (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));

      const topMost = visible[0];
      if (!topMost) return;

      const activeLink = navLinksById.get(topMost.target.id);
      if (activeLink) setActiveLink(activeLink);
    };

    let lastEntries = [];
    let observer = null;

    const setupObserver = () => {
      if (observer) observer.disconnect();
      lastEntries = [];

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const idx = lastEntries.findIndex((e) => e.target === entry.target);
            if (idx >= 0) lastEntries[idx] = entry;
            else lastEntries.push(entry);
          });
          pickActive(lastEntries);
        },
        {
          root: null,
          rootMargin: `-${Math.round(headerOffset() + 12)}px 0px -25% 0px`,
          threshold: [0, 0.25, 0.5],
        },

      );

      sections.forEach((section) => observer.observe(section));
    };

    setupObserver();

    window.addEventListener("resize", () => {
      setupObserver();
    });
  }
});
