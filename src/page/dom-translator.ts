import type { Translator } from '../engine/translator.ts';

const TRANSLATED_ATTRIBUTES = ['placeholder', 'title', 'alt', 'aria-label'];
const NEVER_TRANSLATED = 'script, style, code';
/** Player-written text (nicknames) is marked this way by the game. */
const UNTOUCHED = '[translate="no"]';
/**
 * Zones the game marks translate="no" because it writes them per language
 * itself. Running in Spanish, they still need translating, but only as whole
 * phrases: a half-translated paragraph reads worse than the original.
 */
const STRICT_ZONES = '.news-day, #user-pill';

type Mode = 'skip' | 'strict' | 'full';

function modeOf(element: Element | null): Mode {
  if (!element || element.closest(NEVER_TRANSLATED)) return 'skip';
  if (element.closest(STRICT_ZONES)) return 'strict';
  return element.closest(UNTOUCHED) ? 'skip' : 'full';
}

/** Translates the page as it is parsed and every later change the game makes to it. */
export function translateDocument(translator: Translator): void {
  const written = new WeakMap<Text, string>();

  function translateTextNode(node: Text): void {
    const mode = modeOf(node.parentElement);
    if (mode === 'skip') return;
    const value = node.nodeValue ?? '';
    if (written.get(node) === value) return;
    const result = translator.translate(value, mode === 'strict');
    written.set(node, result);
    if (result !== value) node.nodeValue = result;
  }

  function translateAttributes(element: Element): void {
    const mode = modeOf(element);
    if (mode === 'skip') return;
    for (const name of TRANSLATED_ATTRIBUTES) {
      const value = element.getAttribute(name);
      if (!value) continue;
      const result = translator.translate(value, mode === 'strict');
      if (result !== value) element.setAttribute(name, result);
    }
  }

  function walk(root: Node): void {
    if (root instanceof Text) {
      translateTextNode(root);
      return;
    }
    if (!(root instanceof Element)) return;
    translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node instanceof Text) translateTextNode(node);
      else if (node instanceof Element) translateAttributes(node);
    }
  }

  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData') walk(record.target);
      else if (record.type === 'attributes' && record.target instanceof Element) translateAttributes(record.target);
      else record.addedNodes.forEach(walk);
    }
  }).observe(document, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: TRANSLATED_ATTRIBUTES,
  });
  if (document.documentElement) walk(document.documentElement);
}
