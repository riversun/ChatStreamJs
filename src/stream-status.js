/**
 * Status of the streaming response of ChatStream received sequentially
 * @readonly
 * @enum {string}
 */
export const StreamStatus = Object.freeze({
    /**
     * Indicates that the streaming request is being processed normally.
     * This status is set when the request is successfully sent and an appropriate response is received from the server.
     */
    OK: 'ok',


    /**
     * Indicates that the request was explicitly interrupted by AbortController.
     * This status is set when communication is interrupted in the middle (when the abort method is called).
     */
    ABORTED: 'aborted',

    /**
     * Indicates that an error occurred on the server side.
     * This status is set when the server returns a 5xx (Server Error) HTTP status code.
     */
    SERVER_ERROR: 'server_error',

    /**
     * Indicates that the request failed due to a client-side error.
     * This status is set when the server returns a 4xx (Client Error) HTTP status code.
     */
    CLIENT_ERROR: 'client_error',

    /**
     * Primarily indicates that the streaming response was interrupted in the middle on the server side.
     */
    NETWORK_ERROR: 'network_error',

    /**
     * Indicates that a new request cannot be initiated because a request has already started.
     * This status is set when a streaming request is already in progress and a new request cannot be initiated.
     */
    REQUEST_ALREADY_STARTED: 'request_already_started',


    /**
     * Indicates that the request itself by Fetch API has failed.
     * Since a network disconnection causes a NETWORK_ERROR, it can be assumed to be due to other causes.
     * This status is set when the request could not be initiated or failed for some reason in the middle.
     */
    FETCH_ERROR: 'fetch_error',

});
