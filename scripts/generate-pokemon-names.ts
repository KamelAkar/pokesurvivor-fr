/**
 * Writes src/dictionary/data/pokemon.json: each Pokémon name as the game writes
 * it, mapped to its official French name (PokeAPI data). Names that are the
 * same in French are left out.
 *   npm run names
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadPokedex, projectRoot } from './upstream.ts';

const SPECIES_NAMES_URL = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_species_names.csv';
const FRENCH_LANGUAGE_ID = '5';
const OUTPUT = path.join(projectRoot, 'src/dictionary/data/pokemon.json');

async function loadFrenchNames(): Promise<Map<number, string>> {
  const response = await fetch(SPECIES_NAMES_URL);
  if (!response.ok) throw new Error(`PokeAPI answered ${response.status}`);
  const names = new Map<number, string>();
  for (const line of (await response.text()).split('\n').slice(1)) {
    const [speciesId, languageId, name] = line.split(',');
    if (languageId === FRENCH_LANGUAGE_ID && speciesId && name) names.set(Number(speciesId), name);
  }
  return names;
}

const frenchNames = await loadFrenchNames();
const dictionary: Record<string, string> = {};
for (const { dex, name } of loadPokedex()) {
  const french = frenchNames.get(dex);
  if (!french) throw new Error(`No French name for #${dex} ${name}`);
  if (french !== name) dictionary[name] = french;
}
writeFileSync(OUTPUT, `${JSON.stringify(dictionary, null, 2)}\n`);
console.info(`${Object.keys(dictionary).length} names written to ${OUTPUT}`);
