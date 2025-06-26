module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],
  '*.{js,jsx,json,md,yml,yaml}': [
    'prettier --write',
    'git add'
  ]
};