module.exports = {
    presets: [
        ['@babel/preset-env', {targets: "defaults"}]
    ],
    plugins: [
        '@babel/plugin-transform-modules-umd',
        'babel-plugin-transform-import-meta',
    ],
    sourceMaps: "inline"
};
