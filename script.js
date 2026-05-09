/* ============================================================
   INVITACIÓN DE BODA — JAVASCRIPT PRINCIPAL (script.js)
   ============================================================
   ESTRUCTURA:
     1.  Estrellas de fondo
     2.  Pétalos animados (canvas)
     3.  Música — Web Audio API (melodía generada en código)
         3a. Definición de notas y melodía
         3b. Función de reproducción
         3c. Lógica de bucle y botón
     4.  Animación del sobre
     5.  Cuenta regresiva
     6.  Scroll reveal (IntersectionObserver)
     7.  Parallax suave en el hero
   ============================================================ */


/* ============================================================
   1. ESTRELLAS DE FONDO
   ─────────────────────────────────────────────────────────────
   Genera elementos <div class="star"> con propiedades CSS
   aleatorias para el efecto de parpadeo.
   ============================================================ */
(function createStars() {
  const container = document.getElementById('stars');
  const STAR_COUNT = 80;

  for (let i = 0; i < STAR_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'star';
    el.style.cssText = `
      left:     ${Math.random() * 100}%;
      top:      ${Math.random() * 100}%;
      --dur:    ${2 + Math.random() * 4}s;
      --delay:  ${Math.random() * 6}s;
      --op:     ${0.2 + Math.random() * 0.5};
    `;
    container.appendChild(el);
  }
})();


/* ============================================================
   2. PÉTALOS ANIMADOS (canvas)
   ─────────────────────────────────────────────────────────────
   Dibuja pétalos elípticos que caen con movimiento sinusoidal.
   Se reciclan al salir de pantalla para eficiencia.
   ============================================================ */
(function initPetals() {
  const canvas = document.getElementById('petals-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;
  let petals = [];

  /* Ajusta el canvas al tamaño de la ventana */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* Paleta de colores de pétalos */
  const COLORS = [
    'rgba(201,168,76,',   /* dorado */
    'rgba(232,213,163,',  /* dorado claro */
    'rgba(245,239,230,',  /* crema */
    'rgba(196,114,122,',  /* rosa */
  ];

  /* Dibuja un único pétalo como elipse rotada */
  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.color + p.alpha + ')';
    ctx.fill();
    ctx.restore();
  }

  /* Crea un objeto pétalo con valores aleatorios */
  function createPetal(startedOnScreen) {
    return {
      x:          Math.random() * W,
      y:          startedOnScreen ? Math.random() * H : -20 - Math.random() * 80,
      w:          4 + Math.random() * 6,
      h:          2 + Math.random() * 3,
      angle:      Math.random() * Math.PI * 2,
      spin:       (Math.random() - 0.5) * 0.04,
      vy:         0.4 + Math.random() * 0.8,   /* velocidad vertical */
      vx:         (Math.random() - 0.5) * 0.5, /* velocidad horizontal */
      swing:      Math.random() * Math.PI * 2, /* fase del oscilador */
      swingSpeed: 0.01 + Math.random() * 0.02,
      color:      COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha:      0.15 + Math.random() * 0.25,
    };
  }

  /* Inicializa algunos pétalos ya dentro de la pantalla */
  for (let i = 0; i < 35; i++) {
    petals.push(createPetal(true));
  }

  /* Bucle de animación principal */
  function animate() {
    ctx.clearRect(0, 0, W, H);

    /* Agrega nuevos pétalos gradualmente hasta el límite */
    if (petals.length < 50 && Math.random() < 0.04) {
      petals.push(createPetal(false));
    }

    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];

      /* Movimiento */
      p.y     += p.vy;
      p.swing += p.swingSpeed;
      p.x     += p.vx + Math.sin(p.swing) * 0.6;
      p.angle += p.spin;

      drawPetal(p);

      /* Recicla cuando sale por abajo */
      if (p.y > H + 30) {
        petals[i] = createPetal(false);
      }
    }

    requestAnimationFrame(animate);
  }
  animate();
})();


/* ============================================================
   3. MÚSICA — Archivo MP3 en bucle
   ─────────────────────────────────────────────────────────────
   PARA CAMBIAR LA CANCIÓN: reemplaza 'tu-cancion.mp3' con el
   nombre exacto de tu archivo (respeta mayúsculas/minúsculas)
   ============================================================ */
let musicPlaying = false;

const audio = new Audio('WhatsApp Audio 2026-05-08 at 9.44.42 PM.mpeg'); // ← cambia este nombre
audio.loop = true;

function updateMusicBtn() {
  const btn = document.getElementById('music-btn');
  if (musicPlaying) {
    btn.textContent = '∥';
    btn.classList.add('playing');
  } else {
    btn.textContent = '♪';
    btn.classList.remove('playing');
  }
}

async function toggleMusic() {
  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
  } else {
    try { await audio.play(); musicPlaying = true; } catch(e) {}
  }
  updateMusicBtn();
}

document.getElementById('music-btn').addEventListener('click', toggleMusic);

document.addEventListener('click', function autoStart() {
  if (!musicPlaying) toggleMusic();
  document.removeEventListener('click', autoStart);
}, { once: true });

/* ============================================================
   4. ANIMACIÓN DEL SOBRE
   ─────────────────────────────────────────────────────────────
   Al hacer clic en el sobre:
   1. Se añade clase .open → CSS abre la solapa y sube la carta
   2. 1.3s después: se inicia el fade-out del sobre
   3. 2.0s después: se oculta el sobre y se muestra la invitación
   ============================================================ */
const envelopeEl   = document.getElementById('envelope');
const screenEl     = document.getElementById('envelope-screen');
const contentEl    = document.getElementById('main-content');

envelopeEl.addEventListener('click', function openEnvelope() {
  /* Evita doble clic */
  envelopeEl.removeEventListener('click', openEnvelope);

  /* 1. CSS abre la solapa y eleva la carta */
  envelopeEl.classList.add('open');

  /* 2. Fade out del contenedor del sobre */
  setTimeout(() => {
    screenEl.classList.add('fade-out');
  }, 1300);

  /* 3. Muestra la invitación */
  setTimeout(() => {
    screenEl.style.display   = 'none';
    contentEl.style.display  = 'block';
    document.body.style.overflow = 'auto'; /* Reactiva el scroll */

    /* Pequeño retardo para que la transición de opacity funcione */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        contentEl.style.opacity = '1';
      });
    });

    /* Activa el observer de scroll ahora que el contenido es visible */
    initScrollReveal();
  }, 2000);
});


/* ============================================================
   5. CUENTA REGRESIVA
   ─────────────────────────────────────────────────────────────
   PARA CAMBIAR LA FECHA DE LA BODA:
   Edita la constante WEDDING_DATE con el formato ISO:
   'AAAA-MM-DDTHH:MM:SS'
   ============================================================ */
const WEDDING_DATE = new Date('2026-07-18T16:00:00');

function updateCountdown() {
  const now  = new Date();  
  const diff = WEDDING_DATE - now;

  if (diff <= 0) {
    /* Ya pasó la boda — muestra ceros */
    ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => {
      document.getElementById(id).textContent = '00';
    });
    return;
  }

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);

  document.getElementById('cd-days').textContent  = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent  = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent  = String(secs).padStart(2, '0');
}

/* Inicia la cuenta regresiva inmediatamente y luego cada segundo */
updateCountdown();
setInterval(updateCountdown, 1000);


/* ============================================================
   6. SCROLL REVEAL (IntersectionObserver)
   ─────────────────────────────────────────────────────────────
   Observa todos los elementos con clase .reveal y .grow-line.
   Al entrar en el viewport se añade .visible, activando la
   transición CSS definida en styles.css.

   Se llama desde la animación del sobre (punto 4) para evitar
   que se dispare antes de que el contenido sea visible.
   ============================================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('#main-content .reveal, #main-content .grow-line')
    .forEach(el => observer.observe(el));
}


/* ============================================================
   7. PARALLAX SUAVE EN EL HERO
   ─────────────────────────────────────────────────────────────
   La imagen de fondo del hero se desplaza a menor velocidad
   que el scroll, creando profundidad.
   ============================================================ */
window.addEventListener('scroll', () => {
  const heroBg = document.getElementById('hero-bg');
  if (!heroBg) return;

  const scrollY = window.scrollY;
  const limit   = window.innerHeight * 1.5;

  if (scrollY < limit) {
    /* Factor 0.3 → la imagen se mueve al 30% de la velocidad del scroll */
    heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
  }
}, { passive: true }); /* passive: true mejora el rendimiento en móvil */
