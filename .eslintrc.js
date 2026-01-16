module.exports = {
  root: true,
  extends: [
    'plugin:@wordpress/eslint-plugin/recommended',
    'plugin:@wordpress/eslint-plugin/esnext',
    'plugin:@wordpress/eslint-plugin/i18n',
    'plugin:@wordpress/eslint-plugin/react',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['@typescript-eslint', 'react-hooks', 'jsx-a11y'],
  env: {
    browser: true,
    es6: true,
    node: true,
    jquery: true,
  },
  globals: {
    wp: 'readonly',
    wpDevToolkit: 'readonly',
    console: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
  },
  rules: {
    // Import order enforcement
    'import/order': [
      'error',
      {
        groups: [
          'external', // External libraries (React, third-party)
          'builtin', // Node.js built-ins
          'internal', // WordPress packages (@wordpress/*) and stores
          'parent', // Parent directories
          'sibling', // Same level
          'index', // Index files
        ],
        pathGroups: [
          {
            pattern: '@wordpress/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@/stores/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@/components/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@/pages/**',
            group: 'parent',
            position: 'after',
          },
          {
            pattern: './**',
            group: 'sibling',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'always',
      },
    ],

    // Custom rules for this project
    'max-len': ['error', { code: 200 }],
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'prefer-template': 'error',

    // Enforce consistent use of single quotes
    'prettier/prettier': 'off',
    'jsdoc/jsdoc': 'off',

    // WordPress specific
    '@wordpress/no-unused-vars-before-return': 'error',
    '@wordpress/valid-sprintf': 'error',
    '@wordpress/i18n-text-domain': [
      'error',
      {
        allowedTextDomain: 'wp-dev-toolkit',
      },
    ],
    '@wordpress/i18n-translator-comments': 'error',
    '@wordpress/i18n-no-variables': 'error',
    '@wordpress/i18n-no-placeholders-only': 'error',
    '@wordpress/i18n-ellipsis': 'error',

    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_|title$' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off', // Allow any types since strict mode is disabled
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'off', // Disabled due to non-strict null checks
    '@typescript-eslint/prefer-nullish-coalescing': 'off', // Disabled due to non-strict null checks
    '@typescript-eslint/no-unnecessary-type-assertion': 'off', // Requires type information

    // React specific
    'react/prop-types': 'off', // TypeScript handles prop validation
    'react/react-in-jsx-scope': 'off',

    // Disable conflicting rules
    'no-unused-vars': 'off', // Use @typescript-eslint/no-unused-vars instead
    'no-undef': 'off', // TypeScript handles this
    'no-redeclare': 'off', // TypeScript handles this
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js', '**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true,
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      rules: {
        // TypeScript specific rules
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_|title$' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off', // Allow any types since strict mode is disabled
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/prefer-optional-chain': 'off', // Disabled due to non-strict null checks
        '@typescript-eslint/prefer-nullish-coalescing': 'off', // Disabled due to non-strict null checks
        '@typescript-eslint/no-unnecessary-type-assertion': 'off', // Requires type information

        // Disable conflicting rules
        'no-unused-vars': 'off', // Use @typescript-eslint/no-unused-vars instead
        'no-undef': 'off', // TypeScript handles this
        'no-redeclare': 'off', // TypeScript handles this

        // Enforce consistent use of single quotes
        'prettier/prettier': 'off',
        'jsdoc/jsdoc': 'off',

        // React specific for TypeScript
        'react/prop-types': 'off', // TypeScript handles prop validation
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
  ],
};
