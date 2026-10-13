/**
 * Spanish to French text translation, modelled on the game's own engine
 * (js/core/i18n.js). Dictionary keys are the Spanish text as displayed.
 * Three levels, tried in order:
 *   1. exact phrase                 'Volver' -> 'Retour'
 *   2. pattern with {x} holes       'Nivel {x}' -> 'Niveau {x}' (holes are translated too)
 *   3. whole-word fragments inside a longer text
 */
import { applyFrenchSpacing } from './typography.ts';

export type Dictionary = Readonly<Record<string, string>>;

export interface TranslatorSource {
  /** Interface text. Fragments are matched without regard to case. */
  readonly phrases: Dictionary;
  /** Proper names (Pokémon). Fragments are matched with their exact case. */
  readonly names: Dictionary;
}

export interface Translator {
  /** `strict` skips level 3, for zones where a partial translation would be worse than none. */
  translate(text: string, strict?: boolean): string;
}

interface Pattern {
  readonly matcher: RegExp;
  readonly looseMatcher: RegExp;
  readonly template: string;
}

const HOLE = '{x}';
const WORD = '\\p{L}\\p{N}';
const CACHE_LIMIT = 4000;
const MIN_FRAGMENT_LENGTH = 4;

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasLetter = (text: string): boolean => /\p{L}/u.test(text);
const isUpperCase = (text: string): boolean => text === text.toUpperCase() && hasLetter(text);
const matchCase = (source: string, result: string): string => (isUpperCase(source) ? result.toUpperCase() : result);

function wholeWordMatcher(words: Iterable<string>, flags: string): RegExp | null {
  const alternatives = [...words].sort((a, b) => b.length - a.length).map(escapeRegExp).join('|');
  return alternatives ? new RegExp(`(?<![${WORD}])(${alternatives})(?![${WORD}])`, flags) : null;
}

function buildPattern(source: string, template: string): Pattern {
  const body = source.split(HOLE).map(escapeRegExp).join('(.+?)');
  return { matcher: new RegExp(`^${body}$`, 'u'), looseMatcher: new RegExp(`^${body}$`, 'iu'), template };
}

export function createTranslator(source: TranslatorSource): Translator {
  const exact = new Map<string, string>();
  const exactLower = new Map<string, string>();
  const patterns: Pattern[] = [];
  const phraseFragments = new Map<string, string>();
  const nameFragments = new Map<string, string>();

  for (const [spanish, rawFrench] of Object.entries(source.phrases)) {
    const french = applyFrenchSpacing(rawFrench);
    if (!french || french === spanish) continue;
    if (spanish.includes(HOLE)) {
      patterns.push(buildPattern(spanish, french));
      continue;
    }
    exact.set(spanish, french);
    exactLower.set(spanish.toLowerCase(), french);
    if (spanish.length >= MIN_FRAGMENT_LENGTH || /\s/.test(spanish)) phraseFragments.set(spanish.toLowerCase(), french);
  }
  for (const [name, french] of Object.entries(source.names)) {
    if (!french || french === name) continue;
    exact.set(name, french);
    exactLower.set(name.toLowerCase(), french);
    nameFragments.set(name, french);
    nameFragments.set(name.toUpperCase(), french.toUpperCase());
  }

  const phraseMatcher = wholeWordMatcher(phraseFragments.keys(), 'giu');
  const nameMatcher = wholeWordMatcher(nameFragments.keys(), 'gu');
  const cache = new Map<string, string>();

  function fromExact(body: string): string | undefined {
    const direct = exact.get(body);
    if (direct !== undefined || !isUpperCase(body)) return direct;
    const loose = exactLower.get(body.toLowerCase());
    return loose === undefined ? undefined : loose.toUpperCase();
  }

  function fromPattern(body: string, strict: boolean): string | undefined {
    const upper = isUpperCase(body);
    for (const pattern of patterns) {
      const match = (upper ? pattern.looseMatcher : pattern.matcher).exec(body);
      if (!match) continue;
      let hole = 1;
      const filled = pattern.template.replaceAll(HOLE, () => translateText(match[hole++] ?? '', strict));
      return matchCase(body, filled);
    }
    return undefined;
  }

  function fromFragments(body: string): string {
    let result = body;
    if (phraseMatcher) {
      result = result.replace(phraseMatcher, (word) => matchCase(word, phraseFragments.get(word.toLowerCase()) ?? word));
    }
    if (nameMatcher) result = result.replace(nameMatcher, (word) => nameFragments.get(word) ?? word);
    return result;
  }

  /** Keeps the surrounding whitespace (DOM text nodes) and compares with inner whitespace collapsed. */
  function translateText(text: string, strict: boolean): string {
    const parts = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
    const body = (parts?.[2] ?? '').replace(/\s+/g, ' ');
    if (!body) return text;
    const result = fromExact(body) ?? fromPattern(body, strict) ?? (strict ? body : fromFragments(body));
    return `${parts?.[1] ?? ''}${result}${parts?.[3] ?? ''}`;
  }

  return {
    translate(text, strict = false) {
      if (!text || !hasLetter(text)) return text;
      const cacheKey = strict ? `\u0000${text}` : text;
      const cached = cache.get(cacheKey);
      if (cached !== undefined) return cached;
      const result = translateText(text, strict);
      if (cache.size > CACHE_LIMIT) cache.clear();
      cache.set(cacheKey, result);
      return result;
    },
  };
}
