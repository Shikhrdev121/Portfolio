document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      const durationMs = 450;
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
