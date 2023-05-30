# ChatStreamJs

[English](https://github.com/riversun/ChatStreamJs/blob/main/README.md) | [&#26085;&#26412;&#35486;](https://github.com/riversun/ChatStreamJs/blob/main/README_ja.md)


ChatStreamJs is a web front-end client for LLM web servers built on [ChatStream](https://pypi.org/project/chatstream/).

It can handle streaming chats that are generated sequentially by pre-trained large-scale language models and sent as WebStreaming.

[![npm version](https://badge.fury.io/js/chatstreamjs.svg)](https://badge.fury.io/js/chatstreamjs)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)


## Install

````
npm install chatstreamjs
````

## Usage

### Streaming text generation

```js
import {ChatStreamClient, StreamStatus} from 'chatstreamjs';

// Generate a ChatStream client
const client = new ChatStreamClient({
    endpoint: `http://localhost:3000/chat_stream`, // The endpoint of the ChatStream server
});

// Send a request (user's input prompt) to the ChatStream server
client.send(
    {
        user_input: 'Hello',// Input text
        onResponse: (data) => { // Response from the ChatStream server (called repeatedly for each token generation)

            const {
                // [response_text] Text responded from the server
                response_text,
                // [pos]
                // The position of the response.
                // "begin": The first token generation in this sentence generation
                // "mid": Midway token generation in this sentence generation
                // "end": The end of this sentence generation (since this is a notice of completion, response_text is null)
                pos,
                // [status]
                // Status during sentence generation
                // StreamStatus.OK: The streaming request was processed successfully
                // StreamStatus.ABORTED: The communication was interrupted (by calling the abort method oneself)
                // StreamStatus.SERVER_ERROR: A 5xx (server error) HTTP status code was returned from the server
                // StreamStatus.CLIENT_ERROR: A 4xx (client error) HTTP status code was returned from the server
                // StreamStatus.NETWORK_ERROR: The network was disconnected during communication
                // StreamStatus.FETCH_ERROR: Other unexpected communication errors
                // StreamStatus.REQUEST_ALREADY_STARTED: The send method was called again during the streaming request
                status,
                // Error details during sentence generation
                // err.json.error: Error message from the ChatStream server
                // err.json.detail: Detailed error message from the ChatStream server
                err,
                // [statusCode]
                // HTTP status code
                // statusCode==429 ... Access to the ChatStream server was concentrated and the request could not be handled. It is set at the same time as StreamStatus.CLIENT_ERROR
                // statusCode==500 ... An error occurred within the ChatStream server. It is set at the same time as StreamStatus.SERVER_ERROR
                statusCode,

            } = data;

            if (response_text) {
                console.log(`ASSISTANT: ${response_text}`);
            }

            if (pos == "end") {
                // Sentence generation by this turn's request has finished
                // However, since it may not have ended normally, handle the status
            }
        }
    });

```

The return value of `#send` is a Promise,
but it is not recommended to use `await` when calling.
Because the response from the chatstream server is called back via `onResponse`,
there is little point in awaiting.

Also, if `await` is used, subsequent processing may be blocked by `await`
when `abort` is called after the request.

### Aborting generation during sentence generation

The `abort` method can be used to explicitly disconnect
from the current communication and stop streaming text generation.

```js
client.abort();
```

Although this method appears to force the client to stop generating sentences by disconnecting from the communication, it is a very legitimate operation because the ChatStream server handles client disconnections properly.

### Regenerating sentences

You can regenerate the chat on the AI assistant side by adding `regenerate:true` to the parameter of the `send` method.

```js
client.send(
    {
        user_input: null,
        regenerate: true,// 再生成を促す
        onResponse: (data) => {
        }
    });
```

In UI implementations, it is common to use `abort` to break communication,
and then use `regenerate:true` to generate sentences again.

# Specifying fetch options

Since `fetch` is used internally for communication with ChatStream servers, you can specify the `fetch` option in **fetchOpts** as is.

## fetch options in constructor

```js
const client = new ChatStreamClient({
        endpoint: `http://localhost:3000/chat_stream`,
        fetchOpts: {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Original-Header': 'original value',
            }
        },
    }
);
```

## fetch options in send method

It is also possible to change the headers for each request,
for example, by specifying them in each send method.

In this case, headers are added to those specified in the constructor.

```js
client.send(
    {
        user_input: null,
        fetchOpts:{
            headers: {
                'Content-Type': 'application/json',
                'X-Original-Header-Now': 'original value now',
            }
        },
        onResponse: (data) => {
        }
    });
```
