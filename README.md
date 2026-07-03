# PROYECTO AURORA

Experiencia web estática, emocional y responsive para cumpleaños. Está desarrollada con HTML5, CSS3 puro y JavaScript vanilla, sin frameworks, sin backend y sin dependencias externas.

## Estructura del proyecto

```text
/index.html
/css/style.css
/js/app.js
/data/imagenes.json
/data/regalos.json
/imagenes/galeria/
/imagenes/puzzle/familia.jpg
/imagenes/final/foto-familiar-principal.jpg
/audio/cumpleanos.mp3
/audio/instrumental.mp3
/README.md
```

> Nota: se incluyen dos MP3 silenciosos como placeholder para conservar la estructura exacta. Reemplazalos por tus audios reales usando los mismos nombres.

## Cómo abrir el proyecto

### Opción rápida

Abrí `index.html` con doble clic. La experiencia funciona con datos internos de respaldo si el navegador bloquea la lectura de los JSON por estar en modo `file://`.

### Opción recomendada para probar todo

Usá un servidor local para que los archivos JSON se carguen exactamente como en GitHub Pages.

Con Python instalado:

```bash
cd proyecto_aurora
python -m http.server 8000
```

Después abrí:

```text
http://localhost:8000
```

## Cómo agregar fotos al carrusel

1. Copiá tus fotos dentro de:

```text
/imagenes/galeria/
```

2. Editá el archivo:

```text
/data/imagenes.json
```

3. Agregá cada foto con este formato:

```json
{
  "src": "imagenes/galeria/mi-foto.jpg",
  "titulo": "Título del recuerdo",
  "mensaje": "Mensaje emocional para esta foto."
}
```

Ejemplo completo:

```json
[
  {
    "src": "imagenes/galeria/foto-1.jpg",
    "titulo": "Un recuerdo especial",
    "mensaje": "Gracias por cada momento compartido."
  }
]
```

## Cómo cambiar la imagen del rompecabezas

Reemplazá este archivo por tu foto familiar:

```text
/imagenes/puzzle/familia.jpg
```

La imagen se usa para generar el puzzle interactivo 3x3. Si querés cambiar la dificultad, abrí `/js/app.js` y modificá:

```js
puzzleSize: 3
```

Podés usar `4`, pero para celular se recomienda `3`.

## Cómo cambiar la foto final

Reemplazá este archivo:

```text
/imagenes/final/foto-familiar-principal.jpg
```

Se recomienda una imagen horizontal o 4:3 para que se vea mejor en la escena final.

## Cómo configurar los regalos interactivos

Editá:

```text
/data/regalos.json
```

Cada caja usa este formato:

```json
{
  "titulo": "Primer regalo",
  "tipo": "mensaje",
  "contenido": "Gracias por tu amor incondicional.",
  "imagen": "imagenes/galeria/foto-1.jpg"
}
```

El proyecto muestra hasta cinco cajas.

## Cómo agregar audio

Reemplazá los MP3 silenciosos dentro de `/audio/` usando exactamente estos nombres:

```text
/audio/cumpleanos.mp3
/audio/instrumental.mp3
```

- `cumpleanos.mp3`: música de Cumpleaños Feliz o canción principal.
- `instrumental.mp3`: música suave para el capítulo final.

### Importante sobre autoplay

Muchos navegadores móviles bloquean el autoplay hasta que la persona toque la pantalla. Por eso el proyecto incluye:

- botón visible de música;
- activación después de interacción del usuario;
- fallback silencioso si el navegador bloquea el audio;
- experiencia entendible incluso sin música.

## Micrófono para soplar velas

El capítulo del pastel permite apagar velas con micrófono, pero también incluye el botón **Soplar**.

Esto es necesario porque:

- algunos navegadores bloquean el micrófono;
- algunas personas no quieren dar permiso;
- algunos dispositivos no detectan bien el soplido.

Si el micrófono falla, el botón **Soplar** siempre funciona.

## Publicar en GitHub Pages

1. Creá un repositorio en GitHub.
2. Subí todos los archivos y carpetas del proyecto.
3. Entrá a **Settings** → **Pages**.
4. En **Build and deployment**, elegí:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Guardá.
6. GitHub te dará una URL pública.
7. Usá esa URL para generar tu código QR.

## Checklist de prueba

- [ ] El proyecto abre en PC y celular.
- [ ] No hay scroll horizontal en móvil.
- [ ] Los botones se pueden tocar cómodamente.
- [ ] El carrusel avanza con botones y swipe.
- [ ] Las fotos no se deforman.
- [ ] Las cajas sorpresa se abren individualmente.
- [ ] El puzzle funciona con mouse y táctil.
- [ ] El botón Soplar apaga las velas.
- [ ] El final mantiene la experiencia viva.
- [ ] La música no es obligatoria para entender la página.

## Personalización rápida

Textos principales dentro de `/js/app.js`:

- `introLines`
- `letter`
- `finalLines`
- `hiddenMessages`

Estilos principales dentro de `/css/style.css`:

- paleta de colores en `:root`
- tamaños de títulos
- animaciones
- diseño responsive

## Recomendaciones de imágenes

- Galería: JPG o PNG, idealmente 1200px de ancho.
- Puzzle: imagen cuadrada o cercana a cuadrada.
- Final: horizontal 4:3 o 16:9.
- Evitá fotos muy pesadas. Para celular, intentá que cada imagen pese menos de 500 KB.

## Compatibilidad

Probado para funcionar como web estática moderna en:

- Google Chrome
- Microsoft Edge
- Safari móvil
- Android Browser moderno
- GitHub Pages

No usa librerías, frameworks, base de datos ni backend.


## Nota de corrección aplicada

- Las fotos de los regalos se leen desde `data/regalos.json`.
- El primer regalo apunta a `imagenes/galeria/foto-5.jpg`.
- Se corrigió `data/imagenes.json` para que use `foto-1.jpg` y no `fot-1.jpg`.
- Se corrigió el quinto regalo para que use `imagenes/galeria/foto-9.jpg`.
- También se actualizó el fallback interno de `js/app.js`; así, si el navegador bloquea la lectura de JSON al abrir el archivo con doble clic, igual se muestran las fotos correctas.
- Se ajustó el CSS de las cajas de regalo para que las fotos no se recorten de forma agresiva.
