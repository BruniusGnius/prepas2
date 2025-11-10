// scripts/main.js

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // --- LÓGICA DEL MENÚ DE HAMBURGUESA ---
  const hamburgerButton = document.getElementById("hamburger-button");
  const mobileMenu = document.getElementById("mobile-menu");
  if (hamburgerButton && mobileMenu) {
    // ... (código del menú)
  }

  // --- LÓGICA DEL PARALLAX DEL HERO ---
  const heroBackground = document.getElementById("hero-background");
  if (heroBackground) {
    // ... (código del parallax)
  }
});
// === Scrolltelling: InteligencIA para el Bien ===
gsap.registerPlugin(ScrollTrigger);

// Selecciona el video
const video = document.getElementById("bg-video");

// Sincroniza el video con el scroll (scrub)
if (video) {
  gsap.to(video, {
    currentTime: video.duration || 56, // duración estimada si aún no carga
    ease: "none",
    scrollTrigger: {
      trigger: "#video-scrub-section",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });
}

// Frases del lado derecho
const frases = document.querySelectorAll("#phrases p");

// Efecto fade + movimiento al entrar
frases.forEach((frase, i) => {
  gsap.fromTo(
    frase,
    { autoAlpha: 0, y: 100 },
    {
      autoAlpha: 1,
      y: 0,
      scrollTrigger: {
        trigger: frase,
        start: "top center+=150",
        end: "bottom center-=150",
        scrub: true,
      },
    }
  );
});
