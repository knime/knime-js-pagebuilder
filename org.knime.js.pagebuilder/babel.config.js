module.exports = {
    presets: [
        ['@babel/preset-env',
            {
                corejs: '3.6',
                useBuiltIns: 'entry'
            }]
    ],
    exclude: ['**/src/**/injectedScripts']
};
