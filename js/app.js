// Arranque de la app, menú, perfil y cambio de pantallas.

const pantalla = document.getElementById('pantalla');
const selectorFiltro = document.getElementById('filtro');
const botonTema = document.getElementById('tema');

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

// El reto diario de hoy si ya se ha jugado; si no, null.
function retoDeHoy() {
  const diario = leerDatos().diario;
  return diario && diario.fecha === fechaDeHoy() ? diario : null;
}

function pantallaMenu() {
  const hecho = retoDeHoy();
  const reto = opcionMenu('Reto diario',
    hecho
      ? 'Hecho hoy: racha de ' + hecho.racha + '. Mañana hay otro.'
      : 'Más o menos con la misma secuencia para todo el mundo. Un intento al día.',
    'boton-amarillo', () => jugarMasMenos(true));
  reto.disabled = !!hecho;

  const menu = el('div', 'menu');
  menu.append(
    opcionMenu('Más o menos', 'Adivina si el siguiente personaje tiene más o menos. Récord: ' +
      (leerDatos().record || 0), 'boton-azul', () => jugarMasMenos()),
    reto,
    opcionMenu('Draft · 1 jugador', '5 rondas: elige uno de cada tres y forma el mejor equipo.',
      'boton-verde', () => jugarDraft(1)),
    opcionMenu('Draft · 2 jugadores', 'Pasad el móvil: gana el equipo con más puntos.',
      'boton-naranja', () => jugarDraft(2)),
    opcionMenu('Perfil', 'Tu récord, tu mejor equipo y tus partidas.', '', pantallaPerfil),
  );
  mostrar(menu);
}

function pantallaPerfil() {
  const datos = leerDatos();
  const hecho = retoDeHoy();

  const panel = el('section', 'resultado vineta');
  const tabla = el('dl', 'desglose');
  [
    ['Récord de racha', datos.record || 0],
    ['Partidas jugadas', datos.partidas || 0],
    ['Reto diario de hoy', hecho ? 'Racha de ' + hecho.racha : 'Sin jugar'],
  ].forEach(([nombre, valor]) => tabla.append(el('dt', '', nombre), el('dd', '', valor)));
  panel.append(el('h2', 'resultado-titulo', 'Perfil'), tabla, el('h3', 'resultado-titulo', 'Mejor equipo del Draft'));

  if (datos.mejorEquipo) {
    const equipo = datos.mejorEquipo.ids.map(id => HEROES.find(h => h.id === id)).filter(Boolean);
    panel.append(filaEquipo(equipo), el('p', 'resultado-total', datos.mejorEquipo.puntos + ' puntos'));
  } else {
    panel.append(el('p', 'nota', 'Aún no has terminado ningún Draft.'));
  }

  const botones = el('div', 'botones');
  botones.append(
    boton('Menú', 'boton-azul', pantallaMenu),
    boton('Borrar datos', 'boton-rojo', () => {
      if (!confirm('¿Borrar el récord, el mejor equipo y las partidas? No se puede deshacer.')) return;
      borrarDatos();
      aplicarTema();
      selectorFiltro.value = filtroActual();
      pantallaPerfil();
    }),
  );
  mostrar(panel, botones);
}

function aplicarTema() {
  const tema = temaActual();
  document.documentElement.dataset.tema = tema;
  botonTema.textContent = tema === 'oscuro' ? '☀ Claro' : '☾ Oscuro';
}

botonTema.onclick = () => {
  guardarDatos({ tema: temaActual() === 'oscuro' ? 'claro' : 'oscuro' });
  aplicarTema();
};
aplicarTema();

selectorFiltro.value = filtroActual();
selectorFiltro.onchange = () => {
  guardarDatos({ filtro: selectorFiltro.value });
  pantallaMenu();
};

cargarHeroes()
  .then(pantallaMenu)
  .catch(() => mostrar(el('p', 'vineta aviso', 'No se han podido cargar los personajes. Recarga la página.')));

// Permite instalar la app y jugar sin internet.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
