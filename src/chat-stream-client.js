import {StreamStatus} from "./stream-status.js";

/**
 * Client for ChatStream(https://pypi.org/project/chatstream/) based LLM web server
 *
 * A client for a web front-end that handles chat appropriately,
 * generated sequentially by a large pre-trained language model and sent as WebStreaming
 *
 * @export
 * @class ChatStreamClient
 */
export default class ChatStreamClient {

    /**
     * Creates a new instance of StreamChatClient.
     * @param {Object} opts - Options object. It can include an `endpoint` and an `onResponse` method.
     * @param {String} opts.endpoint - URL of the endpoint to which the request is sent.
     * @param {Function} opts.onResponse - Callback function that is called when a response is received from the server. It receives an object in the following formats:
     * @param {String} opts.onResponse({response_text, pos, status}) - Response text, position information, and status. The status takes the value of the Status object.
     * @param {String} opts.onResponse({response_text, pos, status, err}) - Additionally includes error information.
     * @param {String} opts.onResponse({response_text, pos, status, statusCode, err}) - Additionally includes the HTTP status code.
     */
    constructor(opts = {}) {
        opts = {endpoint: '', ...opts}
        this.opts = opts;

        this.abortController = null;
        this.requestStarted = false;
    }

    /**
     * Sends user input
     * The response from the server will be returned in the `onResponse` specified in the constructor.
     * @param data
     * @returns {Promise<void>}
     */
    async send(opts = {}) {
        const self = this;

        // Generate an instance of AbortController
        // When a Fetch API request is aborted using AbortController,
        // the AbortController instance can only be used once, so it is generated each time 'send' is called.
        self.abortController = new AbortController();

        const {user_input, regenerate = false, onResponse} = opts;

        // Function to call the user-defined callback function `onResponse`.
        const fnCallbackOnResponse = async (out) => {
            const self = this;

            if (onResponse) {

                if (out.pos == 'end') {
                    // In the case of the last `onResponse` callback
                    // Lower the request in progress flag before the `onResponse` callback.
                    self.requestStarted = false;
                }

                await onResponse(out);
            }

            if (out.pos == 'end') {

                // 'end' can be a normal end of stream reception, forced interruption of the stream, or an error. In any case, the loop will stop.
                return {need_to_stop: true};
            } else {
                return {need_to_stop: false};
            }
        }
        if (self.requestStarted == true) {
            // - When `send` is called again while a request has already started.
            // -> Callback to indicate that a request has already been resolved.

            const out = {response_text: null, pos: 'end', status: StreamStatus.REQUEST_ALREADY_STARTED};

            await fnCallbackOnResponse(out);
            return;
        }
        self.requestStarted = true;

        try {

            const instanceLevelFetchOpts = self.opts.fetchOpts || {};
            const instanceLevelFetchOptsHeaders = instanceLevelFetchOpts['headers'] || {};
            const methodLevelFetchOpts = opts.fetchOpts || {};
            const methodLevelFetchOptsHeaders = methodLevelFetchOpts['headers'] || {};

            // fetchOpts.headers はHTTPヘッダをコンストラクタと #send 双方で追加できるよう、もう一段深いレベルでマージする
            const finalHeaders = {...instanceLevelFetchOptsHeaders, ...methodLevelFetchOptsHeaders};
            const finalFetchOpts = {...instanceLevelFetchOpts, ...methodLevelFetchOpts};

            if (Object.keys(finalHeaders).length !== 0) {
                finalFetchOpts['headers'] = finalHeaders;
            }


            const _fetchOpts = {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({user_input: user_input, regenerate: regenerate}),
                signal: this.abortController.signal // Add signal to the Fetch request.
                , ...finalFetchOpts,

            }

            const _fetch = fetch;

            const fetch_response = await _fetch(self.opts.endpoint, _fetchOpts);

            if (!fetch_response.ok) {
                // - When an HTTP level error occurs

                if (fetch_response.status >= 400 && fetch_response.status < 500) {
                    // - When a 400 series error occurs

                    // Parse the error in JSON format. If JSON parsing fails, it will be parsed as text
                    const parsedError = await self.parse_http_error(fetch_response);
                    const out = {
                        response_text: null,
                        pos: 'end',
                        status: StreamStatus.CLIENT_ERROR,
                        statusCode: fetch_response.status,
                        err: parsedError,
                        rawResponse:fetch_response,
                    }
                    console.error(`Client error occurred code:${fetch_response.status}`, parsedError)
                    await fnCallbackOnResponse(out);
                } else if (fetch_response.status >= 500) {
                    // - When a 500 series error occurs

                    // Parse the error in JSON format. If JSON parsing fails, it will be parsed as text
                    const parsedError = await self.parse_http_error(fetch_response);
                    const out = {
                        response_text: null,
                        pos: 'end',
                        status: StreamStatus.SERVER_ERROR,
                        statusCode: fetch_response.status,
                        err: parsedError,
                        rawResponse:fetch_response,
                    };
                    console.error(`Server error occurred code:${fetch_response.status}`, parsedError)
                    await fnCallbackOnResponse(out);
                }
            } else {
                // - When the request is successful

                const resReader = fetch_response.body.getReader();

                const decoder = new TextDecoder('utf-8');

                let index = 0;


                while (self.requestStarted) {
                    // Continue to receive the generated sentence data coming in the stream one by one and callback the result

                    const {done, value} = await resReader.read();
                    const decoded_text = decoder.decode(value, {stream: true});
                    const response_text = decoded_text == `` ? null : decoded_text;

                    let pos = 'mid'
                    if (index == 0) {
                        pos = 'begin';
                    } else if (done == true) {
                        pos = 'end';
                    }

                    const out = {response_text, pos, status: StreamStatus.OK,rawResponse:fetch_response,}

                    const {
                        need_to_stop
                    } = await fnCallbackOnResponse(out);

                    if (done || need_to_stop) {
                        break;
                    }
                    index++;
                }
            }

        } catch (e) {
            if (e.name === 'AbortError') {
                // Error that occurs when the fetch process is explicitly interrupted
                const out = {response_text: null, pos: 'end', status: StreamStatus.ABORTED,rawResponse:null,}
                await fnCallbackOnResponse(out);
            } else if (e.name === 'TypeError') {
                // - Error that occurs when disconnected from the server or when the network is disconnected during the process
                const out = {response_text: null, pos: 'end', status: StreamStatus.NETWORK_ERROR, err: e,rawResponse:null}
                console.error(`Network error occurred while fetching...`, e);
                await fnCallbackOnResponse(out);
            } else {

                // - When any other error occurs
                const out = {response_text: null, pos: 'end', status: StreamStatus.FETCH_ERROR, err: e,rawResponse:null}
                console.error(`Unknown error occurred while fetching...`, e);
                await fnCallbackOnResponse(out);
            }
        }
        return;
    }

    /**
     * Aborts the request
     */
    abort() { // Method to abort the Fetch operation
        this.abortController.abort();
    }

    /**
     * Parses a response containing an HTTP-level error
     * @param response
     * @returns {Promise<{json: null, rawData: null}|{json: *, rawData: *}|{json: null, rawData: *}>}
     */
    async parse_http_error(response) {

        let responseData = null;
        try {
            // First, parse as JSON
            responseData = await response.json();
            return {json: responseData, rawData: responseData};
        } catch (jsonError) {
            // Failed to parse as JSON.
            try {
                responseData = await response.text();
                return {json: null, rawData: responseData};
            } catch (textError) {
                // Failed to parse even as text
                console.error(`Error occurred while http error parsing...`, textError);
            }
        }
        return {json: null, rawData: responseData};
    }
}

