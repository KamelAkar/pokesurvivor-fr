import { phrases, pokemonNames } from '../dictionary/index.ts';
import { createTranslator } from '../engine/translator.ts';
import { translateCanvas, translateDialogs } from '../page/canvas-translator.ts';
import { translateDocument } from '../page/dom-translator.ts';
import { installLanguageChip } from '../page/language-chip.ts';
import { forceSpanishSource, isFrenchEnabled } from '../page/source-language.ts';

/** The game itself. The site's other pages (guide, Pokédex, /en/) are static and stay as they are. */
const GAME_PATHS = new Set(['/', '/index.html', '/dev.html']);

function start(): void {
  if (!GAME_PATHS.has(location.pathname)) return;
  const frenchEnabled = isFrenchEnabled();
  installLanguageChip(frenchEnabled);
  if (!frenchEnabled) return;

  forceSpanishSource();
  const translator = createTranslator({ phrases, names: pokemonNames });
  translateCanvas(translator);
  translateDialogs(translator);
  translateDocument(translator);
  // The game sets lang="es" while loading; left as is, the browser offers to translate the page.
  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.lang = 'fr';
  });
}

start();
