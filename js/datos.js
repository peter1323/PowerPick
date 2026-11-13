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
