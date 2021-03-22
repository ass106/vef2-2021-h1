module.exports = {
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-underscore-dangle': 0,
    'prefer-promise-reject-errors': 0,
    'object-shorthand': 0,
    // Viljum frekar named exports
    'import/prefer-default-export': 0,

    // Verðum að hafa extensions út af es modules
    'import/extensions': 0,

    // Skilgreinum að þetta sé rótin í verkefninu okkar, þar sem það er annað
    // package.json skjal í ./src
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,

    // Leyfum console.info, warn og error
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],

    'no-restricted-syntax': 0,
    'guard-for-in': 0,
    'no-continue': 0,
  },
};
