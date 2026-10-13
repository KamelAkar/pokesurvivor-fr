const NBSP = ' ';

/**
 * French puts a space before ! ? : ; % and inside « ». A plain space there can
 * wrap and leave the mark alone on the next line, so it becomes non-breaking.
 */
export function applyFrenchSpacing(text: string): string {
  return text.replace(/ (?=[!?:;%»])/g, NBSP).replace(/« /g, `«${NBSP}`);
}
