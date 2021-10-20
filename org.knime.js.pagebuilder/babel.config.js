module.exports = {
    presets: [
        ['@babel/preset-env',
            {
                corejs: '3.6',
                useBuiltIns: 'entry'
            }]
    ],
    plugins: ['@babel/plugin-proposal-optional-chaining'],
    exclude: ['**/src/**/injectedScripts']
};
