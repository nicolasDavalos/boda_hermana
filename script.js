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
   3. MÚSICA — Web Audio API
   ─────────────────────────────────────────────────────────────
   Genera una melodía romántica estilo vals directamente con
   osciladores del navegador. No requiere archivos externos,
   por lo que funciona perfectamente al subir a GitHub Pages.
   La melodía se reproduce en bucle infinito.
   ============================================================ */

/* ── 3a. NOTAS EN Hz ── */
const N = {
  C3:130.81, D3:146.83, E3:164.81, F3:174.61,
  G3:196.00, A3:220.00, B3:246.94,
  C4:261.63, D4:293.66, E4:329.63, F4:349.23,
  G4:392.00, A4:440.00, B4:493.88,
  C5:523.25, D5:587.33, E5:659.25, F5:698.46,
};

/*
   MELODÍA PRINCIPAL — vals romántico en Do mayor
   Formato: [frecuencia_Hz, duración_en_pulsos]
   ─────────────────────────────────────────────────────────────
   PARA CAMBIAR LA MELODÍA:
   Sustituye esta variable con tus propias notas y duraciones.
   El tempo se controla con TEMPO_SEC en la función playMelody.
*/
const MELODY = [
  [N.E4,0.5],[N.D4,0.5],[N.C4,0.5],[N.E4,0.5],
  [N.G4,1.0],[N.G4,0.5],[N.A4,0.5],
  [N.G4,0.5],[N.F4,0.5],[N.E4,0.5],[N.D4,0.5],
  [N.C4,1.5],[N.E4,0.5],
  [N.F4,0.5],[N.E4,0.5],[N.D4,0.5],[N.C4,0.5],
  [N.G4,1.0],[N.E4,0.5],[N.G4,0.5],
  [N.A4,0.5],[N.G4,0.5],[N.F4,0.5],[N.E4,0.5],
  [N.D4,2.0],
  [N.G4,0.5],[N.A4,0.5],[N.B4,0.5],[N.C5,0.5],
  [N.B4,1.0],[N.A4,0.5],[N.G4,0.5],
  [N.A4,0.5],[N.B4,0.5],[N.C5,0.5],[N.D5,0.5],
  [N.E5,2.0],
  [N.D5,0.5],[N.C5,0.5],[N.B4,0.5],[N.A4,0.5],
  [N.G4,1.0],[N.F4,0.5],[N.E4,0.5],
  [N.D4,0.5],[N.E4,0.5],[N.F4,0.5],[N.G4,0.5],
  [N.C4,3.0],
];

/*
   ACORDES DE ACOMPAÑAMIENTO
   Formato: [[nota1, nota2, nota3], duración_en_pulsos]
*/
const CHORDS = [
  [[N.C3,N.E3,N.G3], 2.0],
  [[N.G3,N.B3,N.D4], 2.0],
  [[N.A3,N.C4,N.E4], 2.0],
  [[N.F3,N.A3,N.C4], 2.0],
  [[N.C3,N.E3,N.G3], 2.0],
  [[N.G3,N.B3,N.D4], 2.0],
  [[N.F3,N.A3,N.C4], 2.0],
  [[N.C3,N.E3,N.G3], 2.0],
  [[N.G3,N.B3,N.D4], 2.0],
  [[N.A3,N.C4,N.E4], 2.0],
  [[N.F3,N.A3,N.C4], 2.0],
  [[N.C3,N.E3,N.G3], 3.0],
];

/* ── 3b. FUNCIÓN DE REPRODUCCIÓN ── */

/*
   Crea y programa un oscilador individual con envolvente ADSR simplificada.
   - ctx:       AudioContext activo
   - freq:      Frecuencia en Hz
   - startTime: Tiempo de inicio (segundos desde ctx.currentTime)
   - duration:  Duración total en segundos
   - gain:      Volumen pico (0–1)
   - type:      Tipo de onda del oscilador
*/
function playNote(ctx, freq, startTime, duration, gain, type = 'triangle') {
  const osc  = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  /* Envolvente: ataque → sostenido → decaimiento */
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.06);
  gainNode.gain.setValueAtTime(gain, startTime + duration - 0.09);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

/*
   Programa toda la melodía + acordes en el AudioContext.
   Devuelve la duración total en segundos para calcular el bucle.

   TEMPO_SEC: segundos por pulso. Aumenta para ir más lento,
              disminuye para ir más rápido.
*/
function scheduleMelody(ctx) {
  const TEMPO_SEC = 0.55;
  const start     = ctx.currentTime + 0.15;
  let   t         = start;

  /* Melodía principal (triángulo, volumen medio) */
  MELODY.forEach(([freq, dur]) => {
    playNote(ctx, freq, t, dur * TEMPO_SEC * 0.88, 0.22, 'triangle');
    t += dur * TEMPO_SEC;
  });

  /* Acordes de acompañamiento (seno, volumen bajo) */
  let tc = start;
  CHORDS.forEach(([notes, dur]) => {
    notes.forEach(f => {
      playNote(ctx, f, tc, dur * TEMPO_SEC * 0.82, 0.07, 'sine');
    });
    tc += dur * TEMPO_SEC;
  });

  /* Retorna duración para temporizador del bucle */
  return t - ctx.currentTime;
}

/* ── 3c. LÓGICA DE BUCLE Y BOTÓN ── */

let audioCtx     = null;
let musicPlaying = false;

/*
   Actualiza el ícono y la clase del botón de música
   según el estado actual (reproduciendo o pausado).
*/
function updateMusicBtn() {
  const btn = document.getElementById('music-btn');
  if (musicPlaying) {
    btn.textContent = '∥';          /* símbolo de pausa */
    btn.classList.add('playing');
  } else {
    btn.textContent = '♪';          /* símbolo de nota musical */
    btn.classList.remove('playing');
  }
}

/*
   Inicia o pausa la música. Crea el AudioContext solo cuando
   el usuario interactúa (requisito de políticas de navegador).
*/
async function toggleMusic() {
  /* Crea AudioContext la primera vez */
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  /* Reanuda si el contexto fue suspendido automáticamente */
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  if (musicPlaying) {
    /* Pausa suspendiendo el contexto */
    await audioCtx.suspend();
    musicPlaying = false;
    updateMusicBtn();
    return;
  }

  musicPlaying = true;
  updateMusicBtn();

  /*
     Bucle recursivo: cuando la melodía está por terminar,
     vuelve a programarla para reproducción continua.
  */
  async function loopSchedule() {
    if (!musicPlaying) return;
    if (audioCtx.state === 'suspended') return;

    const duration = scheduleMelody(audioCtx);

    /* Vuelve a llamarse 500ms antes del final para no tener silencio */
    setTimeout(loopSchedule, (duration - 0.5) * 1000);
  }

  loopSchedule();
}

/* Evento del botón de música */
document.getElementById('music-btn').addEventListener('click', toggleMusic);

/*
   Intenta iniciar la música automáticamente en el primer
   toque/clic del usuario sobre cualquier parte de la página.
   Esto evita bloqueos por políticas de autoplay.
*/
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
const WEDDING_DATE = new Date('2025-11-15T16:00:00');

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
