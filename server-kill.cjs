const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/kill',
    method: 'GET'
};

const req = http.request(options, res => {
    console.log('単体テストサーバーをシャットダウンしました');
    process.exit(0);
});

req.on('error', error => {
    console.error('単体テストサーバーをシャットダウンに失敗しました:', error.message);
    process.exit(1);
});

req.end();
