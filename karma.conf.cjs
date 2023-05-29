process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            'src/stream-status.js',
            'src/chat-stream-client.js',
            'test/chat-stream-client.spec.js'
        ],
        preprocessors: {
            'src/**/*.js': ['babel', 'sourcemap'],
            'test/**/*.js': ['babel', 'sourcemap']
        },

        sourceMapLoader: {
            useSourceRoot: '/sources'
        },
        babelPreprocessor: {
            options: {
                presets: ['@babel/preset-env'],
                sourceMap: 'inline'
            },
            filename: function (file) {
                return file.originalPath.replace(/\.js$/, '.es5.js');
            },
            sourceFileName: function (file) {
                return file.originalPath;
            }
        },
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        // browsers: ['Chrome'],
        browsers: ['ChromeHeadless'],
        singleRun: true,
        concurrency: Infinity
    });
};
