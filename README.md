# CipherLab — Sistema de Cifrado Dinámico

## Título y Descripción

**CipherLab** es una aplicación web (SPA) de carácter educativo que implementa los algoritmos clásicos de cifrado **César** y **Atbash** sobre un **alfabeto dinámico configurable** por el usuario. Permite definir el conjunto de caracteres que constituye el alfabeto del sistema y, a partir de él, cifrar mensajes, descifrarlos manualmente o aplicar fuerza bruta sobre textos sospechosos para recuperar el desplazamiento original.

El proyecto nace como material de apoyo para la materia **Técnicas Sistemáticas de Hackeo** y sirve como un laboratorio introductorio para comprender cómo operan los cifrados por sustitución monoalfabética y por qué son vulnerables a ataques de criptoanálisis elemental.

---

## Tabla de contenidos

1. [Título y Descripción](#título-y-descripción)
2. [Requisitos e Instalación](#requisitos-e-instalación)
3. [Uso (Ejemplos)](#uso-ejemplos)
4. [Arquitectura del proyecto](#arquitectura-del-proyecto)
5. [Tecnologías](#tecnologías)
6. [Contribución](#contribución)
7. [Licencia](#licencia)
8. [Contacto](#contacto)

---

## Requisitos e Instalación

CipherLab es un proyecto **front-end puro** (HTML + CSS + JavaScript con ES Modules), por lo que **no requiere Node.js, npm, ni proceso de build**. Únicamente necesita un servidor HTTP estático para evitar las restricciones del protocolo `file://` (los ES Modules y `fetch()` no funcionan si se abre `index.html` directamente con doble clic).

### Requisitos

- Navegador web moderno (Chrome 90+, Firefox 90+, Edge 90+, Safari 14+).
- Un servidor HTTP estático local. Opciones recomendadas:
  - **Python 3** (ya viene en Linux/macOS y suele estar en Windows):
    ```bash
    python -m http.server 8000
    ```
  - **Node.js** (si ya está instalado):
    ```bash
    npx serve .
    ```
  - **PHP**:
    ```bash
    php -S localhost:8000
    ```
  - **Extensión Live Server** de VS Code (clic derecho sobre `index.html` → *Open with Live Server*).

### Puesta en marcha

1. Clonar o descargar el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd Cifrador
   ```
2. Iniciar un servidor HTTP en la raíz del proyecto (la misma carpeta donde está `index.html`).
3. Abrir en el navegador:
   ```
   http://localhost:8000/
   ```
4. La pestaña **Alfabeto** se carga por defecto; configure primero el conjunto de caracteres antes de usar el Cifrador o el Descifrador.

> **Importante:** No abrir `index.html` con doble clic. El navegador bloqueará los módulos ES y los `fetch()` a `pestanas/*.html` por la política CORS de `file://`.

---

## Uso (Ejemplos)

### 1. Configurar el alfabeto

En la pestaña **Alfabeto**, pegue o escriba el conjunto de caracteres que define el espacio de cifrado. Los duplicados se eliminan automáticamente y se conserva el orden de aparición, que es el que determina la posición de cada símbolo.

```
abcdefghijklmnñopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
```

Pulse **Cargar Alfabeto**. El indicador del header cambiará a `ALFABETO: NN chars` y se mostrará la vista previa en píldoras.

### 2. Cifrar un mensaje (César)

En la pestaña **Cifrador**:

- **Mensaje original:** `Hola mundo`
- **Desplazamiento (N):** `3`
- Pulse **Cifrar con César**.

Resultado esperado (con el alfabeto anterior):

```
Krod pxqgr
```

Los caracteres que **no pertenecen al alfabeto** (espacios, signos) se conservan literalmente.

### 3. Cifrar con Atbash

Atbash es un cifrado **involutivo**: aplicar la operación dos veces devuelve el texto original.

- **Mensaje original:** `Hola`
- Pulse **Cifrar con Atbash**.

```
Sloz
```

### 4. Descifrar por fuerza bruta

En la pestaña **Descifrador**, pegue un mensaje sospechoso y pulse **Analizar y Descifrar Mensaje**. El sistema:

- Genera todas las rotaciones César posibles (`módulo 1 … L-1`) y las lista en pantalla.
- Aplica Atbash una sola vez (no requiere fuerza bruta por ser involutivo).

Esto permite identificar visualmente la rotación que produce un texto legible cuando **no se conoce el desplazamiento** utilizado por el emisor.

### 5. Fórmulas de referencia

| Algoritmo | Cifrado              | Descifrado            |
|-----------|----------------------|-----------------------|
| CÉSAR     | `(pos + N) mod L`    | `(pos − N) mod L`     |
| ATBASH    | `(L − 1) − pos`      | `(L − 1) − pos`       |

Donde `L` es la longitud del alfabeto, `N` el desplazamiento y `pos` la posición (base 0) del caracter en el alfabeto.

---

## Arquitectura del proyecto

```
Cifrador/
├── index.html              # Shell de la SPA (header + nav + #main-content)
├── estilos/
│   └── estilos.css         # Estilos globales (estética industrial/terminal)
├── js/
│   ├── main.js             # Controlador: enrutamiento por pestañas y eventos
│   ├── alfabeto.js         # Clase Alfabeto + estado global (window.__alfabetoActual)
│   ├── cesar.js            # cifrarCesar, descifrarCesar, fuerzaBrutaCesar
│   └── atbash.js           # cifrarAtbash (involutivo)
└── pestanas/
    ├── alfabeto.html       # Vista: configuración del alfabeto
    ├── cifrador.html       # Vista: cifrado César + Atbash
    └── descifrador.html    # Vista: fuerza bruta + espejo Atbash
```

**Flujo de ejecución:**

1. `index.html` carga `js/main.js` como módulo ES.
2. `main.js` registra los clics en la barra de pestañas.
3. Al activar una pestaña, `main.js` hace `fetch('pestanas/<x>.html')`, inyecta el HTML en `#main-content` y conecta los listeners específicos llamando a `iniciarEventosX()`.
4. El alfabeto activo se publica en `window.__alfabetoActual` (referencia viva), lo que permite que `cesar.js` y `atbash.js` lo lean en tiempo de ejecución sin problemas de *snapshotting* propios de los `import`.

---

## Tecnologías

- **HTML5** — estructura semántica de la SPA y de las vistas inyectadas.
- **CSS3** — diseño *dark/industrial* con tipografías `Share Tech Mono`, `Barlow` y `Barlow Condensed`, variables CSS y layout *responsive*.
- **JavaScript (ES2020+ / ES Modules)** — sin frameworks, sin librerías, sin *bundlers*.
  - `fetch()` para carga asíncrona de las vistas.
  - `MutationObserver` y atributos ARIA para accesibilidad de pestañas.
  - `navigator.clipboard` para copiar resultados al portapapeles.
- **Sin dependencias externas** en tiempo de ejecución (las únicas fuentes se cargan vía `@import` desde Google Fonts en el CSS).

---

## Contribución

Este proyecto es de carácter **académico y educativo**, pero las contribuciones son bienvenidas:

1. Haga un *fork* del repositorio.
2. Cree una rama descriptiva:
   ```bash
   git checkout -b feature/mejora-descifrado
   ```
3. Realice sus cambios respetando el estilo existente (modular, sin frameworks, comentarios en cabecera por archivo).
4. Asegúrese de que la app sigue funcionando en los tres módulos (Alfabeto, Cifrador, Descifrador) sirviendo el proyecto desde un servidor HTTP local.
5. Envíe un *Pull Request* describiendo claramente la mejora o corrección.

> Actualmente el repositorio **no incluye un archivo `CONTRIBUTING.md`**; si su contribución es significativa, abra primero un *issue* para discutir el cambio propuesto.

### Ideas de mejora

- Sustituir `alert()` por notificaciones no bloqueantes (toast).
- Persistir el alfabeto configurado en `localStorage`.
- Exportar/importar alfabetos como archivo JSON.
- Añadir frecuencia de caracteres para asistir el criptoanálisis.
- Internacionalizar la interfaz (i18n).
- Soporte para cifrado **Vigenère** sobre el mismo alfabeto dinámico.

---

## Licencia

Este proyecto **no incluye un archivo `LICENSE`**, por lo que, por defecto, todos los derechos están reservados al autor. Si desea reutilizar, modificar o redistribuir el código, contacte previamente al autor para acordar los términos (véase la sección de [Contacto](#contacto)).

Se recomienda, para proyectos derivados, adoptar la licencia **MIT** por su simplicidad y compatibilidad con fines educativos.

---

## Contacto

- **Materia / curso:** Técnicas Sistemáticas de Hackeo — 9no cuatrimestre.
- **Repositorio:** carpeta local del proyecto (`Cifrador/`).
- **Issues / soporte:** abra un *issue* en el repositorio de su plataforma (GitHub/GitLab) o contacte al autor directamente a través de los canales institucionales de la universidad.

> Si encuentra un error o tiene una sugerencia, documéntelo con: pasos para reproducir, navegador y versión, y una captura si aplica.
