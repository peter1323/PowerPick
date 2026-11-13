// Genera data/heroes.json a partir de data/all.json (akabab/superhero-api).
// Uso: node tools/filtrar.js
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'data');
const todos = JSON.parse(fs.readFileSync(path.join(dir, 'all.json'), 'utf8'));

const ATRIBUTOS = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

const heroes = todos
  .filter(p => {
    const s = p.powerstats || {};
    const statsOk = ATRIBUTOS.every(a => Number.isFinite(s[a]) && s[a] > 0);
    const img = p.images && p.images.md;
    return statsOk && img && !/no-portrait/.test(img);
  })
  .map(p => ({
    id: p.id,
    nombre: p.name,
    imagen: p.images.md,
    editorial: (p.biography.publisher || '').replace('null', '') || 'Otra',
    alineacion: p.biography.alignment === 'good' ? 'bueno'
      : p.biography.alignment === 'bad' ? 'malo' : 'neutral',
    // orden: inteligencia, fuerza, velocidad, resistencia, poder, combate
    stats: ATRIBUTOS.map(a => p.powerstats[a]),
  }));

fs.writeFileSync(path.join(dir, 'heroes.json'), JSON.stringify(heroes));

const cuenta = f => heroes.filter(f).length;
console.log('Original:', todos.length, '-> Filtrados:', heroes.length);
console.log('Marvel:', cuenta(h => h.editorial === 'Marvel Comics'),
  '| DC:', cuenta(h => h.editorial === 'DC Comics'),
  '| Villanos:', cuenta(h => h.alineacion === 'malo'),
  '| Buenos:', cuenta(h => h.alineacion === 'bueno'),
  '| Neutrales:', cuenta(h => h.alineacion === 'neutral'));
console.log('Ejemplo:', JSON.stringify(heroes.find(h => h.nombre === 'Spider-Man') || heroes[0], null, 2));
