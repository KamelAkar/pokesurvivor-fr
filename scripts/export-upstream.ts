/**
 * Writes the French dictionary in the game's own format (js/data/lang-fr.js in
 * the local clone), to propose it upstream. The news and date entries are left
 * out: the game writes those per language itself.
 *   npm run export
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { phraseParts, pokemonNames } from '../src/dictionary/index.ts';
import type { Dictionary } from '../src/engine/translator.ts';
import { applyFrenchSpacing } from '../src/engine/typography.ts';
import { upstreamRoot } from './upstream.ts';

const OUTPUT = path.join(upstreamRoot, 'js/data/lang-fr.js');
const EXTENSION_ONLY = new Set(['dates', 'changelog']);
const SECTION_TITLES: Readonly<Record<string, string>> = {
  names: 'tipos, movimientos y objetos (nombres oficiales)',
  moves: 'descripciones y mejoras de los movimientos',
  run: 'partida: cartas, objetos, mejoras, clima, avisos, pausa y fin',
  account: 'inicio de sesión y test de personalidad',
  menu: 'menú, colección y gacha',
  progress: 'misiones, logros y perfil',
  social: 'amigos, sala y ranking',
  settings: 'ajustes, aviso legal y donaciones',
};
const HEADER = `/* ============ lang-fr.js: traducción al francés ============
 * Clave: el texto en español tal como sale en pantalla. {x} = hueco (nombre,
 * número...). Ver js/core/i18n.js. Los nombres de Pokémon, movimientos, objetos
 * y tipos son los oficiales en francés.
 * \\u00a0 es el espacio de no separación que el francés pone delante de ! ? : ; %
 */`;

/** Non-breaking spaces are written as escapes so they stay visible in the file. */
const quote = (text: string): string => JSON.stringify(text).replaceAll(' ', '\\u00a0');

function section(title: string, dictionary: Dictionary): string {
  const lines = Object.entries(dictionary)
    .filter(([spanish, french]) => spanish !== french)
    .map(([spanish, french]) => `  ${quote(spanish)}: ${quote(applyFrenchSpacing(french))},`);
  return [`  // ---------------- ${title} ----------------`, ...lines].join('\n');
}

const sections = Object.entries(phraseParts)
  .filter(([part]) => !EXTENSION_ONLY.has(part))
  .map(([part, dictionary]) => section(SECTION_TITLES[part] ?? part, dictionary));
sections.push(section('Pokémon', pokemonNames));

writeFileSync(OUTPUT, `${HEADER}\nG.I18n.add({\n${sections.join('\n\n')}\n}, 'fr');\n`);
console.info(`French dictionary written to ${OUTPUT}`);
