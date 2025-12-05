// Script dedicado para los contadores de sobre-nosotros.html
// Este script se ejecuta DESPUÉS de main.js y maneja solo los contadores de esta página

(function() {
  'use strict';
  
  // Esperamos a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }
  
  function initCounters() {
    const counter4 = document.getElementById('counter-4'); // Miles
    const counter5 = document.getElementById('counter-5'); // 50+
    const counter6 = document.getElementById('counter-6'); // 300+
    
    if (!counter4 && !counter5 && !counter6) return; // No estamos en sobre-nosotros.html
    
    // Función para animar el checkmark y la opacidad de la tarjeta
    function animateCheckmark(card) {
      if (!card) return;
      const badge = card.querySelector('.achievement-badge');
      if (badge && typeof gsap !== 'undefined') {
        // Obtener el índice del badge para crear secuencia
        const badgeIndex = parseInt(badge.getAttribute('data-badge-index')) || 0;
        
        // Delays personalizados para mejor ritmo visual
        const delays = [0.2, 0.35, 0.65]; // Miles, Colegios, Expertos (más espacio entre 2do y 3ro)
        const sequentialDelay = delays[badgeIndex] || 0.2;
        
        // Animar checkmark
        gsap.to(badge, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
          delay: sequentialDelay
        });
        
        // Animar opacidad de la tarjeta sincronizada con el checkmark
        gsap.to(card, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          delay: sequentialDelay
        });
      }
    }
    
    // Función para animar un contador numérico
    function animateCounter(element, targetValue) {
      if (!element) return;
      
      const obj = { value: 0 };
      
      // Usamos GSAP que ya está cargado
      if (typeof gsap !== 'undefined') {
        gsap.to(obj, {
          value: targetValue,
          duration: 0.8,
          ease: "power1.out",
          onUpdate: function() {
            element.innerText = Math.floor(obj.value).toLocaleString('en-US');
          },
          onComplete: function() {
            element.innerText = targetValue.toLocaleString('en-US');
            // Efecto sutil de "inflado" al alcanzar el valor final
            const card = element.closest('.flex-1');
            if (card && typeof gsap !== 'undefined') {
              // Delay extra para counter-6 (300)
              const pulseDelay = targetValue === 300 ? 0.5 : 0;
              
              gsap.timeline({ delay: pulseDelay })
                .to(card, { 
                  duration: 0.3, 
                  scale: 1.05, 
                  ease: "power1.out" 
                })
                .to(card, { 
                  duration: 0.4, 
                  scale: 1, 
                  ease: "elastic.out(1, 0.3)" 
                });
              
              // Animar checkmark después del pulse
              animateCheckmark(card);
            }
          }
        });
      }
    }
    
    // Animar "Miles" (counter-4) con efecto de caracteres aleatorios
    if (counter4 && typeof gsap !== 'undefined') {
      const finalText = 'Miles';
      const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
      
      const observer4 = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            let iteration = 0;
            
            const scrambleInterval = setInterval(() => {
              counter4.innerText = finalText
                .split('')
                .map((char, index) => {
                  // Si ya pasamos suficientes iteraciones para este carácter, mostrarlo
                  if (index < iteration) {
                    return finalText[index];
                  }
                  // Sino, mostrar un carácter aleatorio respetando mayúsculas/minúsculas
                  const isUpperCase = finalText[index] === finalText[index].toUpperCase();
                  const charSet = isUpperCase ? uppercaseChars : lowercaseChars;
                  return charSet[Math.floor(Math.random() * charSet.length)];
                })
                .join('');
              
              iteration += 1/3; // Velocidad de revelación
              
              if (iteration >= finalText.length) {
                clearInterval(scrambleInterval);
                counter4.innerText = finalText;
                
                // Fade in mientras hace scramble
                gsap.to(counter4, {
                  autoAlpha: 1,
                  duration: 0.3,
                  ease: "power2.out"
                });
                
                // Pulse effect después del scramble
                const card = counter4.closest('.flex-1');
                if (card) {
                  setTimeout(() => {
                    gsap.timeline()
                      .to(card, { duration: 0.3, scale: 1.05, ease: "power1.out" })
                      .to(card, { duration: 0.4, scale: 1, ease: "elastic.out(1, 0.3)" });
                    
                    // Animar checkmark
                    animateCheckmark(card);
                  }, 100);
                }
              }
            }, 50); // Velocidad del scramble (50ms entre cambios)
            
            // Hacer visible el elemento desde el inicio del scramble
            gsap.set(counter4, { autoAlpha: 1 });
            
            observer4.unobserve(counter4);
          }
        });
      }, { threshold: 0.3 });
      
      observer4.observe(counter4);
    }
    
    // Crear el observer para contadores numéricos
    const counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const element = entry.target;
          const target = parseInt(element.getAttribute('data-counter-target'));
          
          if (!isNaN(target)) {
            animateCounter(element, target);
            counterObserver.unobserve(element);
          }
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px'
    });
    
    // Observar los contadores numéricos
    if (counter5) {
      counter5.setAttribute('data-counter-target', '50');
      counterObserver.observe(counter5);
    }
    
    if (counter6) {
      counter6.setAttribute('data-counter-target', '300');
      counterObserver.observe(counter6);
    }
  }
})();
