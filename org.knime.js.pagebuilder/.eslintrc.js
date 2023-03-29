// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    extends: ['@knime/eslint-config/vue3-typescript', '@knime/eslint-config/vitest'],
    globals: {
        consola: true
    },
    ignorePatterns: [
        'mocks/',
        'dist-vue2/'
    ],
    settings: {
        'import/resolver': {
            alias: {
                map: [
                    ['@', './src'],
                    ['@@', '.']
                ]
            }
        }
    },
    rules: {
        'no-global-assign': ['error', {
            // `require` is needed for the esm module
            exceptions: ['require']
        }]
    }
};
