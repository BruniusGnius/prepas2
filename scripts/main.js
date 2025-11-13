// scripts/main.js

/**
 * Clase ScrubVideoManager
 * Inspirada en el tutorial de Chris How.
 * Gestiona videos que se reproducen hacia adelante y hacia atrás con el scroll.
 */
class ScrubVideoManager {
  constructor() {
    // Solo ejecutar en pantallas de escritorio, donde el efecto es visible.
    if (window.innerWidth < 1024) return;

    this.contenedores = document.querySelectorAll(".scrub-video-wrapper");
    if (this.contenedores.length === 0) return;

    this.datosVideo = [];
    this.videoActivo = null;

    // 1. Crear el IntersectionObserver
    const observer = new IntersectionObserver(
      this.intersectionObserverCallback,
      {
        // Umbral más bajo para detectar el video apenas entra en la vista
        threshold: 0.1,
      }
    );
    observer.contexto = this; // Referencia a la clase para usarla en el callback

    // 2. Configurar cada video
    this.contenedores.forEach((contenedor, index) => {
      const videoContainer = contenedor.querySelector(".scrub-video-container");
      if (videoContainer) {
        observer.observe(videoContainer);
      }

      contenedor.setAttribute("data-scrub-video-index", index);
      const video = contenedor.querySelector("video");
      const cargador = contenedor.querySelector("#video-loader");

      this.datosVideo[index] = { video, cargador };

      // 3. Forzar la carga del video para un scrubbing sin lag
      this.fetchVideo(video);
    });

    // 4. Calcular y almacenar las posiciones de los contenedores
    // Usamos un pequeño timeout para asegurar que el layout esté completamente calculado
    setTimeout(() => this.actualizarPosiciones(), 100);

    // 5. Añadir listeners para scroll y resize
    window.addEventListener("resize", () => this.actualizarPosiciones());
    document.addEventListener("scroll", (evento) =>
      this.handleScrollEvent(evento)
    );
  }

  fetchVideo(videoElement) {
    const srcWebm = videoElement.getAttribute("data-src-webm");
    const srcMp4 = videoElement.getAttribute("data-src-mp4");
    const datos = this.datosVideo.find((d) => d.video === videoElement);

    const cargarFuente = (src) => {
      return fetch(src)
        .then((response) => response.blob())
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob);
          videoElement.src = objectURL;
          if (datos && datos.cargador) {
            datos.cargador.style.display = "none";
          }
        });
    };

    cargarFuente(srcWebm).catch(() => cargarFuente(srcMp4));
  }

  actualizarPosiciones() {
    this.contenedores.forEach((contenedor, index) => {
      const rect = contenedor.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = top + contenedor.scrollHeight - window.innerHeight;
      this.datosVideo[index].top = top;
      this.datosVideo[index].bottom = bottom;
    });
  }

  intersectionObserverCallback(entries, observer) {
    entries.forEach((entry) => {
      const contenedor = entry.target.closest(".scrub-video-wrapper");
      const index = contenedor.getAttribute("data-scrub-video-index");

      if (entry.isIntersecting) {
        observer.contexto.videoActivo = index;
      } else {
        if (observer.contexto.videoActivo === index) {
          observer.contexto.videoActivo = null;
        }
      }
    });
  }

  handleScrollEvent() {
    if (this.videoActivo === null) return;

    const datos = this.datosVideo[this.videoActivo];
    const { top, bottom, video } = datos;

    if (!video.duration) return;

    const progreso = Math.max(
      0,
      Math.min(0.998, (window.scrollY - top) / (bottom - top))
    );
    const tiempo = progreso * video.duration;

    video.currentTime = tiempo;
  }
}

/**
 * =========================================================================
 *  Inicialización del Código Cuando el DOM está Listo
 * =========================================================================
 */
document.addEventListener("DOMContentLoaded", () => {
  // PRIMERO: Inicializamos el gestor de video.
  new ScrubVideoManager();

  // SEGUNDO: Inicializamos el resto de las animaciones GSAP.
  // Este código no interfiere con el gestor de video.
  gsap.registerPlugin(ScrollTrigger);

  // Lógica del menú de hamburguesa
  const hamburgerButton = document.getElementById("hamburger-button");
  const mobileMenu = document.getElementById("mobile-menu");
  if (hamburgerButton && mobileMenu) {
    hamburgerButton.addEventListener("click", () =>
      mobileMenu.classList.toggle("hidden")
    );
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => mobileMenu.classList.add("hidden"));
    });
  }

  // Parallax del Hero
  const heroBackground = document.getElementById("hero-background");
  if (heroBackground) {
    gsap.to(heroBackground, {
      yPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // --- LÓGICA DEL PARALLAX DEL CTA ---
  const ctaBackground = document.getElementById("cta-background");
  if (ctaBackground) {
    gsap.to(ctaBackground, {
      yPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: "#cta",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // --- LÓGICA DEL PARALLAX ZOOM EN SECCIÓN 'PROBLEM' ---
  const zoomContainer = document.getElementById("zoom-container");
  const zoomImage = document.getElementById("zoom-image");
  if (zoomContainer && zoomImage) {
    gsap.to(zoomImage, {
      scale: 1.15,
      ease: "none",
      scrollTrigger: {
        trigger: zoomContainer,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // --- LÓGICA DEL PARALLAX DE 'TEACHER AUGMENTATION' (SOLO DESKTOP) ---
  const teacherBg = document.getElementById("teacher-parallax-bg");
  if (teacherBg) {
    ScrollTrigger.matchMedia({
      "(min-width: 1024px)": function () {
        gsap.to(teacherBg, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: "#teacher-augmentation-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      },
    });
  }

  // --- ANIMACIÓN DE CONTADORES CON "IMPACTO DE VIDRIO" ---
  const shakeCard = (cardElement) => {
    if (!cardElement) return;
    let tl = gsap.timeline();
    tl.to(cardElement, { duration: 0.03, x: -7, y: 5, rotate: -1.5 })
      .to(cardElement, { duration: 0.03, x: 5, y: -3, rotate: 1 })
      .to(cardElement, { duration: 0.03, x: -4, y: 2, rotate: -1 })
      .to(cardElement, { duration: 0.03, x: 2, y: -1, rotate: 0.5 })
      .to(cardElement, { duration: 0.03, x: 0, y: 0, rotate: 0 });
  };

  const counters = [
    { id: "counter-1", endValue: 11000, duration: 600 },
    { id: "counter-2", endValue: 4000, duration: 400 },
  ];

  counters.forEach((counterInfo) => {
    const element = document.getElementById(counterInfo.id);
    if (element) {
      ScrollTrigger.create({
        trigger: element,
        start: "top 85%",
        toggleActions: "play none none none",
        once: true,
        onEnter: () => {
          let startTime = Date.now();
          let interval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime >= counterInfo.duration) {
              clearInterval(interval);
              element.innerText = counterInfo.endValue.toLocaleString("en-US");
              shakeCard(element.closest(".flex-1"));
              return;
            }
            const randomNum = Math.floor(Math.random() * counterInfo.endValue);
            element.innerText = randomNum.toLocaleString("en-US");
          }, 40);
        },
      });
    }
  });

  const milesElement = document.getElementById("counter-3");
  if (milesElement) {
    gsap.set(milesElement, { autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: milesElement,
      start: "top 85%",
      toggleActions: "play none none none",
      once: true,
      onEnter: () => {
        gsap.to(milesElement, {
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => shakeCard(milesElement.closest(".flex-1")),
        });
      },
    });
  }

  // --- LÓGICA DEL PARALLAX DEL REMATE ---
  const remateBackground = document.getElementById("remate-background");
  if (remateBackground) {
    ScrollTrigger.matchMedia({
      "(max-width: 1023px)": function () {
        gsap.to(remateBackground, {
          xPercent: -15,
          ease: "none",
          scrollTrigger: {
            trigger: "#remate-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      },
      "(min-width: 1024px)": function () {
        gsap.to(remateBackground, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: "#remate-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      },
    });
  }
});
