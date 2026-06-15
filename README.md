# Pixel Dice

Pixel Dice es una app minimalista para mesa, rol y juegos sociales. Su objetivo es resolver tres momentos habituales de una partida: elegir quien empieza, tirar pools de dados personalizados y descubrir juegos disponibles en pixeldice.studio.

La app se construira con React, Vite, SQLite local y Capacitor para empaquetar en iOS y Android. La interfaz usara JSX con clases y SCSS organizado en carpetas separadas.

## Vision

Pixel Dice debe sentirse como una herramienta pequena, rapida y fisica. La pantalla no explica demasiado: invita a tocar, elegir, tirar y jugar.

Principios de producto:

- Minimalismo absoluto.
- UI en blanco y negro como base.
- Tema Auto / Light / Dark segun preferencia del usuario y del dispositivo.
- Interacciones tactiles claras.
- Animaciones con sensacion de azar, tension y resolucion.
- Resultados justos y faciles de entender.
- Uso offline para selector y dados.
- Galeria conectada a pixeldice.studio con cache local cuando sea posible.
- UI movil primero, con barra inferior estilo iOS Liquid Glass.

## Diseno Visual

La app debe usar una interfaz monocroma: blanco, negro y grises funcionales. El color aparece solo cuando aporta informacion o juego: jugadores seleccionados, equipos, dados personalizados, estados de resultado, imagenes de juegos y pequenas confirmaciones.

Temas:

- `Auto`: usa `prefers-color-scheme` del dispositivo.
- `Light`: fondo blanco, texto negro, superficies claras.
- `Dark`: fondo negro, texto blanco, superficies oscuras.

Reglas:

- La UI base no debe depender de colores de marca fuertes.
- Los dados por defecto son negros en todos los temas.
- Los colores de jugadores/equipos deben mantener contraste suficiente en Light y Dark.
- La barra inferior mantiene efecto glass, pero adaptado a blanco/negro.
- El `theme-color`, status bar y navigation bar de Capacitor deben sincronizarse con el tema activo.
- La preferencia de tema debe guardarse localmente.

Tokens iniciales:

```scss
:root {
  --pd-bg: #ffffff;
  --pd-fg: #050505;
  --pd-muted: #6f6f6f;
  --pd-line: #e8e8e8;
  --pd-surface: rgba(255, 255, 255, 0.72);
}

[data-theme="dark"] {
  --pd-bg: #050505;
  --pd-fg: #ffffff;
  --pd-muted: #a6a6a6;
  --pd-line: #242424;
  --pd-surface: rgba(12, 12, 12, 0.72);
}
```

## Funcionalidades Base

### 1. Selector de jugador inicial

El selector permite introducir el numero de jugadores y elegir un objetivo:

- Jugador inicial, opcion por defecto.
- Ordenar jugadores.
- Separar en equipos.

El sistema debe adaptar la interaccion segun el numero de jugadores.

### 2. Tira dados

El usuario puede crear un pool de dados con las caras que quiera, tirarlo en una escena 3D con fisicas y guardar diferentes listas localmente.

Casos basicos:

- Crear dados comunes: d4, d6, d8, d10, d12, d20, d100.
- Crear variantes personalizadas de dados estandar.
- Definir cantidad de dados por tipo.
- Tirar todo el pool a la vez en 3D.
- Ver dados con numeros reales en sus caras.
- Simular fisicas con colisiones entre dados y contra los bordes del viewport.
- Ver resultado total y desglose por dado.
- Guardar pools con nombre en SQLite local.
- Editar, duplicar y borrar pools guardados.

Personalizacion:

- Los dados por defecto son negros.
- Las variantes personalizadas pueden tener color propio.
- Los colores se guardan dentro de cada pool.
- A futuro, las caras podran usar iconos en vez de numeros para juegos con simbolos como heridas, energia, exitos o recursos.
- Las caras con iconos pueden encajar como funcion premium.

Casos utiles para rol que se pueden valorar despues:

- Modificadores fijos, por ejemplo +3 o -1.
- Tiradas con ventaja/desventaja.
- Mantener los N dados mas altos o mas bajos.
- Historial de ultimas tiradas.

### Dados 3D y Fisicas

La pantalla de dados debe sentirse como lanzar dados reales dentro del telefono.

Direccion visual:

- Escena 3D a pantalla completa o casi completa.
- Dados negros por defecto, con numeros claros en las caras.
- Material sobrio, legible y con reflejos suaves.
- Las variantes personalizadas pueden usar colores guardados por el usuario.
- La UI de configuracion debe ocupar lo minimo para no tapar la tirada.

Fisicas:

- Los dados caen, rebotan, chocan entre si y chocan contra los bordes del viewport.
- El viewport funciona como una bandeja invisible.
- El usuario debe poder lanzar con un boton y, mas adelante, con gesto de arrastre o sacudida.
- La simulacion debe terminar cuando todos los dados esten quietos.

Justicia del resultado:

- El resultado logico debe ser uniforme y fiable.
- Para dados estandar, se puede leer la cara superior al terminar la fisica si la geometria y el collider son correctos.
- Para dados personalizados o geometrias no perfectamente justas, el motor puede usar un resultado uniforme generado por la app y orientar el dado al valor final durante la resolucion.
- La animacion puede ser teatral, pero el resultado no debe depender de sesgos de malla, collider, friccion o posicion inicial.

Alcance recomendado:

- MVP: dados 3D estandar de rol con numeros y colores por pool.
- Despues: dados de caras arbitrarias y mas opciones visuales.
- Premium futuro: sets de caras con iconos, simbolos propios y temas visuales.

### 3. Galeria de juegos

Pantalla de exploracion de juegos disponibles en pixeldice.studio. La app no deberia depender de leer el HTML de la web: lo ideal es publicar un catalogo JSON estable desde pixeldice.studio y cachearlo en SQLite.

Primera version:

- Listado de juegos.
- Nombre, estado, descripcion corta, ficha rapida y etiquetas.
- Imagen si existe; si no, composicion monocroma con el nombre del juego.
- Enlace o apertura del detalle en pixeldice.studio.
- Cache local basica para que la galeria no quede vacia sin conexion si ya se ha cargado antes.
- Seed local con los juegos conocidos para que la pantalla tenga contenido desde la primera instalacion.

Fuente de datos recomendada:

- `https://pixeldice.studio/games.json` o `https://pixeldice.studio/api/games`.
- La landing puede seguir siendo editorial, pero la app consume el manifest.
- Cada juego debe tener `updated_at` para invalidar cache.
- La app guarda la ultima version valida.
- Si falla la red, usa cache.
- Si no hay cache, usa el seed local.

Estados de juego:

- `available`: disponible.
- `coming_soon`: anunciado.
- `prototype`: prototipo jugable.
- `testing`: en pruebas.
- `archived`: oculto o historico.

Juego inicial:

- Omertà sera el primer juego de la galeria.
- En pixeldice.studio aparece como juego social disponible, para 1-25 jugadores y duracion aproximada de 15 minutos.
- La app deberia mostrarlo como ficha destacada mientras sea el unico juego disponible.
- El detalle puede abrir la seccion correspondiente de pixeldice.studio.

Ejemplo de manifest:

```json
{
  "version": 1,
  "updated_at": "2026-06-15T00:00:00Z",
  "games": [
    {
      "id": "omerta",
      "slug": "omerta",
      "title": "Omertà",
      "status": "available",
      "tagline": "Callar o traicionar, la decision es tuya.",
      "summary": "Juego social de confianza, secretos y traicion.",
      "players_min": 1,
      "players_max": 25,
      "duration_minutes": 15,
      "type": "Juego social",
      "tags": ["social", "deduccion", "traicion"],
      "image_url": null,
      "source_url": "https://pixeldice.studio/es/",
      "featured": true,
      "updated_at": "2026-06-15T00:00:00Z"
    }
  ]
}
```

## Selector de Jugador

### Entrada Inicial

La pantalla inicial del selector debe pedir:

- Numero de jugadores.
- Modo: jugador inicial, ordenar jugadores o separar en equipos.
- En modo equipos: numero de equipos.

Reglas:

- Minimo recomendado: 2 jugadores.
- Para equipos: minimo 2 equipos y maximo numero de jugadores - 1.
- El motor debe priorizar equilibrio: los equipos deben tener tamanos lo mas parecidos posible.

### Modo A: Hasta 5 Jugadores

Para 2 a 5 jugadores se usa una interaccion multitouch inspirada en las caras de un dado.

Funcionamiento:

- Aparecen cuadrados negros colocados como puntos de dado.
- Cada jugador mantiene pulsado un cuadrado.
- Cuando un cuadrado queda reclamado, toma un color y un identificador visual.
- El identificador puede ser un emoji, un icono simple o una marca generada.
- Cuando todos los jugadores han reclamado un cuadrado, empieza la animacion de seleccion.
- Los cuadrados se iluminan en secuencia, con aceleracion o tension visual.
- El ganador queda seleccionado y la interfaz se tine con su color.

Objetivo:

- Que se sienta inmediato y de mesa.
- Que todos participen a la vez.
- Que el resultado sea visualmente memorable.

Notas tecnicas:

- Usar Pointer Events para soportar varios dedos.
- Cada `pointerId` solo puede reclamar un cuadrado.
- Si un dedo se levanta antes de confirmar, se libera el cuadrado.
- Para evitar errores, la seleccion final empieza solo cuando todos los jugadores requeridos estan activos.

### Modo B: 6 o Mas Jugadores

Para 6+ jugadores el sistema no debe depender de multitouch. El modo base sera "elige tu pixel, luego el destino decide".

Funcionamiento:

- Se muestra una parrilla de pixeles libres.
- Cada jugador toca un pixel disponible.
- El pixel queda reclamado con color e identificador visual.
- Cuando todos han elegido, la app anima el sorteo cambiando el foco entre pixeles reclamados.
- Uno de los pixeles elegidos se ilumina como ganador.

Por que este modo es el principal:

- Es justo: cada jugador tiene exactamente 1 entre N probabilidades.
- No hay empates.
- No requiere que todos toquen a la vez.
- Todos sienten que han participado porque han elegido su propio pixel.
- Funciona igual en moviles, tablets y pantallas con limitaciones de multitouch.

### Modo Experimental: Pixel Virus

Pixel Virus es una variante mas emocionante para 6+ jugadores, pero deberia tratarse como modo avanzado hasta validar que se percibe justo.

Idea:

- Cada jugador elige un pixel de color.
- Cuando todos han elegido, los territorios empiezan a expandirse por el tablero.
- Un area puede comerse areas mas pequenas.
- Un area mas grande puede comerse un area menor.
- Gana el ultimo territorio vivo.

Condiciones para que funcione:

- El tablero debe comportarse como un mundo toroidal: salir por un borde conecta con el borde opuesto.
- La posicion inicial no debe generar ventaja por esquinas o bordes.
- Las reglas de expansion deben estar equilibradas para que cada jugador parta con probabilidad equivalente.
- Si no se puede demostrar o percibir justicia, se debe presentar como modo "caos" o "party", no como sorteo competitivo estricto.

Decision inicial:

- MVP: implementar "elige tu pixel, luego el destino decide".
- Fase posterior: prototipar Pixel Virus como modo alternativo.

## Ordenar Jugadores

El modo ordenar jugadores reutiliza el sistema de reclamacion de pixeles o cuadrados.

Funcionamiento:

- Cada jugador reclama una posicion.
- La app genera un orden aleatorio del 1 al N.
- Cada pixel muestra el numero asignado.
- Se puede revelar todo al final o revelar segun se toca cada pixel, dependiendo del ritmo que se quiera.

Regla:

- Todos los jugadores tienen la misma probabilidad de ocupar cualquier posicion del orden.

## Separar en Equipos

El modo equipos tambien reutiliza el sistema de reclamacion.

Funcionamiento:

- Se indica numero de jugadores y numero de equipos.
- Cada jugador reclama un pixel o cuadrado.
- La app asigna equipos equilibrados.
- Al tocar o revelar, cada jugador ve que equipo le ha tocado.

Reglas de equilibrio:

- La diferencia de tamano entre equipos no puede ser mayor que 1.
- Si hay resto, los jugadores sobrantes se distribuyen aleatoriamente entre equipos.
- Los colores de equipo deben ser claros y distinguibles.

Ejemplo:

- 7 jugadores en 3 equipos: 3, 2 y 2.
- 10 jugadores en 4 equipos: 3, 3, 2 y 2.

## Arquitectura Propuesta

Stack:

- React con Vite.
- JSX con `className`.
- SCSS separado por carpetas.
- Three.js con React Three Fiber para dados 3D.
- Motor de fisicas 3D, preferiblemente Rapier via `@react-three/rapier`.
- SQLite local para pools guardados, historial y cache.
- Capacitor para iOS y Android.
- Fetch/API para galeria de pixeldice.studio.

Estructura inicial sugerida:

```txt
src/
  app/
    App.jsx
    routes.jsx
    ThemeProvider.jsx
  features/
    player-selector/
      PlayerSelector.jsx
      selectorEngine.js
      selectorModes.js
    dice-roller/
      DiceRoller.jsx
      DiceScene.jsx
      DiceMesh.jsx
      diceEngine.js
      dicePhysics.js
      diceStorage.js
      diceGeometry.js
    games-gallery/
      GamesGallery.jsx
      gamesApi.js
      gamesCatalog.js
      gamesSeed.js
      gamesStorage.js
  shared/
    components/
    hooks/
      useTheme.js
    storage/
      database.js
    utils/
  styles/
    base/
      theme.scss
    components/
    features/
      player-selector.scss
      dice-roller.scss
      games-gallery.scss
    app.scss
```

Convenciones:

- Componentes en JSX.
- Logica de azar y reglas en archivos `engine`.
- Escena, mallas y fisicas de dados separadas de la UI de formularios.
- Persistencia separada de UI.
- Tema gestionado desde un proveedor unico que aplique `data-theme` al documento.
- SCSS fuera del JSX, importado desde la app o por feature.
- Clases semanticas y estables, por ejemplo `.selector-grid`, `.dice-pool`, `.bottom-nav`.

## Modelo de Datos Inicial

Tablas SQLite propuestas:

### `app_settings`

- `key`
- `value`
- `updated_at`

Ajustes iniciales:

```json
{
  "theme": "auto"
}
```

### `dice_pools`

- `id`
- `name`
- `dice_config`
- `created_at`
- `updated_at`

`dice_config` puede guardarse como JSON:

```json
{
  "dice": [
    {
      "sides": 20,
      "quantity": 2,
      "color": "#050505",
      "labelMode": "numbers"
    },
    {
      "sides": 6,
      "quantity": 4,
      "color": "#d946ef",
      "labelMode": "numbers"
    }
  ],
  "modifier": 0
}
```

Campos previstos para dados:

- `sides`: numero de caras.
- `quantity`: cantidad de dados de ese tipo.
- `color`: color principal del dado.
- `labelMode`: `numbers` para MVP, `icons` para futuras caras premium.
- `faceLabels`: opcional para iconos o textos personalizados en versiones futuras.
- `material`: opcional para temas visuales futuros.

### `roll_history`

- `id`
- `pool_id`
- `result_total`
- `result_detail`
- `physics_seed`
- `created_at`

### `games_cache`

- `id`
- `slug`
- `title`
- `status`
- `summary`
- `tagline`
- `image_url`
- `players_min`
- `players_max`
- `duration_minutes`
- `type`
- `tags`
- `source_url`
- `featured`
- `sort_order`
- `updated_at`

La cache de juegos debe poder hidratarse desde tres fuentes, en este orden:

- Manifest remoto de pixeldice.studio.
- Cache SQLite de la ultima carga correcta.
- Seed local incluido en la app.

Seed inicial:

```json
{
  "id": "omerta",
  "slug": "omerta",
  "title": "Omertà",
  "status": "available",
  "summary": "Juego social de confianza, secretos y traicion.",
  "players_min": 1,
  "players_max": 25,
  "duration_minutes": 15,
  "type": "Juego social",
  "source_url": "https://pixeldice.studio/es/",
  "featured": true
}
```

## Navegacion

La app tendra una barra inferior con tres secciones:

- Selector
- Dados
- Juegos

La barra debe sentirse ligera, translucida y tactil, inspirada en iOS Liquid Glass, sin recargar la pantalla.

## Roadmap

### Fase 0: Definicion

- Cerrar alcance del MVP.
- Definir identidad visual minima.
- Definir tokens monocromos para Light y Dark.
- Definir reglas exactas de azar para selector, orden y equipos.
- Definir contrato de datos de la galeria con pixeldice.studio.

### Fase 1: Base Tecnica

- Crear proyecto Vite + React.
- Configurar SCSS.
- Configurar tema Auto / Light / Dark.
- Sincronizar tema con status bar y navigation bar de Capacitor.
- Configurar Three.js / React Three Fiber.
- Configurar motor de fisicas 3D.
- Configurar Capacitor.
- Configurar SQLite local.
- Crear estructura de carpetas.
- Crear navegacion inferior.

### Fase 2: Selector MVP

- Pantalla de configuracion de jugadores.
- Modo jugador inicial hasta 5 jugadores con multitouch.
- Modo jugador inicial 6+ con eleccion de pixel.
- Motor de sorteo justo.
- Animacion de seleccion y estado final.

### Fase 3: Dados MVP

- Constructor de pool.
- Escena 3D de tirada.
- Dados estandar con numeros en caras.
- Fisicas con colisiones entre dados y bordes del viewport.
- Color por dado o grupo de dados.
- Guardado local de pools.
- Listado, carga, edicion y borrado.

### Fase 4: Orden y Equipos

- Modo ordenar jugadores.
- Modo separar en equipos.
- Motor equilibrado de equipos.
- Pantallas de revelado.

### Fase 5: Galeria

- Seed local inicial con Omertà.
- Listado de juegos desde manifest de pixeldice.studio.
- Cache local.
- Estados de carga, error y sin conexion.
- Ficha destacada cuando solo haya un juego disponible.

### Fase 6: Pulido

- Animaciones.
- Sonido y haptics opcionales.
- Accesibilidad tactil.
- Pruebas en iOS y Android.
- Prototipo de Pixel Virus.
- Prototipo de caras con iconos para dados premium.

## Preguntas Abiertas

- La app sera solo movil o tambien web publica?
- La galeria abrira juegos dentro de la app o en navegador externo?
- El catalogo de juegos vivira en `/games.json`, `/api/games` o dentro del CMS/build de pixeldice.studio?
- Omertà tendra una URL propia estable o seguira siendo una seccion dentro de la landing?
- Los pools de dados necesitan sincronizacion entre dispositivos?
- Pixel Virus debe ser un modo justo verificable o un modo party claramente caotico?
- Los jugadores se identifican solo por color/emoji o podran poner nombre?
- Queremos efectos de sonido y vibracion desde el MVP?
- Los dados personalizados fuera de d4, d6, d8, d10, d12, d20 y d100 deben tener geometria 3D propia desde el MVP o pueden resolverse primero como tirada logica con visualizacion generica?
- Las caras con iconos seran packs cerrados premium o editor libre premium?

## MVP Recomendado

El primer MVP deberia incluir:

- Barra inferior con Selector, Dados y Juegos.
- Tema Auto / Light / Dark con UI blanco/negro.
- Selector de jugador inicial:
  - 2 a 5 jugadores con cuadrados en posicion de dado.
  - 6+ jugadores con eleccion secuencial de pixeles.
- Tira dados:
  - Crear pool con dados estandar.
  - Tirar pool en escena 3D.
  - Ver numeros en las caras.
  - Usar fisicas con bordes del viewport.
  - Elegir color para variantes personalizadas de dados estandar.
  - Guardar pools localmente.
- Galeria:
  - Seed local con Omertà.
  - Listado basico conectado a pixeldice.studio.
  - Cache local del catalogo.

No incluir inicialmente:

- Pixel Virus como modo principal.
- Sincronizacion en la nube.
- Cuentas de usuario.
- Editor avanzado de reglas de dados.
- Caras con iconos en dados.

La meta del MVP es que Pixel Dice ya sea util en una mesa real en menos de 10 segundos desde que se abre.
