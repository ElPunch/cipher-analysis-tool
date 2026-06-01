/**
 * js/main.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Controlador principal de la SPA.
 *
 * Responsabilidades:
 *   1. Enrutamiento de pestañas: carga asíncrona (fetch) de HTML desde pestanas/
 *   2. Inyección del HTML en #main-content
 *   3. Registro de eventos DOM específicos de cada pestaña tras su carga
 *   4. Sincronización del indicador de estado del alfabeto en el header
 *
 * Estado global: window.__alfabetoActual (instancia de Alfabeto o null)
 *   - Escrito por: cargarAlfabeto() en js/alfabeto.js
 *   - Leído por:   js/cesar.js, js/atbash.js, js/main.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cargarAlfabeto }            from './alfabeto.js';
import { cifrarCesar, fuerzaBrutaCesar } from './cesar.js';
import { cifrarAtbash }              from './atbash.js';

// Inicializar estado global
window.__alfabetoActual = null;

// ── Caché HTML de pestañas ────────────────────────────────────────────────────
const cache = {};

const TABS = {
    alfabeto:    'pestanas/alfabeto.html',
    cifrador:    'pestanas/cifrador.html',
    descifrador: 'pestanas/descifrador.html',
};

// ── Referencias DOM ───────────────────────────────────────────────────────────
const mainContent  = document.getElementById('main-content');
const tabButtons   = document.querySelectorAll('.tab-btn');
const headerStatus = document.getElementById('header-status');
const headerLabel  = document.getElementById('header-label');

// ── Actualizar badge de estado en el header ───────────────────────────────────
function actualizarHeaderEstado() {
    const actual = window.__alfabetoActual;
    if (actual) {
        headerStatus.classList.add('active');
        headerLabel.textContent = `ALFABETO: ${actual.longitud} chars`;
    } else {
        headerStatus.classList.remove('active');
        headerLabel.textContent = 'SIN ALFABETO';
    }
}

// ── Carga asíncrona de pestañas ───────────────────────────────────────────────
async function cargarPestana(nombre) {
    mainContent.innerHTML = `
        <div class="tab-loading">
            <div class="spinner"></div>
            CARGANDO MÓDULO...
        </div>`;

    try {
        if (!cache[nombre]) {
            const res = await fetch(TABS[nombre]);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            cache[nombre] = await res.text();
        }

        mainContent.innerHTML = cache[nombre];

        switch (nombre) {
            case 'alfabeto':    iniciarEventosAlfabeto();    break;
            case 'cifrador':    iniciarEventosCifrador();    break;
            case 'descifrador': iniciarEventosDescifrador(); break;
        }

        sincronizarEstadoPestana(nombre);

    } catch (err) {
        mainContent.innerHTML = `
            <div class="tab-loading" style="color:var(--red)">
                Error cargando el módulo: ${err.message}<br>
                <small style="margin-top:0.5rem;display:block;">
                    Asegúrate de servir el proyecto desde un servidor HTTP (no file://).
                </small>
            </div>`;
        console.error('[main.js] Error en fetch de pestaña:', err);
    }
}

// ── Sincronizar indicador visual en la pestaña Alfabeto ───────────────────────
function sincronizarEstadoPestana(nombre) {
    if (nombre !== 'alfabeto') return;

    const actual    = window.__alfabetoActual;
    const indicator = document.getElementById('estado-alfabeto');
    const preview   = document.getElementById('chars-preview');
    const countEl   = document.getElementById('alpha-count');
    const textarea  = document.getElementById('input-alfabeto');

    if (!indicator) return;

    if (actual) {
        indicator.className = 'status-indicator active';
        indicator.innerHTML = `<span class="status-dot"></span> ACTIVO — ${actual.longitud} caracteres únicos`;
        if (preview) {
            preview.innerHTML = actual.caracteres
                .map(c => `<span class="char-pill">${c === ' ' ? '␣' : escapeHtml(c)}</span>`)
                .join('');
        }
        if (textarea) textarea.value = actual.caracteres.join('');
        if (countEl)  countEl.textContent = actual.longitud;
    } else {
        indicator.className = 'status-indicator unconfigured';
        indicator.innerHTML = `<span class="status-dot"></span> SIN CONFIGURAR`;
        if (preview) preview.innerHTML = '';
        if (countEl) countEl.textContent = '0';
    }
}

// ── Pestaña Alfabeto ──────────────────────────────────────────────────────────
function iniciarEventosAlfabeto() {
    const btnCargar  = document.getElementById('btn-cargar-alfabeto');
    const btnLimpiar = document.getElementById('btn-limpiar-alfabeto');
    const textarea   = document.getElementById('input-alfabeto');

    if (btnCargar) {
        btnCargar.addEventListener('click', () => {
            const cadena    = textarea?.value ?? '';
            const resultado = cargarAlfabeto(cadena);
            if (resultado) {
                sincronizarEstadoPestana('alfabeto');
                actualizarHeaderEstado();
                // Invalidar caché para que cifrador/descifrador recarguen con nuevo max
                delete cache.cifrador;
                delete cache.descifrador;
            }
        });
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            window.__alfabetoActual = null;
            if (textarea) textarea.value = '';
            sincronizarEstadoPestana('alfabeto');
            actualizarHeaderEstado();
            Object.keys(cache).forEach(k => delete cache[k]);
        });
    }

    // Preview en tiempo real
    if (textarea) {
        textarea.addEventListener('input', () => {
            const preview = document.getElementById('chars-preview');
            const countEl = document.getElementById('alpha-count');
            const unicos  = Array.from(new Set(Array.from(textarea.value)));
            if (preview) {
                preview.innerHTML = unicos
                    .map(c => `<span class="char-pill">${c === ' ' ? '␣' : escapeHtml(c)}</span>`)
                    .join('');
            }
            if (countEl) countEl.textContent = unicos.length;
        });
    }
}

// ── Pestaña Cifrador ──────────────────────────────────────────────────────────
function iniciarEventosCifrador() {
    const btnCesar   = document.getElementById('btn-cifrar-cesar');
    const btnAtbash  = document.getElementById('btn-cifrar-atbash');
    const btnCopiar  = document.getElementById('btn-copiar-cifrado');
    const inputMsg   = document.getElementById('input-mensaje-cifrar');
    const inputDesp  = document.getElementById('input-desplazamiento');
    const outputArea = document.getElementById('output-cifrado');
    const despMax    = document.getElementById('desp-max-label');

    // Ajustar max dinámico del desplazamiento
    const actual = window.__alfabetoActual;
    if (actual && inputDesp) {
        inputDesp.max = actual.longitud - 1;
        if (despMax) despMax.textContent = actual.longitud - 1;
    } else if (despMax) {
        despMax.textContent = '— (configura alfabeto)';
    }

    if (btnCesar) {
        btnCesar.addEventListener('click', () => {
            const resultado = cifrarCesar(inputMsg?.value ?? '', inputDesp?.value ?? '1');
            if (resultado !== '' && outputArea) {
                outputArea.value = resultado;
                flashOutput(outputArea);
            }
        });
    }

    if (btnAtbash) {
        btnAtbash.addEventListener('click', () => {
            const resultado = cifrarAtbash(inputMsg?.value ?? '');
            if (resultado !== '' && outputArea) {
                outputArea.value = resultado;
                flashOutput(outputArea);
            }
        });
    }

    if (btnCopiar) {
        btnCopiar.addEventListener('click', () => {
            const txt = outputArea?.value;
            if (!txt) return;
            navigator.clipboard.writeText(txt).then(() => {
                btnCopiar.textContent = '✓ COPIADO';
                setTimeout(() => { btnCopiar.textContent = 'COPIAR'; }, 1500);
            });
        });
    }
}

// ── Pestaña Descifrador ───────────────────────────────────────────────────────
function iniciarEventosDescifrador() {
    const btnAnalizar  = document.getElementById('btn-analizar');
    const inputMsg     = document.getElementById('input-mensaje-descifrar');
    const bruteList    = document.getElementById('brute-list');
    const atbashOutput = document.getElementById('output-atbash');
    const panelRes     = document.getElementById('panel-resultados');
    const placeholder  = document.getElementById('placeholder-analisis');
    const rotCount     = document.getElementById('rotaciones-count');

    // Mostrar cuántas rotaciones se generarán
    const actual = window.__alfabetoActual;
    if (actual && rotCount) {
        rotCount.textContent = `${actual.longitud - 1} rotaciones César`;
    }

    if (btnAnalizar) {
        btnAnalizar.addEventListener('click', () => {
            const msg = inputMsg?.value?.trim() ?? '';

            if (!window.__alfabetoActual) {
                alert("Acción bloqueada: Primero debes ir a la pestaña 'Alfabeto' y configurar el conjunto de caracteres.");
                return;
            }
            if (!msg) {
                alert('El campo de mensaje está vacío.');
                return;
            }

            // Atbash
            const resAtbash = cifrarAtbash(msg);
            if (atbashOutput) atbashOutput.value = resAtbash;

            // César — fuerza bruta
            const rotaciones = fuerzaBrutaCesar(msg);
            if (bruteList) {
                bruteList.innerHTML = rotaciones.map(({ modulo, texto }) => `
                    <li>
                        <span class="mod-badge">MÓD. ${modulo}</span>
                        <span class="mod-text">${escapeHtml(texto)}</span>
                    </li>
                `).join('');
            }

            if (panelRes)    panelRes.style.display   = 'grid';
            if (placeholder) placeholder.style.display = 'none';
        });
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function flashOutput(el) {
    el.classList.remove('copy-flash');
    void el.offsetWidth;
    el.classList.add('copy-flash');
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        cargarPestana(btn.dataset.tab);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    actualizarHeaderEstado();
    const primer = document.querySelector('.tab-btn');
    if (primer) {
        primer.classList.add('active');
        primer.setAttribute('aria-selected', 'true');
        cargarPestana(primer.dataset.tab);
    }
});