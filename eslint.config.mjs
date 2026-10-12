import tseslint from 'typescript-eslint';
export default [
  { ignores: ['**/dist/**', '**/.astro/**', '**/node_modules/**'] },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mjs'],
    languageOptions: { parser: tseslint.parser, ecmaVersion: 2022, sourceType: 'module' },
    rules: { 'no-debugger': 'error', 'no-dupe-keys': 'error', 'no-constant-binary-expression': 'error', 'eqeqeq': ['error', 'always'] }
  }
];
