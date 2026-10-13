import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'upstream/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    rules: {
      'max-lines': ['error', { max: 300 }],
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    },
  },
);
