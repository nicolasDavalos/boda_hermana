# 💍 Invitación de Boda Digital

Proyecto de invitación de boda web — animada, con música, cuenta regresiva y formulario de Google.

## Estructura del proyecto

```
boda-project/
├── index.html    → HTML principal (sobre + invitación completa)
├── styles.css    → Todos los estilos y animaciones
├── script.js     → JavaScript (música, pétalos, sobre, countdown)
└── README.md     → Esta guía
```

---

## 🚀 Publicar en GitHub Pages (enlace compartible)

1. Crea un repositorio en https://github.com → **New repository**
2. Llámalo por ejemplo: `invitacion-boda`
3. Sube los 3 archivos (`index.html`, `styles.css`, `script.js`)
4. Ve a **Settings → Pages → Source → main → / (root)** → Save
5. En 1–2 minutos tendrás un enlace tipo:
   ```
   https://tu-usuario.github.io/invitacion-boda/
   ```
6. Comparte ese enlace por WhatsApp o cualquier mensajería ✅

> Los invitados solo hacen clic — no descargan nada.

---

## ✏️ Guía rápida de edición en VS Code

### Cambiar nombres de la pareja
En `index.html` busca los comentarios `══ EDITA AQUÍ ══`.
Los nombres aparecen en:
- `.letter-names` (carta dentro del sobre)
- `.hero-names` > `#name1` y `#name2` (portada)
- `.message-signature` (mensaje)
- `.closing-names` (cierre)

### Cambiar fecha
Busca las líneas con `15 · Noviembre · 2025` o `15 de Noviembre` en `index.html`.
También actualiza `WEDDING_DATE` en `script.js`:
```js
const WEDDING_DATE = new Date('2025-11-15T16:00:00');
//                              AAAA-MM-DD  HH:MM
```

### Cambiar el enlace del formulario de Google
En `index.html` busca la sección `BOTÓN RSVP` y reemplaza el `href`:
```html
<a href="PEGA-AQUI-TU-ENLACE-DE-GOOGLE-FORMS" ...>
```

### Cambiar colores
Abre `styles.css` y edita las variables en `:root` (líneas iniciales):
```css
--color-gold:   #c9a84c;   /* Dorado principal */
--color-bg:     #0d0a08;   /* Fondo oscuro */
--color-cream:  #f5efe6;   /* Texto claro */
```

### Cambiar fotos
Las imágenes son URLs de Unsplash. Para poner tus propias fotos:
1. Sube las fotos junto a `index.html` en el repo
2. Reemplaza las URLs en `index.html`:
   - **Hero (portada):** `styles.css` → `.hero-bg { background-image: url('TU-FOTO.jpg') }`
   - **Pareja (retrato):** `<img id="couple-photo" src="TU-FOTO.jpg">`
   - **Galería:** `<img id="gallery-1" src="TU-FOTO.jpg">` (y gallery-2, gallery-3)
   - **Cierre:** `styles.css` → `.closing-bg { background-image: url('TU-FOTO.jpg') }`

### Cambiar música
La melodía se genera con Web Audio API (sin archivos externos).
Para usar tu propio MP3:
1. Sube el archivo `.mp3` al repositorio
2. En `script.js`, reemplaza la función `toggleMusic` completa con:
```js
const audio = new Audio('tu-cancion.mp3');
audio.loop = true;

async function toggleMusic() {
  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
  } else {
    await audio.play();
    musicPlaying = true;
  }
  updateMusicBtn();
}
```

### Cambiar código de vestimenta
En `index.html`, busca la sección `CÓDIGO DE VESTIMENTA`:
- Edita el `<h2>` con la etiqueta (ej: "Formal", "Semiformal")
- Edita el párrafo con la descripción
- Cambia los colores de los `.swatch-circle` con el atributo `style="background:#COLOR"`

---

## 📱 Compatibilidad
- ✅ Android (Chrome, Firefox)
- ✅ iOS (Safari, Chrome)
- ✅ Windows (Chrome, Firefox, Edge)
- ✅ Mac (Safari, Chrome)
