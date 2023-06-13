# Background

Initially, I was trying to conduct unit tests using JEST, but I found that:

- AbortController is not present.
- node-fetch does not support getReader.

While there was a polyfill for the former, it was found that node-fetch does not support webstreaming.

The following code does not work:

```
const resReader = fetch_response.body.getReader();
```

Since this is related to the core of the library, I concluded that JEST, which emulates DOM on node.js, is not suitable.

# Introducing karma to run tests directly on the browser

Therefore, I have introduced karma, which allows unit tests to be run directly on the browser.

The test framework itself will use Jasmine.

Here are the dependencies for karma:

| Dependency | Explanation |
| --- | --- |
| "karma": "^6.4.2" | Karma core, a unit test framework that runs on the browser |
| "karma-babel-preprocessor": "^8.0.2" | Karma preprocessor to convert source code and UT written in ES6 to ES5 |
| "karma-sourcemap-loader": "^0.4.0" | Karma preprocessor that enables source maps even when ES6 source code and UT are converted to ES5, but it is not working well |
| "karma-jasmine": "^5.1.0" | Used to run the Jasmine test framework on karma |
| "jasmine": "^5.0.0" | Jasmine test framework |
| "karma-chrome-launcher": "^3.2.0" | Karma plugin to handle Chrome browser |
| "puppeteer": "^20.4.0" | Used to launch Chrome in headless mode |

# babel.config.cjs

In **babel.config.cjs** the library is targeted for browsers, so it will look like this:

```js
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
```

# Setting up karma execution with karma.conf.cjs

Karma execution settings are written in **karma.conf.cjs**.

```cjs
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
        singleRun: true,// Run the test once and then finish (to prevent karma server from running indefinitely)
        concurrency: Infinity
    });
};
```

# Karma for Test Execution

To run from the command line, use:

```


npx karma start karma.conf.cjs
```

However, the server needs to be started in advance, which makes it a bit complex. I'll explain next.

# NPM Scripts for Unit Tests

To conduct unit tests on this library, we use a certain trick.

The test execution itself can be performed with:

```
npm test
```

However, before the actual test starts, a server for unit testing is started. This unit test server is equipped with a "/health_check" Web API for survival confirmation, and a "/kill" Web API to shut down the server.

At the start, server startup confirmation is performed by [server-run.cjs], which proceeds to the next step once startup confirmation is obtained.

At the end of the test, similarly, [server-kill.cjs] calls "/kill" to stop the server.

```
    "start_server": "node test/unit-test-server.js",
    "server_wake_up": "start cmd.exe /K npm run start_server",
    "server_wake_up_polling": "node server-run.cjs",
    "server_kill": "node server-kill.cjs",
    "pretest": "run-s server_wake_up server_wake_up_polling",
    "test": "npx karma start karma.conf.cjs",
    "posttest": "run-s server_kill",
```
