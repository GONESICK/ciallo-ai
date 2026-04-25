import globals from 'globals';
import tsPlugin from 'typescript-eslint';
import jsPlugin from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        plugins: {
            js: jsPlugin,
        },
        extends: ['js/recommended'],
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
            'no-explicit-any': 'off',
        },
    },
    ...tsPlugin.configs.recommended,
    {
        files: ['apps/frontend/**/*.{ts,tsx,jsx}'],
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
        },
        languageOptions: {
            globals: globals.browser,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off', // React 17+
            'react/jsx-uses-react': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    prettierPlugin,
]);
