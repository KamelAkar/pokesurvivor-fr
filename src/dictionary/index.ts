import type { Dictionary } from '../engine/translator.ts';
import account from './data/account.json' with { type: 'json' };
import changelog from './data/changelog.json' with { type: 'json' };
import dates from './data/dates.json' with { type: 'json' };
import menu from './data/menu.json' with { type: 'json' };
import moves from './data/moves.json' with { type: 'json' };
import names from './data/names.json' with { type: 'json' };
import pokemon from './data/pokemon.json' with { type: 'json' };
import progress from './data/progress.json' with { type: 'json' };
import run from './data/run.json' with { type: 'json' };
import settings from './data/settings.json' with { type: 'json' };
import social from './data/social.json' with { type: 'json' };

/**
 * Interface text by domain. Order matters for {x} patterns: the first one that
 * matches wins, so a longer pattern must come before a shorter one it contains.
 */
export const phraseParts: Readonly<Record<string, Dictionary>> = {
  names,
  moves,
  run,
  account,
  menu,
  progress,
  social,
  settings,
  dates,
  changelog,
};

export const phrases: Dictionary = Object.assign({}, ...Object.values(phraseParts));

/** Pokémon names as the game writes them, to their official French names. Generated: see scripts/generate-pokemon-names.ts. */
export const pokemonNames: Dictionary = pokemon;
