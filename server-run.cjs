// server-check.js
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health_check',
    method: 'GET'
};

const interval = 1000;  // Polling interval in milliseconds
const maxAttempts = 30;  // Maximum number of polling attempts

let attempt = 0;

const intervalId = setInterval(() => {
    attempt++;

    const req = http.request(options, res => {
        if (res.statusCode === 200) {
            console.log(`単体テストサーバーは起動済です!`);
            clearInterval(intervalId);
        }
    });

    req.on('error', error => {
        if (attempt === maxAttempts) {
            console.error(`Server is not up after ${maxAttempts} attempts. Exiting...`);
            clearInterval(intervalId);
            process.exit(1);
        }
    });

    req.end();

}, interval);
