// Modo 2: Draft.

const RONDAS = 5;
const OPCIONES = 3;

// Reglas de puntuación. Se usan para calcular y para explicarlas en pantalla.
const REGLAS = {
  mediaCompleto: 60, bonusCompleto: 200,
  mediaEquilibrado: 50, bonusEquilibrado: 100,
  mediaDebil: 35, penalizacionDebil: 75,
  bonusEditorial: 250, bonusVillanos: 200, bonusHeroes: 150,
};

// Puntuación de un equipo. Devuelve el total y el desglose para enseñarlo.
function puntuar(equipo) {
  const base = equipo.reduce((suma, h) => suma + h.stats.reduce((a, b) => a + b, 0), 0);

  // Equilibrio: se mira la media del equipo en cada atributo.
  const medias = ATRIBUTOS.map((_, i) => equipo.reduce((suma, h) => suma + h.stats[i], 0) / equipo.length);
  const minima = Math.min(...medias);
  const detalles = [];
  let equilibrio = 0;
  if (minima >= REGLAS.mediaCompleto) {
    equilibrio += REGLAS.bonusCompleto;
    detalles.push('Equipo muy completo, los seis atributos con media de ' + REGLAS.mediaCompleto +
      ' o más: +' + REGLAS.bonusCompleto);
  } else if (minima >= REGLAS.mediaEquilibrado) {
    equilibrio += REGLAS.bonusEquilibrado;
    detalles.push('Equipo equilibrado, los seis atributos con media de ' + REGLAS.mediaEquilibrado +
      ' o más: +' + REGLAS.bonusEquilibrado);
  }
  medias.forEach((media, i) => {
    if (media < REGLAS.mediaDebil) {
      equilibrio -= REGLAS.penalizacionDebil;
      detalles.push('Punto débil, ' + ATRIBUTOS[i].toLowerCase() + ' con media de ' + Math.round(media) +
        ': −' + REGLAS.penalizacionDebil);
    }
  });

  let sinergias = 0;
  if (equipo.every(h => h.editorial === equipo[0].editorial) && equipo[0].editorial !== 'Otra') {
    sinergias += REGLAS.bonusEditorial;
    detalles.push('Todos de ' + nombreEditorial(equipo[0]) + ': +' + REGLAS.bonusEditorial);
  }
  if (equipo.every(h => h.alineacion === 'malo')) {
    sinergias += REGLAS.bonusVillanos;
    detalles.push('Todos villanos: +' + REGLAS.bonusVillanos);
  }
  if (equipo.every(h => h.alineacion === 'bueno')) {
    sinergias += REGLAS.bonusHeroes;
    detalles.push('Todos héroes: +' + REGLAS.bonusHeroes);
  }

  return { base, equilibrio, sinergias, total: base + equilibrio + sinergias, detalles };
}

// Desplegable "Cómo se puntúa" con las reglas.
function ayudaPuntuacion() {
  const ayuda = el('details', 'ayuda vineta');
  ayuda.append(el('summary', '', 'Cómo se puntúa'));
  const tabla = el('dl', 'reglas');
  [
    ['Base', 'La suma de los seis atributos de tus cinco personajes.', 'hasta 3000'],
    ['Equilibrio', 'Los seis atributos con media de equipo de ' + REGLAS.mediaCompleto + ' o más.', '+' + REGLAS.bonusCompleto],
    ['Equilibrio', 'Los seis con media de ' + REGLAS.mediaEquilibrado + ' o más, si no llega a ' + REGLAS.mediaCompleto + '.', '+' + REGLAS.bonusEquilibrado],
    ['Equilibrio', 'Por cada atributo con media por debajo de ' + REGLAS.mediaDebil + '.', '−' + REGLAS.penalizacionDebil],
    ['Sinergia', 'Todos de la misma editorial.', '+' + REGLAS.bonusEditorial],
    ['Sinergia', 'Todos villanos.', '+' + REGLAS.bonusVillanos],
    ['Sinergia', 'Todos héroes.', '+' + REGLAS.bonusHeroes],
  ].forEach(([tipo, regla, puntos]) => {
    const dt = el('dt');
    dt.append(el('strong', '', tipo + ': '), regla);
    tabla.append(dt, el('dd', '', puntos));
  });
  ayuda.append(tabla);
  return ayuda;
}

// Fila con las fotos pequeñas del equipo; los huecos sin fichar salen vacíos.
function filaEquipo(equipo) {
  const fila = el('div', 'equipo');
  for (let i = 0; i < RONDAS; i++) fila.append(crearMiniatura(equipo[i]));
  return fila;
}

function conSigno(n) {
  return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
}

function panelResultado(titulo, equipo, puntos) {
  const panel = el('section', 'resultado vineta');
  const tabla = el('dl', 'desglose');
  [['Base', puntos.base], ['Equilibrio', conSigno(puntos.equilibrio)], ['Sinergias', conSigno(puntos.sinergias)]]
    .forEach(([nombre, valor]) => tabla.append(el('dt', '', nombre), el('dd', '', valor)));
  const detalles = el('ul', 'detalles');
  puntos.detalles.forEach(d => detalles.append(el('li', '', d)));

  panel.append(
    el('h2', 'resultado-titulo', titulo),
    filaEquipo(equipo),
    el('p', 'resultado-total', puntos.total + ' puntos'),
    tabla,
    detalles,
    boton('Descargar tarjeta', 'boton-amarillo boton-tarjeta', () => descargarTarjeta(titulo, equipo, puntos)),
  );
  return panel;
}

function jugarDraft(numJugadores) {
  const disponibles = [...heroesFiltrados()];
  const equipos = Array.from({ length: numJugadores }, () => []);
  let turno = 0;

  const nombreJugador = j => (numJugadores === 1 ? 'Mi equipo' : 'Jugador ' + (j + 1));

  // Saca tres personajes de la lista: ni el fichado ni los descartados vuelven.
  function sacarOpciones() {
    return Array.from({ length: OPCIONES }, () =>
      disponibles.splice(Math.floor(Math.random() * disponibles.length), 1)[0]);
  }

  function siguienteTurno() {
    if (turno === RONDAS * numJugadores) {
      resultado();
      return;
    }
    const jugador = turno % numJugadores;
    const ronda = Math.floor(turno / numJugadores) + 1;

    const titulo = el('p', 'marcador vineta jugador-' + jugador,
      (numJugadores === 2 ? 'Jugador ' + (jugador + 1) + ' · ' : '') + 'Ronda ' + ronda + ' de ' + RONDAS);
    const trio = el('div', 'trio');
    sacarOpciones().forEach(heroe => {
      const carta = crearCarta(heroe);
      carta.append(boton('Fichar', 'boton-verde boton-fichar', () => {
        equipos[jugador].push(heroe);
        turno++;
        siguienteTurno();
      }));
      trio.append(carta);
    });

    mostrar(titulo, el('p', 'nota', 'Ficha a uno. Los otros dos no volverán a salir.'), trio,
      el('p', 'nota', nombreJugador(jugador)), filaEquipo(equipos[jugador]), ayudaPuntuacion());
    scrollTo(0, 0);
  }

  function resultado() {
    const puntos = equipos.map(puntuar);
    const datos = leerDatos();
    const cambios = { partidas: (datos.partidas || 0) + 1 };
    // El mejor equipo se guarda con los id para poder volver a pintarlo.
    puntos.forEach((p, j) => {
      const mejor = cambios.mejorEquipo || datos.mejorEquipo;
      if (!mejor || p.total > mejor.puntos) {
        cambios.mejorEquipo = { puntos: p.total, ids: equipos[j].map(h => h.id) };
      }
    });
    guardarDatos(cambios);

    const nodos = [];
    if (numJugadores === 2) {
      const [a, b] = puntos.map(p => p.total);
      nodos.push(el('p', 'marcador vineta ganador',
        a === b ? '¡Empate!' : '¡Gana el Jugador ' + (a > b ? 1 : 2) + '!'));
    } else if (cambios.mejorEquipo) {
      nodos.push(el('p', 'marcador vineta ganador', '¡Tu mejor equipo!'));
    }
    const paneles = el('div', 'resultados');
    equipos.forEach((equipo, j) => paneles.append(panelResultado(nombreJugador(j), equipo, puntos[j])));
    const botones = el('div', 'botones');
    botones.append(
      boton('Otra vez', 'boton-azul', () => jugarDraft(numJugadores)),
      boton('Menú', '', pantallaMenu),
    );
    nodos.push(paneles, botones, ayudaPuntuacion());
    mostrar(...nodos);
    scrollTo(0, 0);
  }

  siguienteTurno();
}
