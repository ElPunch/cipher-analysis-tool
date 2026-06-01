/**
 * js/cesar.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Implementa el Cifrado César usando el alfabeto dinámico global.
 *
 * Funcionamiento:
 *   - Cifrado:     nuevaPosicion = posicionActual + desplazamiento  (mod longitud)
 *   - Descifrado:  nuevaPosicion = posicionActual - desplazamiento  (mod longitud)
 *
 * Los caracteres que NO pertenecen al alfabeto se conservan sin cambios.
 *
 * Lee el alfabeto desde window.__alfabetoActual (referencia viva, siempre actual).
 * Exporta: cifrarCesar, descifrarCesar, fuerzaBrutaCesar
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Accede al alfabeto activo en tiempo de ejecución. */
function getAlfabeto() {
    return window.__alfabetoActual ?? null;
}

/** Guard de seguridad — muestra alert y retorna false si no hay alfabeto. */
function verificarGuard() {
    if (!getAlfabeto()) {
        alert("Acción bloqueada: Primero debes ir a la pestaña 'Alfabeto' y configurar el conjunto de caracteres.");
        return false;
    }
    return true;
}

/**
 * Cifra un mensaje usando el algoritmo César.
 * @param {string} mensaje
 * @param {number} desplazamiento
 * @returns {string}
 */
export function cifrarCesar(mensaje, desplazamiento) {
    if (!verificarGuard()) return '';
    const N = parseInt(desplazamiento, 10);
    if (isNaN(N) || N < 1) {
        alert('Ingresa un desplazamiento válido (número entero ≥ 1).');
        return '';
    }
    const alfa = getAlfabeto();
    return Array.from(mensaje).map(c => {
        const pos = alfa.obtenerPosicion(c);
        return pos === -1 ? c : alfa.obtenerCaracter(pos + N);
    }).join('');
}

/**
 * Descifra un mensaje cifrado con César.
 * @param {string} mensajeCifrado
 * @param {number} desplazamiento
 * @returns {string}
 */
export function descifrarCesar(mensajeCifrado, desplazamiento) {
    if (!verificarGuard()) return '';
    const N = parseInt(desplazamiento, 10);
    if (isNaN(N) || N < 1) {
        alert('Ingresa un desplazamiento válido (número entero ≥ 1).');
        return '';
    }
    const alfa = getAlfabeto();
    return Array.from(mensajeCifrado).map(c => {
        const pos = alfa.obtenerPosicion(c);
        return pos === -1 ? c : alfa.obtenerCaracter(pos - N);
    }).join('');
}

/**
 * Genera todas las rotaciones posibles (fuerza bruta, módulos 1 … L-1).
 * @param {string} mensajeCifrado
 * @returns {{ modulo: number, texto: string }[]}
 */
export function fuerzaBrutaCesar(mensajeCifrado) {
    if (!verificarGuard()) return [];
    const alfa = getAlfabeto();
    const resultados = [];
    for (let n = 1; n < alfa.longitud; n++) {
        const texto = Array.from(mensajeCifrado).map(c => {
            const pos = alfa.obtenerPosicion(c);
            return pos === -1 ? c : alfa.obtenerCaracter(pos - n);
        }).join('');
        resultados.push({ modulo: n, texto });
    }
    return resultados;
}