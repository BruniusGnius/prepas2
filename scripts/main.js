// scripts/main.js

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // --- LÓGICA DEL MENÚ DE HAMBURGUESA ---
  const hamburgerButton = document.getElementById("hamburger-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (hamburgerButton && mobileMenu) {
    hamburgerButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }

  // --- LÓGICA DEL PARALLAX DEL HERO (RESPONSIVO) ---
  const heroBackground = document.getElementById("hero-background");
  if (heroBackground) {
    ScrollTrigger.matchMedia({
      "(max-width: 1023px)": function () {
        /* ... Parallax Móvil ... */
      },
      "(min-width: 1024px)": function () {
        /* ... Parallax Desktop ... */
      },
    });
  }

  // --- LÓGICA DE LA SECCIÓN PINNED CON SCROLL INTERNO (VERSIÓN FINAL) ---
  const pinnedSection = document.getElementById("pinned-section-container");
  const rightColumn = document.getElementById("right-column");
  const scrollContent = document.getElementById("scroll-content");

  ScrollTrigger.matchMedia({
    "(min-width: 1024px)": function () {
      if (pinnedSection && rightColumn && scrollContent) {
        // Calculamos la distancia exacta que debe recorrer el contenido
        const scrollDistance =
          scrollContent.offsetHeight - rightColumn.offsetHeight;

        gsap.to(scrollContent, {
          // Animamos el contenido hacia arriba por esa distancia exacta
          y: -scrollDistance,
          ease: "none",
          scrollTrigger: {
            trigger: pinnedSection,
            start: "top top",
            // La duración del 'pin' es igual a la distancia que se va a recorrer
            end: () => "+=" + scrollDistance,
            scrub: true,
            pin: true,
            anticipatePin: 1,
          },
        });
      }
    },
  });
});
