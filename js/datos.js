// Datos de personajes, filtro común y guardado en el dispositivo.

const ATRIBUTOS = ['Inteligencia', 'Fuerza', 'Velocidad', 'Resistencia', 'Poder', 'Combate'];

const FILTROS = {
  todos: () => true,
  marvel: h => h.editorial === 'Marvel Comics',
  dc: h => h.editorial === 'DC Comics',
  villanos: h => h.alineacion === 'malo',
};

let HEROES = [];

async function cargarHeroes() {
  const respuesta = await fetch('data/heroes.json');
  HEROES = await respuesta.json();
}

// Todo lo que guarda la app vive en una sola clave de localStorage.
const CLAVE = 'powerpick';

function leerDatos() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || {};
  } catch {
    return {};
  }
}

function guardarDatos(cambios) {
  const datos = { ...leerDatos(), ...cambios };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // Sin almacenamiento (modo privado): se juega igual, solo no se guarda.
  }
  return datos;
}

function filtroActual() {
  const f = leerDatos().filtro;
  return FILTROS[f] ? f : 'todos';
}

function heroesFiltrados() {
  return HEROES.filter(FILTROS[filtroActual()]);
}

function alAzar(lista, aleatorio = Math.random) {
  return lista[Math.floor(aleatorio() * lista.length)];
}

function borrarDatos() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento no hay nada que borrar.
  }
}

// Tema: el elegido con el botón o, si no se ha elegido, el del sistema.
function temaActual() {
  return leerDatos().tema || (matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro');
}
// Se aplica nada más cargar para que la página no parpadee en claro.
document.documentElement.dataset.tema = temaActual();

// Fecha local de hoy, por ejemplo "2026-03-09".
function fechaDeHoy() {
  const hoy = new Date();
  const dos = n => String(n).padStart(2, '0');
  return hoy.getFullYear() + '-' + dos(hoy.getMonth() + 1) + '-' + dos(hoy.getDate());
}

// Generador de números al azar que siempre da la misma secuencia para el
// mismo texto (mulberry32 con semilla FNV-1a). Sirve para el reto diario.
function generadorAleatorio(texto) {
  let a = 2166136261;
  for (const letra of texto) a = Math.imul(a ^ letra.charCodeAt(0), 16777619);
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
