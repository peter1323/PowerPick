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

function opcionMenu(titulo, descripcion, clase, alPulsar) {
  const b = boton('', 'opcion ' + clase, alPulsar);
  b.append(el('strong', '', titulo), el('span', '', descripcion));
  return b;
}

function pantallaMenu() {
  const menu = el('div', 'menu');
  menu.append(
    opcionMenu('Más o menos', 'Adivina si el siguiente personaje tiene más o menos. Récord: ' +
      (leerDatos().record || 0), 'boton-azul', () => jugarMasMenos()),
    opcionMenu('Draft · 1 jugador', '5 rondas: elige uno de cada tres y forma el mejor equipo.',
      'boton-verde', () => jugarDraft(1)),
    opcionMenu('Draft · 2 jugadores', 'Pasad el móvil: gana el equipo con más puntos.',
      'boton-naranja', () => jugarDraft(2)),
  );
  mostrar(menu);
}

const pantallaInicial = pantallaMenu;

selectorFiltro.value = filtroActual();
selectorFiltro.onchange = () => {
  guardarDatos({ filtro: selectorFiltro.value });
  pantallaInicial();
};

cargarHeroes()
  .then(() => pantallaInicial())
  .catch(() => mostrar(el('p', 'vineta aviso', 'No se han podido cargar los personajes. Recarga la página.')));
