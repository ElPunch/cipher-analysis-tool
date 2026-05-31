/**
 * js/atbash.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Implementa el Cifrado Atbash usando el alfabeto dinámico global.
 *
 * Funcionamiento (involutivo — cifrar y descifrar es la misma operación):
 *   nuevaPosicion = (Longitud - 1) - PosicionActual
 *
 * Lee el alfabeto desde window.__alfabetoActual (referencia viva, siempre actual).
 * Exporta: cifrarAtbash
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Accede al alfabeto activo en tiempo de ejecución. */
function getAlfabeto() {
    return window.__alfabetoActual ?? null;
}

/** Guard de seguridad. */
function verificarGuard() {
    if (!getAlfabeto()) {
        alert("⚠️ Acción bloqueada: Primero debes ir a la pestaña 'Alfabeto' y configurar el conjunto de caracteres.");
        return false;
    }
    return true;
}

/**
 * Aplica el espejo inverso Atbash.
 * Funciona tanto para cifrar como para descifrar (operación involutiva).
 *
 * @param {string} mensaje  Texto de entrada (plano o cifrado)
 * @returns {string}
 */
export function cifrarAtbash(mensaje) {
    if (!verificarGuard()) return '';
    const alfa = getAlfabeto();
    return Array.from(mensaje).map(c => {
        const pos = alfa.obtenerPosicion(c);
        if (pos === -1) return c;
        return alfa.obtenerCaracter((alfa.longitud - 1) - pos);
    }).join('');
}