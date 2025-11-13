// scripts/main.js

/**
 * Inicia la descarga de un video en segundo plano tan pronto como la página se carga.
 * @param {string} videoId - El ID del elemento <video>.
 */
function preloadVideoInBackground(videoId) {
  const video = document.getElementById(videoId);
  if (!video) return;

  const source = video.querySelector("source");
  const videoUrl = source.getAttribute("data-src");
  const loader = document.getElementById("video-loader");

  if (videoUrl) {
    fetch(videoUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const objectURL = URL.createObjectURL(blob);
        video.src = objectURL;
        video.addEventListener(
          "loadeddata",
          () => {
            if (loader) loader.style.opacity = "0";
          },
          { once: true }
        );
      })
      .catch((err) => {
        console.error("No se pudo precargar el video:", err);
        if (loader) loader.style.display = "none";
      });
  }
}

/**
 * Clase que gestiona la animación de video mediante scroll.
 */
class ScrubVideoManager {
  constructor() {
    this.scrubVideoWrappers = document.querySelectorAll(".scrub-video-wrapper");
    if (this.scrubVideoWrappers.length === 0) return;
    if (window.innerWidth < 1024) return;
    this.scrubVideoWrappersData = [];
    this.activeVideoWrapper = null;
    const observer = new IntersectionObserver(
      this.intersectionObserverCallback.bind(this),
      { threshold: 0.1 }
    );
    this.scrubVideoWrappers.forEach((wrapper, index) => {
      const videoContainer = wrapper.querySelector(".scrub-video-container");
      if (videoContainer) observer.observe(videoContainer);
      wrapper.setAttribute("data-scrub-video-index", index);
      const video = wrapper.querySelector("video");
      this.scrubVideoWrappersData[index] = { video: video };
    });
    this.updateWrapperPositions();
    window.addEventListener("resize", () => this.updateWrapperPositions());
    document.addEventListener("scroll", (event) =>
      this.handleScrollEvent(event)
    );
  }
  updateWrapperPositions() {
    this.scrubVideoWrappers.forEach((wrapper, index) => {
      const rect = wrapper.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = rect.bottom - window.innerHeight + window.scrollY;
      this.scrubVideoWrappersData[index].top = top;
      this.scrubVideoWrappersData[index].bottom = bottom;
    });
  }
  intersectionObserverCallback(entries) {
    entries.forEach((entry) => {
      const wrapperIndex = entry.target.parentNode.getAttribute(
        "data-scrub-video-index"
      );
      if (entry.isIntersecting) {
        this.activeVideoWrapper = wrapperIndex;
      } else {
        if (this.activeVideoWrapper === wrapperIndex)
          this.activeVideoWrapper = null;
      }
    });
  }
  handleScrollEvent() {
    if (this.activeVideoWrapper !== null) {
      const activeWrapperData =
        this.scrubVideoWrappersData[this.activeVideoWrapper];
      const { top, bottom, video } = activeWrapperData;
      if (!video || isNaN(video.duration) || video.duration === 0) return;
      const progress = Math.max(
        0,
        Math.min(0.998, (window.scrollY - top) / (bottom - top))
      );
      video.currentTime = progress * video.duration;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // ==================================================================
  // 1. INICIA LA DESCARGA DEL VIDEO INMEDIATAMENTE
  // ==================================================================
  preloadVideoInBackground("bg-video");

  // ==================================================================
  // 2. INICIALIZA EL GESTOR DE SCROLL
  // ==================================================================
  new ScrubVideoManager();

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

  // --- ANIMACIÓN DE CONTADORES ---
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
