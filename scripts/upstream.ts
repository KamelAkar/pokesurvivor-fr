/**
 * Reads data out of a local clone of the game (https://github.com/JPTER78/pokesurvivor),
 * expected in ./upstream or at the path given as first argument.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export interface PokedexEntry {
  readonly dex: number;
  readonly name: string;
}

type Bilingual = readonly [spanish: string, english: string];

interface ChangelogEntry {
  readonly title?: Bilingual;
  readonly new?: readonly Bilingual[];
  readonly chg?: readonly Bilingual[];
  readonly fix?: readonly Bilingual[];
}

export const projectRoot = path.resolve(import.meta.dirname, '..');
export const upstreamRoot = path.resolve(process.argv[2] ?? path.join(projectRoot, 'upstream'));

/** The game's data files assign to a global `G`: they run in an empty sandbox that only has that object. */
function evaluate(relativePath: string, game: Record<string, unknown>): void {
  const file = path.join(upstreamRoot, relativePath);
  if (!existsSync(file)) {
    throw new Error(`${file} not found. Clone the game first: git clone https://github.com/JPTER78/pokesurvivor upstream`);
  }
  vm.runInNewContext(readFileSync(file, 'utf8'), { G: game });
}

/** Spanish keys of the game's English dictionary: every text the game knows how to translate. */
export function loadUpstreamKeys(): string[] {
  const keys = new Set<string>();
  const collector = { add: (dictionary: Record<string, string>) => Object.keys(dictionary).forEach((key) => keys.add(key)) };
  evaluate('js/data/lang-en.js', { I18n: collector });
  return [...keys];
}

export function loadPokedex(): PokedexEntry[] {
  const game: { DEX?: PokedexEntry[] } = {};
  evaluate('js/data/pokedex.js', game);
  return game.DEX ?? [];
}

/** Spanish side of the news entries. The game stores them apart from its dictionary. */
export function loadChangelogLines(): string[] {
  const game: { CHANGELOG?: ChangelogEntry[] } = {};
  evaluate('js/data/changelog.js', game);
  return (game.CHANGELOG ?? []).flatMap((entry) => [
    ...(entry.title ? [entry.title[0]] : []),
    ...[entry.new, entry.chg, entry.fix].flatMap((lines) => (lines ?? []).map(([spanish]) => spanish)),
  ]);
}
