import { describe, expect, it } from 'vitest';
import { createTranslator } from '../src/engine/translator.ts';
import { applyFrenchSpacing } from '../src/engine/typography.ts';

const NBSP = ' ';

const translator = createTranslator({
  phrases: {
    Volver: 'Retour',
    Fuego: 'Feu',
    Nivel: 'Niveau',
    'Grieta ·': 'Faille ·',
    '¡Nivel {x}!': 'Niveau {x} !',
    '¡{x} salvaje apareció!': 'Un {x} sauvage apparaît !',
    'Horda de tipo {x}': 'Horde de type {x}',
    'Se lanzará a la vez que {x}. Queda un hueco libre.': 'Avec {x}. Un emplacement se libère.',
    'Se lanzará a la vez que {x}.': 'Avec {x}.',
  },
  names: { Golem: 'Grolem', Charizard: 'Dracaufeu' },
});

describe('createTranslator', () => {
  it('translates an exact phrase and keeps the surrounding whitespace', () => {
    expect(translator.translate('  Volver\n')).toBe('  Retour\n');
  });

  it('compares with inner whitespace collapsed', () => {
    expect(translator.translate('Grieta\n   ·')).toBe('Faille ·');
  });

  it('leaves text without letters and unknown text alone', () => {
    expect(translator.translate('12:30 · ×10')).toBe('12:30 · ×10');
    expect(translator.translate('Texto desconocido')).toBe('Texto desconocido');
  });

  it('keeps upper case when the source is upper case', () => {
    expect(translator.translate('VOLVER')).toBe('RETOUR');
  });

  it('fills pattern holes and translates what falls in them', () => {
    expect(translator.translate('¡Nivel 5!')).toBe(`Niveau 5${NBSP}!`);
    expect(translator.translate('Horda de tipo Fuego')).toBe('Horde de type Feu');
    expect(translator.translate('¡Charizard salvaje apareció!')).toBe(`Un Dracaufeu sauvage apparaît${NBSP}!`);
  });

  it('uses the first pattern that matches, in dictionary order', () => {
    expect(translator.translate('Se lanzará a la vez que Fuego. Queda un hueco libre.')).toBe('Avec Feu. Un emplacement se libère.');
    expect(translator.translate('Se lanzará a la vez que Fuego.')).toBe('Avec Feu.');
  });

  it('replaces whole-word fragments inside a longer text', () => {
    expect(translator.translate('Nivel 3 · fuego')).toBe('Niveau 3 · Feu');
    expect(translator.translate('Fuegos')).toBe('Fuegos');
  });

  it('matches names with their exact case only', () => {
    expect(translator.translate('Golem · Nivel 2')).toBe('Grolem · Niveau 2');
    expect(translator.translate('GOLEM · 2')).toBe('GROLEM · 2');
    expect(translator.translate('un golem de piedra')).toBe('un golem de piedra');
  });

  it('skips fragments in strict mode', () => {
    expect(translator.translate('Nivel 3 · Golem', true)).toBe('Nivel 3 · Golem');
    expect(translator.translate('Volver', true)).toBe('Retour');
    expect(translator.translate('Horda de tipo Fuego', true)).toBe('Horde de type Feu');
  });
});

describe('applyFrenchSpacing', () => {
  it('makes the space before high punctuation non-breaking', () => {
    expect(applyFrenchSpacing('Prêt ? Oui ! Titre : +45 % ; fin')).toBe(
      `Prêt${NBSP}? Oui${NBSP}! Titre${NBSP}: +45${NBSP}%${NBSP}; fin`,
    );
  });

  it('handles guillemets and leaves other spaces alone', () => {
    expect(applyFrenchSpacing('sur « Partager » puis 12:30')).toBe(`sur «${NBSP}Partager${NBSP}» puis 12:30`);
  });
});
