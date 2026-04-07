document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const targetId = link.getAttribute("href");
      if (!targetId) return;

      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;

      if (prefersReducedMotion) {
        targetSection.scrollIntoView({ block: "start" });
        return;
      }

      const startY = window.scrollY;
      const targetY =
        targetSection.getBoundingClientRect().top + window.scrollY;
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
});
