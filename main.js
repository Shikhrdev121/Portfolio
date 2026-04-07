document.addEventListener("DOMContentLoaded", () => {
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

      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });
});

