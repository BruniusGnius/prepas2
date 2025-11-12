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
      // Solo activa la animación en pantallas 'lg' (1024px) y superiores
      "(min-width: 1024px)": function () {
        gsap.to(teacherBg, {
          yPercent: -20, // Mueve la imagen hacia arriba un 20%
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

  // --- LÓGICA DE SCROLLYTELLING CON PRECARGA FORZADA Y OBSERVER ---
  const videoWrapper = document.querySelector(".scrub-video-wrapper");

  if (videoWrapper) {
    const video = document.getElementById("bg-video");
    const videoLoader = document.getElementById("video-loader");
    let videoScrubAnimation; // Variable para guardar nuestra animación de GSAP

    // 1. FUNCIÓN DE PRECARGA FORZADA (Técnica del artículo)
    const forceVideoLoad = (videoElement) => {
      const srcWebm = "assets/adolescente-iav3.webm";
      const srcMp4 = "assets/adolescente-iav3.mp4";

      // Usamos la API Fetch para descargar el video como un 'blob'
      fetch(srcWebm)
        .then((response) => response.blob())
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob);
          const source = document.createElement("source");
          source.src = objectURL;
          source.type = "video/webm";
          videoElement.appendChild(source);
        })
        .catch(() => {
          // Si falla el WebM, intentamos con MP4
          fetch(srcMp4)
            .then((response) => response.blob())
            .then((blob) => {
              const objectURL = URL.createObjectURL(blob);
              const source = document.createElement("source");
              source.src = objectURL;
              source.type = "video/mp4";
              videoElement.appendChild(source);
            });
        });
    };

    // 2. FUNCIÓN QUE CREA LA ANIMACIÓN DE SCRUBBING
    const createVideoScrubAnimation = () => {
      // Se asegura de que el video esté listo
      if (video.readyState >= 2) {
        // Oculta el indicador de carga
        if (videoLoader) videoLoader.style.display = "none";

        // Creamos la animación de GSAP y la guardamos en la variable
        videoScrubAnimation = gsap.to(video, {
          currentTime: video.duration,
          ease: "none",
          scrollTrigger: {
            trigger: videoWrapper,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
      } else {
        requestAnimationFrame(createVideoScrubAnimation);
      }
    };

    // 3. EL INTERSECTION OBSERVER (Técnica del artículo)
    // Solo se ejecuta en desktop
    if (window.innerWidth >= 1024) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Cuando la sección entra en la pantalla, creamos la animación
              createVideoScrubAnimation();
            } else {
              // Cuando sale, destruimos la animación para ahorrar recursos
              if (videoScrubAnimation) {
                videoScrubAnimation.scrollTrigger.kill();
                videoScrubAnimation = null;
              }
            }
          });
        },
        { threshold: 0.1 }
      ); // Se activa cuando el 10% de la sección es visible

      // Empezamos a observar y a descargar el video
      observer.observe(videoWrapper);
      forceVideoLoad(video);
    }
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
