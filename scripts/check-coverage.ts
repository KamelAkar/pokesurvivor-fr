/**
 * Compares the French dictionary with a local clone of the game and lists the
 * texts the game has that French does not. Run it after pulling a new version.
 *   npm run coverage
 */
import { phrases, pokemonNames } from '../src/dictionary/index.ts';
import { loadChangelogLines, loadUpstreamKeys } from './upstream.ts';

function report(title: string, lines: readonly string[]): void {
  if (!lines.length) return;
  console.info(`\n${title} (${lines.length})`);
  for (const line of lines) console.info(`  ${JSON.stringify(line)}`);
}

const upstreamKeys = loadUpstreamKeys();
const changelogLines = loadChangelogLines();
const isTranslated = (text: string): boolean => text in phrases || text in pokemonNames;

const missingKeys = upstreamKeys.filter((key) => !isTranslated(key));
const missingNews = changelogLines.filter((line) => !isTranslated(line));
const known = new Set([...upstreamKeys, ...changelogLines]);
const unknownKeys = Object.keys(phrases).filter((key) => !known.has(key));

report('Missing from the French dictionary', missingKeys);
report('News entries without a French version', missingNews);
report('French entries the game does not list (extras, or a typo in the Spanish key)', unknownKeys);

const missing = missingKeys.length + missingNews.length;
console.info(`\n${upstreamKeys.length + changelogLines.length - missing} of ${upstreamKeys.length + changelogLines.length} game texts translated.`);
process.exitCode = missing ? 1 : 0;
