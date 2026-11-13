// Carta de personaje: una viñeta con foto, nombre, sellos y atributos.

// Retrato genérico para cuando la imagen no carga (por ejemplo, sin internet).
const SIN_FOTO = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480">' +
  '<rect width="320" height="480" fill="#2ec4f1"/>' +
  '<circle cx="160" cy="180" r="70" fill="#111"/>' +
  '<path d="M40 480c0-110 55-170 120-170s120 60 120 170z" fill="#111"/>' +
  '<text x="160" y="205" font-family="Impact,sans-serif" font-size="80" fill="#ffd60a" text-anchor="middle">?</text>' +
  '</svg>');

function el(etiqueta, clase, texto) {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto !== undefined) nodo.textContent = texto;
  return nodo;
}

function nombreEditorial(heroe) {
  return heroe.editorial.replace(' Comics', '');
}

const TEXTO_ALINEACION = { bueno: 'Héroe', malo: 'Villano', neutral: 'Neutral' };

// Sin opciones enseña los seis atributos. Con { atributo } es una carta pequeña
// con un solo atributo en grande; con { oculto: true } el número sale como "?".
function crearCarta(heroe, opciones = {}) {
  const mini = opciones.atributo !== undefined;
  const carta = el('article', 'carta vineta' + (mini ? ' carta-mini' : ''));

  const foto = el('div', 'carta-foto');
  const img = el('img');
  img.src = heroe.imagen;
  img.alt = heroe.nombre;
  img.onerror = () => { img.onerror = null; img.src = SIN_FOTO; };
  foto.append(
    img,
    el('span', 'sello sello-editorial', nombreEditorial(heroe)),
    el('span', 'sello sello-' + heroe.alineacion, TEXTO_ALINEACION[heroe.alineacion]),
  );
  carta.append(foto, el('h2', 'carta-nombre', heroe.nombre));

  if (mini) {
    const dato = el('p', 'dato stat-' + opciones.atributo);
    dato.append(
      el('span', 'dato-nombre', ATRIBUTOS[opciones.atributo]),
      el('b', 'dato-valor', opciones.oculto ? '?' : heroe.stats[opciones.atributo]),
    );
    carta.append(dato);
    return carta;
  }

  const stats = el('ul', 'carta-stats');
  heroe.stats.forEach((valor, i) => {
    const fila = el('li', 'stat stat-' + i);
    const barra = el('div', 'barra');
    const relleno = el('i');
    relleno.style.width = valor + '%';
    barra.append(relleno);
    fila.append(el('span', 'stat-nombre', ATRIBUTOS[i]), barra, el('b', 'stat-valor', valor));
    stats.append(fila);
  });
  carta.append(stats);
  return carta;
}
