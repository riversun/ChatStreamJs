import express from 'express';
import cors from 'cors';
import http from 'http';

const port = 3000;
const app = express();


app.use(cors());

app.use(express.json());

app.get('/health_check', (req, res) => {
    res.json({status: "ok"});
});

app.get('/kill', (req, res) => {
    res.json({status: "ok", message: "I will shutdown.Good bye"});
    process.exit(0);
});
/**
 * 入力された値のエコーを返す Web API
 */
app.post('/chat_echo', (req, res) => {
    const {user_input, regenerate} = req.body;
    if (!user_input) {
        res.status(400).send({error: 'user_input is required'});
        return;
    }
    res.set('Content-Type', 'text/plain');
    res.send(JSON.stringify(req.body));
});

/**
 * 吾輩は猫である の冒頭をストリーミングで返す
 */
app.post('/chat_cat', (req, res) => {
    const {user_input, regenerate} = req.body;

    if (!user_input) {
        res.status(400).send({error: 'user_input is required'});
        return;
    }
    let text = '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。';
    let index = 0;
    const intervalId = setInterval(() => {
        res.write(text.substring(0, index + 1));
        if (index === text.length) {
            clearInterval(intervalId);
            res.end();
        }
        index++;
    }, 100);
});


/**
 * 途中まで出力した後、強制切断する
 */
app.post('/chat_disconnect', (req, res) => {
    const {user_input, regenerate} = req.body;

    if (!user_input) {
        res.status(400).send({error: 'user_input is required'});
        return;
    }
    let text = '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。';
    let index = 0;
    const intervalId = setInterval(() => {
        res.write(text.substring(0, index + 1));
        if (index === 20) {
            clearInterval(intervalId);
            // 強制的に切断する
            res.connection.destroy();
        }
        index++;
    }, 100);
});
/**
 * 吾輩は猫である の冒頭をストリーミングで返す(ショート版)
 */
app.post('/chat_cat_short', (req, res) => {
    const {user_input, regenerate} = req.body;

    if (!user_input) {
        res.status(400).send({error: 'user_input is required'});
        return;
    }
    let text = '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。';
    let index = 0;
    const intervalId = setInterval(() => {
        res.write(text.substring(0, index + 1));
        if (index === text.length) {
            clearInterval(intervalId);
            res.end();
        }
        index++;
    }, 100);
});

/**
 * アクセス過多をエミュレートする
 */
app.post('/chat_too_many_request', (req, res) => {
    const {user_input, regenerate} = req.body;
    res.status(429).json({ error: 'too_many_requests' });
});

/**
 * サーバーエラーをエミュレートする
 */
app.post('/chat_server_error', (req, res) => {
    const {user_input, regenerate} = req.body;
    res.status(500).json({"error": "internal_server_error", "detail": "queueing request"});
});

// Check if server is running
http.get(`http://localhost:${port}/health_check`, (res) => {
    if (res.statusCode === 200) {
        // If server is running, send kill signal
        http.get(`http://localhost:${port}/kill`, (res) => {
            if (res.statusCode === 200) {
                console.log(res.statusMessage);
                setTimeout(startServer, 2000); // Wait for the server to properly close
            }
        }).on('error', (err) => {
            console.error(`Error: ${err.message}`);
        });
    }
}).on('error', (err) => {
    // If server is not running, start server
    if (err.code === 'ECONNREFUSED') {
        startServer();
    }
});

function startServer() {
    const unitTestServer = app.listen(port, () => {
        console.log('単体テスト用サーバーが起動しました listening on port ' + unitTestServer.address().port);
    });
    unitTestServer.on('error', (err) => {
        console.error('単体テスト用サーバーでエラーが発生しました');
        console.error(err);
        process.exit(1); // Exit with an error status
    });
}
