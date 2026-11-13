// Arranque de la app y cambio de pantallas.

const pantalla = document.getElementById('pantalla');
const selectorFiltro = document.getElementById('filtro');

function mostrar(...nodos) {
  pantalla.replaceChildren(...nodos);
}

function boton(texto, clase, alPulsar) {
  const b = el('button', 'boton ' + (clase || ''), texto);
  b.type = 'button';
  b.onclick = alPulsar;
  return b;
}

// Pantalla provisional: enseña una carta al azar del filtro elegido.
function pantallaCarta() {
  const heroe = alAzar(heroesFiltrados());
  const cuenta = el('p', 'nota', heroesFiltrados().length + ' personajes con este filtro');
  mostrar(crearCarta(heroe), boton('Otro personaje', 'boton-azul', pantallaCarta), cuenta);
}

let pantallaInicial = pantallaCarta;

selectorFiltro.value = filtroActual();
selectorFiltro.onchange = () => {
  guardarDatos({ filtro: selectorFiltro.value });
  pantallaInicial();
};

cargarHeroes()
  .then(() => pantallaInicial())
  .catch(() => mostrar(el('p', 'vineta aviso', 'No se han podido cargar los personajes. Recarga la página.')));
