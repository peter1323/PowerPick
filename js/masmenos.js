// Modo 1: Más o menos.

const ONOMATOPEYAS = {
  acierto: ['¡ZAS!', '¡BOOM!', '¡POW!', '¡BAM!', '¡WOW!'],
  fallo: ['¡PLOF!', '¡CRASH!', '¡OUCH!', '¡ARGH!'],
};

// En caso de empate cuenta como acierto.
function acierta(valorReferencia, valorOculto, dijoMas) {
  return valorOculto === valorReferencia || (valorOculto > valorReferencia) === dijoMas;
}

// Cuenta desde 0 hasta el valor y avisa al terminar.
function animarNumero(nodo, valor, alTerminar) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodo.textContent = valor;
    alTerminar();
    return;
  }
  const duracion = 700;
  const inicio = performance.now();
  function paso(ahora) {
    const avance = Math.min((ahora - inicio) / duracion, 1);
    nodo.textContent = Math.round(valor * avance);
    if (avance < 1) requestAnimationFrame(paso);
    else alTerminar();
  }
  requestAnimationFrame(paso);
}

function crearOnomatopeya(tipo) {
  const nodo = el('div', 'onomatopeya onomatopeya-' + tipo);
  nodo.append(el('span', '', alAzar(ONOMATOPEYAS[tipo])));
  return nodo;
}

// Con diario = true es el reto diario: usa todos los personajes y una secuencia
// que sale de la fecha, así que es igual para todo el mundo ese día.
function jugarMasMenos(diario = false) {
  const fecha = fechaDeHoy();
  const aleatorio = diario ? generadorAleatorio('powerpick-' + fecha) : Math.random;
  const lista = diario ? HEROES : heroesFiltrados();
  let disponibles = [];
  let racha = 0;
  let atributo = -1;
  let referencia;
  let candidato;

  // Saca un personaje sin repetir hasta agotar la lista.
  function sacar() {
    if (!disponibles.length) disponibles = lista.filter(h => h !== referencia);
    const i = Math.floor(aleatorio() * disponibles.length);
    return disponibles.splice(i, 1)[0];
  }

  // El atributo cambia en cada ronda.
  function otroAtributo() {
    let nuevo;
    do {
      nuevo = Math.floor(aleatorio() * ATRIBUTOS.length);
    } while (nuevo === atributo);
    return nuevo;
  }

  // El récord se guarda al terminar; mientras tanto se enseña el mayor de los dos.
  function textoMarcador() {
    return (diario ? 'Reto diario · ' : '') + 'Racha: ' + racha + ' · Récord: ' + Math.max(racha, leerDatos().record || 0);
  }

  function ronda() {
    atributo = otroAtributo();
    candidato = sacar();

    const marcador = el('p', 'marcador vineta', textoMarcador());
    const duelo = el('div', 'duelo');
    const cartaOculta = crearCarta(candidato, { atributo, oculto: true });
    duelo.append(crearCarta(referencia, { atributo }), cartaOculta);

    const pregunta = el('p', 'pregunta vineta',
      '¿' + candidato.nombre + ' tiene más o menos ' + ATRIBUTOS[atributo].toLowerCase() +
      ' que ' + referencia.nombre + '?');
    const botones = el('div', 'botones');
    botones.append(
      boton('▲ Más', 'boton-verde', () => responder(true)),
      boton('▼ Menos', 'boton-rojo', () => responder(false)),
    );
    mostrar(marcador, duelo, pregunta, botones);

    function responder(dijoMas) {
      botones.querySelectorAll('button').forEach(b => { b.disabled = true; });
      const valor = candidato.stats[atributo];
      const acierto = acierta(referencia.stats[atributo], valor, dijoMas);

      animarNumero(cartaOculta.querySelector('.dato-valor'), valor, () => {
        // Si el jugador ya ha salido de la partida, no se hace nada más.
        if (!duelo.isConnected) return;
        duelo.append(crearOnomatopeya(acierto ? 'acierto' : 'fallo'));
        if (!acierto) {
          terminar(pregunta, botones);
          return;
        }
        racha++;
        if (diario) guardarDatos({ diario: { fecha, racha } });
        marcador.textContent = textoMarcador();
        setTimeout(() => {
          if (!duelo.isConnected) return;
          referencia = candidato;
          ronda();
        }, 1300);
      });
    }
  }

  function terminar(pregunta, botones) {
    const datos = leerDatos();
    const esRecord = racha > (datos.record || 0);
    guardarDatos({
      record: Math.max(racha, datos.record || 0),
      partidas: (datos.partidas || 0) + 1,
    });

    pregunta.textContent = (esRecord ? '¡Nuevo récord! ' : 'Fin de la partida. ') + 'Racha de ' + racha + '.' +
      (diario ? ' Mañana hay otro reto.' : '');
    botones.replaceChildren(boton('Menú', 'boton-azul', pantallaMenu));
    if (!diario) botones.prepend(boton('Otra vez', 'boton-azul', () => jugarMasMenos()));
    botones.querySelector('button').focus();
  }

  // El intento del día se gasta al empezar, no al terminar.
  if (diario) guardarDatos({ diario: { fecha, racha: 0 } });
  referencia = sacar();
  ronda();
}
