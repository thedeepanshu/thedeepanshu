/**
 * Pre-commit: fix and format only the staged files, then type-check the whole
 * project once (types can break in files you didn't touch).
 */
export default {
  '*.{ts,tsx}': ['eslint --fix --max-warnings 0', 'prettier --write', () => 'tsc -b'],
  '*.{js,mjs}': ['eslint --fix --max-warnings 0', 'prettier --write'],
  '*.{json,md}': ['prettier --write'],
}
