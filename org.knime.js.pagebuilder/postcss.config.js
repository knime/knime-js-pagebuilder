const { preset, plugins } = require('webapps-common/webpack/webpack.postcss.config');

module.exports = {
    plugins: Object.assign({}, plugins, {
        'postcss-preset-env': preset
    })
};
