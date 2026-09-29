# Limpiezas Lumis — web

Sitio estático: `index.html`, 14 páginas de servicio y 3 páginas propias (`opiniones.html`, `como-trabajamos.html`, `contacto.html`). Estilos: `lumis.css` (base), `pages.css` (cabecera, menú móvil y páginas) y `fx.css` (efectos). Paleta única: turquesa del logo.

## Versión 4 (actual)

Todas las páginas se generan desde un único origen:

- `scripts/content.mjs` — **todo el texto**: datos de contacto, servicios (qué incluye, método, frecuencia, consejos, FAQ…) y reseñas.
- `scripts/build.mjs` — plantillas HTML. Regenerar con `node scripts/build.mjs`.
- `assets/css/lumis.css` y `assets/js/lumis.js` — estilos e interacciones.
- `assets/css/fx.css` y `assets/js/fx.js` — capa de efectos: burbujas en canvas, destellos, reflejos de cristal, olas, inclinación 3D, botones magnéticos y transición entre páginas. Se desactiva sola si el usuario tiene activado «reducir movimiento». Para quitarla, borra las dos líneas que la cargan en `build.mjs`.
- `node scripts/serve.mjs` — servidor local en http://localhost:5178 para revisar.

Para cambiar un texto, edita `content.mjs` y vuelve a ejecutar el build. No edites los `.html` a mano: se sobrescriben.

Incluye: banner superior en movimiento, cinta animada de servicios, reserva rápida en 3 pasos que prepara un mensaje de WhatsApp (no envía ni guarda datos), reseñas reales de Google (portada y cada servicio), comparador antes/después, barra de acciones en móvil y datos estructurados para Google.

## Logo y colores (versión 7)

- Logo nuevo extraído de `Limpiezas_Lumis_logo.pdf` (una imagen de 1182 × 1330 px, sin vectores):
  `logo-horizontal.png` (cabecera, menú móvil, tarjeta de sellos), `logo-lumis.png` (pie y transición entre páginas), `favicon-48.png`, `icon-192.png`, `icon-512.png` y `apple-touch-icon.png`.
- Paleta tomada del logo: petróleo `#0B5566` (`--navy`), turquesa `#12B2D2` (`--brand`), botones y enlaces `#0A7F9B` (`--blue`, contraste 4,6 con blanco).
- `node scripts/retint.mjs` lleva cualquier azul de las hojas de estilo al matiz del logo; útil si se añaden colores nuevos.
- Para imprimir en grande (rótulos, furgoneta) hay que pedir el logo original en vector (SVG, AI o EPS).


## Pendiente de revisar con Lumis

- Textos de cada servicio (contenido de demostración).
- `reviewsUrl` en `content.mjs` apunta a una búsqueda en Google Maps: sustituir por el enlace directo a la ficha de Google.
- Las reseñas están copiadas literalmente de Google; no editarlas.
- Las fotografías son ejemplos ilustrativos generados; sustituir por fotos reales de trabajos.
- Teléfono corregido a 652 63 09 38 (la versión anterior enlazaba por error al 652 60 93 38).

## Archivos antiguos

`assets/css/styles.css`, `assets/css/experience.css`, `assets/js/main.js`, `assets/js/experience.js`, `scripts/redesign.mjs` y `scripts/enhance.cjs` pertenecen a la versión 3 y ya no se usan. **No ejecutes `redesign.mjs` ni `enhance.cjs`**: romperían las páginas nuevas.

## Vídeos

- Originales en `videos-originales/` (excluidos de Git). Versiones web en `assets/video/`: `lumis-trabajo.mp4` (8 s, trabajo real recortado sin filtros ni transiciones del montaje original) y `lumis-anuncio.mp4` (8 s), con su imagen de espera `.jpg`.
- Se muestran en marco de móvil: portada (sección «Lumis en acción»), limpieza de cristales («Qué incluye») y contacto. Solo se cargan al llegar a ellos, sin sonido, en bucle y con botón de pausa.
- Para añadir un vídeo a otro servicio: poner `video: 'nombre'` en su ficha de `scripts/content.mjs`.

## Cambios acordados con el cliente (29/09/2026)

- Paleta definitiva: turquesa. Eliminados el selector de color y la paleta azul.
- Eliminada la oferta «50 % en la 5ª limpieza» (era una promoción de apertura): sección de portada, página `oferta.html`, tarjetas y textos.
- Eliminados los servicios de tapicerías y sofás.
- Límite de altura: hasta unos 3 metros (10 pies). Indicado en limpieza de cristales (cabecera, qué incluye, método y preguntas), en la pregunta general y en la lista para presupuesto. Eliminadas las frases que sugerían trabajos en altura.
- Nuevos servicios: limpieza de fachadas y grafitis (`fachadas.html`, a pie de calle, hasta 3 m) y limpieza de persianas (`persianas.html`). **Fotos provisionales**: usan `comunidades.jpg` y `viviendas.jpg` hasta tener fotos reales.
