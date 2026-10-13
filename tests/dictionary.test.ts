import { describe, expect, it } from 'vitest';
import { phraseParts, phrases, pokemonNames } from '../src/dictionary/index.ts';
import { createTranslator } from '../src/engine/translator.ts';
import { applyFrenchSpacing } from '../src/engine/typography.ts';

const HOLE = '{x}';
const FILLER = '7';
const countHoles = (text: string): number => text.split(HOLE).length - 1;
const entries = Object.entries(phrases);

describe('French dictionary', () => {
  it('defines each Spanish text in a single part', () => {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];
    for (const [part, dictionary] of Object.entries(phraseParts)) {
      for (const key of Object.keys(dictionary)) {
        const first = seen.get(key);
        if (first) duplicates.push(`${key} (${first}, ${part})`);
        else seen.set(key, part);
      }
    }
    expect(duplicates).toEqual([]);
  });

  it('has no empty translation', () => {
    const empty = [...entries, ...Object.entries(pokemonNames)].filter(([, french]) => !french.trim()).map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it('keeps the same number of holes on both sides', () => {
    const mismatched = entries.filter(([spanish, french]) => countHoles(spanish) !== countHoles(french)).map(([key]) => key);
    expect(mismatched).toEqual([]);
  });

  it('uses no em dash or en dash in French text', () => {
    const dashed = entries.filter(([, french]) => /[–—]/.test(french)).map(([key]) => key);
    expect(dashed).toEqual([]);
  });

  it('lets every pattern be reached: none is shadowed by an earlier one', () => {
    const translator = createTranslator({ phrases, names: pokemonNames });
    const shadowed = entries
      .filter(([spanish]) => spanish.includes(HOLE))
      .filter(([spanish, french]) => {
        const expected = applyFrenchSpacing(french.replaceAll(HOLE, FILLER));
        return translator.translate(spanish.replaceAll(HOLE, FILLER)) !== expected;
      })
      .map(([key]) => key);
    expect(shadowed).toEqual([]);
  });
});
