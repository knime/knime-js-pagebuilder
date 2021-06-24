module.exports = {
    presets: [
        ['@babel/preset-env',
            {
                corejs: '3',
                useBuiltIns: 'entry'
            }]
    ],
    exclude: ['**/src/**/injectedScripts']
};
