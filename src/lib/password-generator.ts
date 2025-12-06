/**
 * Generador de contraseñas seguras pero fáciles de recordar
 * Patrón: palabra-palabra-numero (ej: luna-verde-42)
 */

// Listas de palabras simples en español que son fáciles de recordar y decir
const adjectives = [
    "azul",
    "rojo",
    "verde",
    "dorado",
    "plata",
    "negro",
    "blanco",
    "rapido",
    "lento",
    "grande",
    "pequeño",
    "nuevo",
    "viejo",
    "alto",
    "bajo",
    "fuerte",
    "suave",
    "dulce",
    "amargo",
    "feliz",
    "triste",
    "brillante",
    "oscuro",
    "calido",
    "frio",
    "largo",
    "corto",
    "ancho",
    "fino",
    "ligero",
];

const nouns = [
    "sol",
    "luna",
    "rio",
    "mar",
    "cielo",
    "nube",
    "viento",
    "tierra",
    "fuego",
    "agua",
    "piedra",
    "flor",
    "arbol",
    "pajaro",
    "pez",
    "gato",
    "perro",
    "leon",
    "tigre",
    "oso",
    "lobo",
    "aguila",
    "caballo",
    "estrella",
    "monte",
    "valle",
    "lago",
    "bosque",
    "campo",
    "playa",
];

/**
 * Genera una contraseña segura pero memorable
 * Formato: Adjetivo-Sustantivo-Numero (ej: Rapido-Leon-73)
 * 
 * Características:
 * - Mínimo 8 caracteres
 * - Contiene mayúsculas (primera letra de cada palabra)
 * - Contiene minúsculas (resto de las palabras)
 * - Contiene números (al final)
 * - Fácil de pronunciar y recordar
 */
export function generateMemorablePassword(): string {
    // Seleccionar palabras aleatorias
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    // Generar número aleatorio de 2-3 dígitos
    const number = Math.floor(Math.random() * 900) + 100; // 100-999

    // Capitalizar primera letra de cada palabra
    const capitalizedAdj = adjective.charAt(0).toUpperCase() + adjective.slice(1);
    const capitalizedNoun = noun.charAt(0).toUpperCase() + noun.slice(1);

    // Combinar en formato: Palabra-Palabra-Numero
    return `${capitalizedAdj}-${capitalizedNoun}-${number}`;
}

/**
 * Genera múltiples contraseñas para dar opciones
 */
export function generatePasswordOptions(count: number = 1): string[] {
    const passwords: string[] = [];
    const used = new Set<string>();

    while (passwords.length < count) {
        const password = generateMemorablePassword();
        if (!used.has(password)) {
            passwords.push(password);
            used.add(password);
        }
    }

    return passwords;
}
