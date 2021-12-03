module.exports = {
    extends: ['../../webapps-common/lint/.eslintrc-jest.js'],
    env: {
        node: true
    },
    overrides: [{
        files: ['*/*.test.ts'],
        extends: [
            '../../webapps-common/lint/.eslintrc-typescript.js'
        ],
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint']
    }]
};
