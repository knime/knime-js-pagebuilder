module.exports = {
    root: true,
    extends: ['@knime/eslint-config/legacy', '@knime/eslint-config/vitest'],
    overrides: [
        {
            files: ['__tests__/**'],
            extends: ['@knime/eslint-config/vue3-typescript']
        }
    ]
};
