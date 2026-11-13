// Modo 2: Draft.

const RONDAS = 5;
const OPCIONES = 3;

// Puntuación de un equipo. Devuelve el total y el desglose para enseñarlo.
function puntuar(equipo) {
  const base = equipo.reduce((suma, h) => suma + h.stats.reduce((a, b) => a + b, 0), 0);

  // Equilibrio: se mira la media del equipo en cada atributo.
  const medias = ATRIBUTOS.map((_, i) => equipo.reduce((suma, h) => suma + h.stats[i], 0) / equipo.length);
  const minima = Math.min(...medias);
  const detalles = [];
  let equilibrio = 0;
  if (minima >= 60) {
    equilibrio += 200;
    detalles.push('Equipo muy completo, los seis atributos con media de 60 o más: +200');
  } else if (minima >= 50) {
    equilibrio += 100;
    detalles.push('Equipo equilibrado, los seis atributos con media de 50 o más: +100');
  }
  medias.forEach((media, i) => {
    if (media < 35) {
      equilibrio -= 75;
      detalles.push('Punto débil, ' + ATRIBUTOS[i].toLowerCase() + ' con media de ' + Math.round(media) + ': −75');
    }
  });

  let sinergias = 0;
  if (equipo.every(h => h.editorial === equipo[0].editorial) && equipo[0].editorial !== 'Otra') {
    sinergias += 250;
    detalles.push('Todos de ' + nombreEditorial(equipo[0]) + ': +250');
  }
  if (equipo.every(h => h.alineacion === 'malo')) {
    sinergias += 200;
    detalles.push('Todos villanos: +200');
  }
  if (equipo.every(h => h.alineacion === 'bueno')) {
    sinergias += 150;
    detalles.push('Todos héroes: +150');
  }

  return { base, equilibrio, sinergias, total: base + equilibrio + sinergias, detalles };
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
  );
  return panel;
}

function jugarDraft(numJugadores) {
  const disponibles = [...heroesFiltrados()];
  const equipos = Array.from({ length: numJugadores }, () => []);
  let turno = 0;

  const nombreJugador = j => (numJugadores === 1 ? 'Tu equipo' : 'Jugador ' + (j + 1));

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
      el('p', 'nota', nombreJugador(jugador)), filaEquipo(equipos[jugador]));
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
    nodos.push(paneles, botones);
    mostrar(...nodos);
    scrollTo(0, 0);
  }

  siguienteTurno();
}
