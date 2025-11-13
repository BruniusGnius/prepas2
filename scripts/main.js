// scripts/main.js

/**
 * Clase que gestiona la animación de video mediante scroll,
 * siguiendo el patrón del tutorial para un rendimiento óptimo.
 */
class ScrubVideoManager {
  constructor() {
    this.scrubVideoWrappers = document.querySelectorAll(".scrub-video-wrapper");
    if (this.scrubVideoWrappers.length === 0) return;

    // Solo activar en pantallas de escritorio
    if (window.innerWidth < 1024) return;

    this.scrubVideoWrappersData = [];
    this.activeVideoWrapper = null;

    const observer = new IntersectionObserver(
      this.intersectionObserverCallback,
      {
        threshold: 1,
      }
    );
    observer.context = this;

    this.scrubVideoWrappers.forEach((wrapper, index) => {
      const videoContainer = wrapper.querySelector(".scrub-video-container");
      if (videoContainer) {
        observer.observe(videoContainer);
      }

      wrapper.setAttribute("data-scrub-video-index", index);
      const video = wrapper.querySelector("video");
      const loader = wrapper.querySelector("#video-loader");

      this.scrubVideoWrappersData[index] = {
        video: video,
        loader: loader,
      };
      this.fetchVideo(video, loader);
    });

    this.updateWrapperPositions();

    window.addEventListener("resize", () => this.updateWrapperPositions());
    document.addEventListener("scroll", (event) =>
      this.handleScrollEvent(event)
    );
  }

  fetchVideo(videoElement, loaderElement) {
    const src = videoElement.getAttribute("src");
    if (!src) return;

    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        const objectURL = URL.createObjectURL(blob);
        videoElement.setAttribute("src", objectURL);
        if (loaderElement) {
          // Esperar a que el video pueda reproducirse para ocultar el loader
          videoElement.addEventListener(
            "canplay",
            () => {
              loaderElement.style.display = "none";
            },
            { once: true }
          );
        }
      });
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

  intersectionObserverCallback(entries, observer) {
    entries.forEach((entry) => {
      const isWithinViewport = entry.intersectionRatio === 1;
      entry.target.classList.toggle("in-view", isWithinViewport);

      if (isWithinViewport) {
        observer.context.activeVideoWrapper =
          entry.target.parentNode.getAttribute("data-scrub-video-index");
      } else {
        if (
          observer.context.activeVideoWrapper ===
          entry.target.parentNode.getAttribute("data-scrub-video-index")
        ) {
          observer.context.activeVideoWrapper = null;
        }
      }
    });
  }

  handleScrollEvent() {
    if (this.activeVideoWrapper !== null) {
      const activeWrapperData =
        this.scrubVideoWrappersData[this.activeVideoWrapper];
      const { top, bottom, video } = activeWrapperData;

      if (!video || isNaN(video.duration)) return;

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

  // ==================================================================
  // --- INICIALIZACIÓN DEL VIDEO MANAGER ---
  // La vieja lógica de scroll del video ha sido reemplazada por esta clase.
  new ScrubVideoManager();
  // ==================================================================

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
