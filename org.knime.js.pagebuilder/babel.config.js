module.exports = {
    presets: [
        ['@babel/preset-env',
            {
                corejs: '3',
                useBuiltIns: 'usage',
                targets: {
                    browsers: [
                        'edge >= 16',
                        'safari >= 9',
                        'firefox >= 57',
                        'ie >= 11',
                        'ios >= 9',
                        'chrome >= 49'
                    ]
                }
            }]
    ],
    exclude: ['**/src/**/injectedScripts']
};
