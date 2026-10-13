import { setFrenchEnabled, setGameLanguage } from './source-language.ts';

const GAME_CHIP = '.set-chips [data-lang]';
const FRENCH_CHIP = 'data-psfr-chip';
const ACTIVE = 'on';

function addFrenchChip(container: HTMLElement, frenchEnabled: boolean): void {
  const chip = document.createElement('button');
  chip.className = 'chip';
  chip.setAttribute(FRENCH_CHIP, '');
  chip.textContent = 'Français';
  chip.addEventListener('click', () => {
    if (frenchEnabled) return;
    setFrenchEnabled(true);
    location.reload();
  });
  container.append(chip);
  if (!frenchEnabled) return;

  container.querySelectorAll(GAME_CHIP).forEach((gameChip) => gameChip.classList.remove(ACTIVE));
  chip.classList.add(ACTIVE);
  // The game believes it runs in Spanish and would ignore a click on "Español":
  // the switch back is handled here, before the game's own handler.
  container.addEventListener(
    'click',
    (event) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-lang]') : null;
      const language = target?.dataset.lang;
      if (!language) return;
      event.stopPropagation();
      setGameLanguage(language);
      setFrenchEnabled(false);
      location.reload();
    },
    true,
  );
}

/** Adds "Français" next to "Español" and "English" each time the game draws its language setting. */
export function installLanguageChip(frenchEnabled: boolean): void {
  new MutationObserver(() => {
    const container = document.querySelector<HTMLElement>(GAME_CHIP)?.parentElement;
    if (!container || container.querySelector(`[${FRENCH_CHIP}]`)) return;
    addFrenchChip(container, frenchEnabled);
  }).observe(document, { childList: true, subtree: true });
}
