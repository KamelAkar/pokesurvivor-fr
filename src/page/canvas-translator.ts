import type { Translator } from '../engine/translator.ts';

/** The game sometimes draws numbers: only strings go through the dictionary. */
function translated(translator: Translator, text: unknown): string {
  return typeof text === 'string' ? translator.translate(text) : (text as string);
}

/** The in-game HUD, notices and damage labels are drawn on a canvas, not in the DOM. */
export function translateCanvas(translator: Translator): void {
  const prototype = CanvasRenderingContext2D.prototype;
  const { fillText, strokeText, measureText } = prototype;
  prototype.fillText = function (text, x, y, maxWidth) {
    fillText.call(this, translated(translator, text), x, y, maxWidth);
  };
  prototype.strokeText = function (text, x, y, maxWidth) {
    strokeText.call(this, translated(translator, text), x, y, maxWidth);
  };
  prototype.measureText = function (text) {
    return measureText.call(this, translated(translator, text));
  };
}

export function translateDialogs(translator: Translator): void {
  const { confirm, alert } = window;
  window.confirm = (message) => confirm.call(window, translated(translator, message));
  window.alert = (message) => alert.call(window, translated(translator, message));
}
