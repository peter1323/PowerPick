// Comprobaciones rápidas de la lógica del juego. Uso: node tools/pruebas.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const leer = f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
const { acierta, puntuar, generadorAleatorio } = new Function(
  // Lo mínimo del navegador que usa datos.js al cargarse.
  'const document = { documentElement: { dataset: {} } }, localStorage = { getItem: () => null },' +
  ' matchMedia = () => ({ matches: false });' +
  leer('datos.js') + leer('carta.js') + leer('masmenos.js') + leer('draft.js') +
  '; return { acierta, puntuar, generadorAleatorio };')();

// Más o menos: el empate cuenta como acierto.
assert(acierta(50, 50, true) && acierta(50, 50, false));
assert(acierta(50, 60, true) && !acierta(50, 60, false));
assert(acierta(50, 40, false) && !acierta(50, 40, true));

// Draft
const heroe = (stats, editorial, alineacion) => ({ stats, editorial, alineacion });
const cinco = h => [h, h, h, h, h];

let p = puntuar(cinco(heroe([60, 60, 60, 60, 60, 60], 'Marvel Comics', 'bueno')));
assert.deepStrictEqual([p.base, p.equilibrio, p.sinergias, p.total], [1800, 200, 400, 2400]);

p = puntuar(cinco(heroe([50, 50, 50, 50, 50, 50], 'DC Comics', 'malo')));
assert.deepStrictEqual([p.base, p.equilibrio, p.sinergias], [1500, 100, 450]);

// Dos atributos muy bajos, editoriales y alineaciones mezcladas.
const flojo = heroe([10, 20, 80, 80, 80, 80], 'Marvel Comics', 'bueno');
p = puntuar([flojo, flojo, flojo, flojo, heroe([10, 20, 80, 80, 80, 80], 'DC Comics', 'neutral')]);
assert.deepStrictEqual([p.equilibrio, p.sinergias, p.detalles.length], [-150, 0, 2]);

// "Otra" agrupa editoriales desconocidas: no cuenta como misma editorial.
assert.strictEqual(puntuar(cinco(heroe([40, 40, 40, 40, 40, 40], 'Otra', 'neutral'))).sinergias, 0);

// Reto diario: misma fecha, misma secuencia; otra fecha, otra distinta.
const secuencia = texto => { const g = generadorAleatorio(texto); return [g(), g(), g(), g()]; };
assert.deepStrictEqual(secuencia('powerpick-2026-01-01'), secuencia('powerpick-2026-01-01'));
assert.notDeepStrictEqual(secuencia('powerpick-2026-01-01'), secuencia('powerpick-2026-01-02'));
assert(secuencia('x').every(n => n >= 0 && n < 1));

console.log('Todo correcto');
