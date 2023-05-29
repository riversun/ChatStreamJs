# ChatStream Client Library

## Overview

ChatStreamJs is a streaming chat client library. It provides client-side utilities for communicating with a server and sending user input to the server.

## Installation

You can install this library via npm. Perform the installation using the command below:

```shell
npm install chatstreamjs
```
## Usage

```js
import {ChatStreamClient} from 'chatstream';

const client = new ChatStreamClient({
    endpoint: 'http://path-to-api/chat_stream',
    onResponse: ({response_text, pos, status, statusCode, err}) => {
        // your response handling code here...
    }
});

```

# Methods

- constructor(opts = {}): Creates an instance of the client. The opts object can include an endpoint and onResponse method.

- async send(opts = {}): Sends user input to the server. The response from the server is passed to the onResponse callback function specified in the constructor.

- abort(): Aborts the fetch request. Useful if you want to stop the request before it has finished.

# Error Handling

This library provides the following status codes for error handling:

- StreamStatus.REQUEST_ALREADY_STARTED
- StreamStatus.CLIENT_ERROR
- StreamStatus.SERVER_ERROR
- StreamStatus.ABORTED
- StreamStatus.NETWORK_ERROR
- StreamStatus.FETCH_ERROR


# Unit Test Methods

Unit tests of this library are executed on a browser.

## How to run unit tests Batch execution.

```
npm test
```

## How to run unit tests

First, start the unit test server.

```
npm run server_wake_up
```

Next, right-click on the test you want to run in webstorm and execute it (karma will start).

## Unit tests are for Windows by default, but can be run on Linux by changing one line

For Windows



For Linux

Change "pretest" as follows

```
"pretest": "run-s server_wake_up_linux server_wake_up_polling", ```` Change "pretest" to
```


## If new source code is added.

Add both the test code and the source code to be tested to **[karma.conf.cjs](karma.conf.cjs)**.
This is the basic

```
        files: [
            'src/stream-status.js',.
            
            'test/chat-stream-client.spec.js'
        ], [
```

## Background

Originally, I was going to use JEST for unit testing,

- AbortController does not exist 
- It turned out that node-fetch does not support getReader.

The former had polyfill, but node-fetch did not support getReader. The former had polyfill, but it turned out that node-fetch did not support webstreaminig
The former had polyfill, but it turned out that node-fetch did not support webstreaminig

The following code does not work

```
const resReader = fetch_response.body.getReader();
```

This part is the heart of this library,
JEST, which emulates the DOM on node.js, is not suited for this purpose.


# Introduce karma to run tests directly in the browser

Therefore, we introduced karma, which allows us to run unit tests directly in the browser.

The test framework itself uses jasmine.

The dependency for karma is shown below

<table>
	<tr>
		<td>"karma":"^6.4.2",</td>
		<td>Browser-based unit testing framework karma itself</td>.
	</tr>
	<tr>
		<td>"karma-babel-preprocessor": "^8.0.2",</td>
		<td>Preprocessor for karma to convert source code written in ES6 and UT to ES5</td>.
	</tr>
	<tr>
		<td>"karma-sourcemap-loader":"^0.4.0",</td>
		<td>Source code written in ES6, preprocessor to allow source map even when UT is ES5, but not working well</td>.
	</tr>
	<tr>
		<td>"karma-jasmine":"^5.1.0",</td>
		<td>Used to run the testing framework jasmine on karma</td>.
	</tr>
	<tr>
		<td>"jasmine":"^5.0.0",</td>
		<td>Testing Framework jasmine</td>
	</tr>
	<tr>
		<td>"karma-chrome-launcher":"^3.2.0"</td>
		<td>Plugin for handling chrome browser in karma</td>.
	</tr>
	<tr>
		<td>"puppeteer":"^20.4.0"</td>
		<td>Use to run Chrome headless</td>.
	</tr>
</table>


# babel.config.cjs

babel.config.cjs is a library for browsers in this case, so do the following

**babel.config.cjs**

```js
module.exports = {
    presets: [
        ['@babel/preset-env', {targets: "defaults"}], ['@babel/preset-env', {targets: "defaults"}
    ],.
    plugins: [
        '@babel/plugin-transform-modules-umd',.
        'babel-plugin-transform-import-meta',.
    ],.
    sourceMaps: "inline"
};
```

The following part may not be necessary.

```js
 plugins: [
        '@babel/plugin-transform-modules-umd', [
        'babel-plugin-transform-import-meta', [
    ],.
```

`@babel/plugin-transform-modules-umd` is for umd that works in the browser as well when the presets target was node.js in the first place, so.

# karma.conf.cjs to configure karma execution settings

Karma's execution configuration is written in **karma.conf.cjs**.

```cjs
process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (config) {
    config.set({
        
        files: [
            
            
            'test/chat-stream-client.spec.js'
        ],, [ 'test/chat-stream-client.spec.js'
        preprocessors: {
            'src/**/*.js': ['babel', 'sourcemap'], {
            'test/**/*.js': ['babel', 'sourcemap']
        },.

        sourceMapLoader: {
            useSourceRoot: '/sources'
        }
```
