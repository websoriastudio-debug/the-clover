# DESIGN_SPEC — The Clover

## Sistema visual
- **Paleta:** vacío `#030806`, neón `#39ff6a` / `#8dffab`, oro `#e9c35c` / `#9b6f1d`, texto `#e8f5ec`, apagado `#93ad9c`. El neón y el oro salen de las monedas del cliente.
- **Tipografía:** Big Shoulders Display (titulares, condensada como las letras del logo) + Manrope (texto).
- **Logo:** se usa el PNG original recortado y limpiado; nunca se redibuja.

## Movimiento
| Escena | Efecto | Qué comunica |
|---|---|---|
| Portada | Logo se enciende como neón; moneda 3D flota y sigue el ratón | Marca + objeto protagonista |
| Anatomía (420vh fijada) | La moneda llega al centro, se inclina y se voltea al reverso de oro; notas aparecen una a una | Partes de la moneda |
| Blockchain (360vh fijada) | Las monedas caen y se apilan; la moneda principal corona la pila; pasos 01–04 se encienden | Bloques encadenados |
| Pilares (340vh fijada) | Cada hoja del trébol se ilumina con su pilar | Los cuatro valores |
| Galería (320vh fijada) | Desplazamiento horizontal de renders | Colección visual |
| Ruta | El tallo del trébol se dibuja | Progreso por fases |
| Global | Lluvia de monedas al bajar (rueda, scroll o dedo) | Juego / recompensa |

Un único timeline GSAP controla la moneda desde la portada hasta la pila (sin animaciones que compitan).

## Móvil
Moneda arriba a la derecha en la portada; notas de anatomía ancladas abajo; en blockchain solo se muestra el paso activo; pilares en rejilla 2×2 bajo el trébol; sin bloom y menos monedas cayendo.

## Movimiento reducido
Sin lluvia de monedas ni escenas fijadas: todo el contenido visible en lectura normal; la moneda queda quieta tras la portada.
