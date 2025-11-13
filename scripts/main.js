// scripts/main.js

/**
 * Clase ScrubVideoManager
 * Inspirada en el tutorial de Chris How.
 * Gestiona videos que se reproducen hacia adelante y hacia atrás con el scroll.
 */
class ScrubVideoManager {
  constructor() {
    this.scrubVideoWrappers = document.querySelectorAll(".scrub-video-wrapper");
    if (this.scrubVideoWrappers.length === 0) return;

    // Solo activar en pantallas de escritorio
    if (window.innerWidth < 1024) return;

    this.scrubVideoWrappersData = [];
    this.activeVideoWrapper = null;

    // 1. Crear el IntersectionObserver
    const observer = new IntersectionObserver(
      this.intersectionObserverCallback,
      {
        threshold: 0.2, // Se activa cuando el 20% del video es visible
      }
    );
    observer.context = this; // Pasar el contexto de la clase al callback

    // 2. Configurar cada contenedor de video
    this.scrubVideoWrappers.forEach((wrapper, index) => {
      const videoContainer = wrapper.querySelector(".scrub-video-container");
      if (videoContainer) {
        observer.observe(videoContainer);
      }

      wrapper.setAttribute("data-scrub-video-index", index);
      const video = wrapper.querySelector("video");
      const videoLoader = wrapper.querySelector("#video-loader");

      this.scrubVideoWrappersData[index] = { video, videoLoader };

      this.fetchVideo(video);
    });

    // 3. Calcular y almacenar posiciones
    this.updateWrapperPositions();

    // 4. Añadir listeners para scroll y resize
    window.addEventListener("resize", () => this.updateWrapperPositions());
    document.addEventListener("scroll", (event) =>
      this.handleScrollEvent(event)
    );
  }

  // Carga el video completo usando Fetch para un scrubbing fluido
  fetchVideo(videoElement) {
    const srcWebm = videoElement.getAttribute("data-src-webm");
    const srcMp4 = videoElement.getAttribute("data-src-mp4");
    const videoLoader = this.scrubVideoWrappersData.find(
      (d) => d.video === videoElement
    )?.videoLoader;

    const loadSource = (src) => {
      return fetch(src)
        .then((response) => response.blob())
        .then((response) => {
          const objectURL = URL.createObjectURL(response);
          videoElement.setAttribute("src", objectURL);
          if (videoLoader) videoLoader.style.display = "none";
          videoElement.parentElement.classList.add("loaded");
        });
    };

    // Intenta cargar WebM, si falla, carga MP4
    loadSource(srcWebm).catch(() => loadSource(srcMp4));
  }

  // Calcula y guarda las posiciones de inicio y fin de los contenedores
  updateWrapperPositions() {
    this.scrubVideoWrappers.forEach((wrapper, index) => {
      const rect = wrapper.getBoundingClientRect();
      const top = rect.y + window.scrollY;
      const bottom = top + wrapper.scrollHeight - window.innerHeight;
      this.scrubVideoWrappersData[index].top = top;
      this.scrubVideoWrappersData[index].bottom = bottom;
    });
  }

  // Callback para cuando un video entra o sale del viewport
  intersectionObserverCallback(entries, observer) {
    entries.forEach((entry) => {
      const isIntersecting = entry.isIntersecting;
      const wrapper = entry.target.closest(".scrub-video-wrapper");

      if (isIntersecting) {
        observer.context.activeVideoWrapper = wrapper.getAttribute(
          "data-scrub-video-index"
        );
      } else {
        // Si el video que sale es el que estaba activo, lo desactivamos
        if (
          observer.context.activeVideoWrapper ===
          wrapper.getAttribute("data-scrub-video-index")
        ) {
          observer.context.activeVideoWrapper = null;
        }
      }
    });
  }

  // Gestiona el evento de scroll
  handleScrollEvent(event) {
    if (this.activeVideoWrapper !== null) {
      const activeWrapperData =
        this.scrubVideoWrappersData[this.activeVideoWrapper];
      const { top, bottom, video } = activeWrapperData;

      if (!video.duration) return; // Salir si el video aún no tiene duración

      // Calcula el progreso del scroll dentro del contenedor (un número de 0 a 1)
      const progress = Math.max(
        0,
        Math.min(0.998, (window.scrollY - top) / (bottom - top))
      );

      const seekTime = progress * video.duration;
      video.currentTime = seekTime;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // --- INICIA EL GESTOR DE VIDEO CON SCROLL ---
  new ScrubVideoManager();

  // Se mantiene el resto del código original que no afecta al video
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

  // --- LÓGICA DEL PARALLAX DEL HERO ---
  const heroBackground = document.getElementById("hero-background");
  if (heroBackground) {
    ScrollTrigger.matchMedia({
      "(max-width: 1023px)": function () {
        gsap.to(heroBackground, {
          xPercent: -15,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      },
      "(min-width: 1024px)": function () {
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
