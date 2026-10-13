/** The game's own language setting ('es' or 'en'), in the page's localStorage. */
const GAME_LANGUAGE_KEY = 'ps.lang';
/** This extension's switch. Absent means on: installing it is asking for French. */
const PREFERENCE_KEY = 'psfr.enabled';

export function isFrenchEnabled(): boolean {
  try {
    return localStorage.getItem(PREFERENCE_KEY) !== '0';
  } catch {
    return true;
  }
}

export function setFrenchEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(PREFERENCE_KEY, enabled ? '1' : '0');
  } catch {
    // Storage is blocked: nothing to remember, French stays on.
  }
}

export function setGameLanguage(language: string): void {
  try {
    localStorage.setItem(GAME_LANGUAGE_KEY, language);
  } catch {
    // Storage is blocked: the game falls back to the browser language.
  }
}

/**
 * The dictionary is keyed by Spanish text, so the game must run in Spanish.
 * Its saved choice is left untouched: only what the game reads is overridden,
 * and turning French off brings the previous language back.
 */
export function forceSpanishSource(): void {
  const getItem = Storage.prototype.getItem;
  Storage.prototype.getItem = function (key) {
    return key === GAME_LANGUAGE_KEY ? 'es' : getItem.call(this, key);
  };
}
