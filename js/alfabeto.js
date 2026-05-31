/**
 * js/alfabeto.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Define la clase Alfabeto y gestiona el ESTADO GLOBAL del sistema.
 *
 * El alfabeto activo se publica en window.__alfabetoActual para que
 * cesar.js y atbash.js puedan leerlo como referencia viva en cualquier
 * momento (evita problemas con snapshots de ESModule exports).
 *
 * Exporta:
 *   class Alfabeto        → estructura del conjunto de caracteres
 *   cargarAlfabeto(str)   → inicializa window.__alfabetoActual
 * ─────────────────────────────────────────────────────────────────────────────
 */

export class Alfabeto {
    /**
     * @param {string|string[]} caracteresEntrada
     *   Cadena o arreglo. Los duplicados se eliminan preservando el orden.
     */
    constructor(caracteresEntrada) {
        this.caracteres = Array.from(new Set(caracteresEntrada));
        this.longitud   = this.caracteres.length;
    }

    /**
     * Devuelve el índice (base 0) del caracter en el alfabeto.
     * Retorna -1 si el caracter no pertenece al alfabeto.
     * @param {string} caracter
     * @returns {number}
     */
    obtenerPosicion(caracter) {
        return this.caracteres.indexOf(caracter);
    }

    /**
     * Devuelve el caracter en la posición indicada.
     * Aplica aritmética modular para índices negativos o fuera de rango.
     * @param {number} posicion
     * @returns {string}
     */
    obtenerCaracter(posicion) {
        const indiceCorrecto = ((posicion % this.longitud) + this.longitud) % this.longitud;
        return this.caracteres[indiceCorrecto];
    }
}

/**
 * Inicializa (o reemplaza) el alfabeto global.
 * Publica la instancia en window.__alfabetoActual.
 * Lanza alert de confirmación o de error.
 *
 * @param {string} cadena  Texto pegado por el usuario
 * @returns {Alfabeto|null}
 */
export function cargarAlfabeto(cadena) {
    const caracteres = cadena.trim();

    if (!caracteres) {
        alert('⚠️  El campo de alfabeto está vacío. Por favor ingresa al menos un caracter.');
        return null;
    }

    const instancia = new Alfabeto(Array.from(caracteres));

    // Publicar como estado global compartido
    window.__alfabetoActual = instancia;

    alert(
        `✅  Alfabeto cargado correctamente.\n` +
        `• Caracteres únicos: ${instancia.longitud}\n` +
        `• Primer caracter: "${instancia.caracteres[0]}"\n` +
        `• Último caracter: "${instancia.caracteres[instancia.longitud - 1]}"`
    );

    return instancia;
}