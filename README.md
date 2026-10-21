# The Clover — web cinematográfica

Web de presentación de la criptomoneda **The Clover** con moneda 3D guiada por scroll, lluvia de monedas al bajar y el asistente **Clover AI**.

## Ejecutar

```bash
cd the-clover
npm install
npm start          # http://localhost:4230
```

### Activar la IA (Claude)

Clover AI usa la API de Anthropic desde el servidor (la clave nunca llega al navegador):

```bash
# PowerShell
$env:ANTHROPIC_API_KEY = "sk-ant-..."; npm start
```

- Modelo por defecto: `claude-opus-5-5` con esfuerzo bajo. Para abaratar se puede usar `CLOVER_MODEL=claude-haiku-5-5`.
- Sin clave, o si la web se publica como sitio estático (sin `server.mjs`), el chat funciona en **modo básico**: responde con la base de conocimiento de `js/kb.js`.
- Límite: 20 mensajes por IP cada 10 minutos.

## Archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | Contenido y estructura (todo el texto vive en HTML) |
| `css/styles.css` | Sistema visual, escenas fijadas, móvil y movimiento reducido |
| `js/main.js` | Recorrido de scroll (GSAP ScrollTrigger) |
| `js/coin3d.js` | Moneda 3D (Three.js): texturas del anverso neón, reverso de oro y canto |
| `js/coin-rain.js` | Lluvia de monedas pequeñas al hacer scroll hacia abajo |
| `js/chat.js` | Interfaz de Clover AI y FAQ |
| `js/kb.js` | **Base de conocimiento**: edítala para cambiar respuestas y datos del token |
| `server.mjs` | Servidor estático + `/api/chat` |

## Editar datos del token

Cuando el equipo confirme símbolo, red, suministro y contrato:
1. Actualiza la tabla `.ledger` en `index.html` (sección `#token`).
2. Actualiza las entradas `datos` y `comprar` de `js/kb.js` para que Clover AI lo sepa.

## Recursos

| Recurso | Origen | Uso |
|---|---|---|
| `assets/originales/*` | Imágenes enviadas por el cliente | Referencia y galería |
| `assets/clover-logo.png` | Recorte de `logo-neon.png`, limpieza de ruido y fondo transparente (forma sin cambios) | Portada, galería, pie |
| `assets/clover-mark.png` | Mismo proceso, solo el trébol | Moneda 3D, monedas que caen, favicon, chat |
| `moneda-dorada.png` | Captura de video con botón de play y subtítulo | Solo referencia del reverso; no se muestra |
| `assets/coins/coin-*.webp` | Renders de monedas enviados por el cliente (originales en `assets/originales/coin-*.webp`), comprimidos a 1100 px | Pilares (`coin-13`) y galería (`coin-10/12/14/15/16/17`); sin usar todavía: `coin-8`, `coin-9`, `coin-11` |
