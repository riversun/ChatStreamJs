# ChatStreamJs

[English](https://github.com/riversun/ChatStreamJs/blob/main/README.md) | [&#26085;&#26412;&#35486;](https://github.com/riversun/ChatStreamJs/blob/main/README_ja.md)

ChatStreamJs は [ChatStream](https://pypi.org/project/chatstream/) で構築された LLM Webサーバーに対応した Web フロントエンドクライアントです。

事前学習済大規模言語モデルにより逐次生成され、WebStreaming として送られてくるストリーミングチャットをハンドリングすることができます。

[![npm version](https://badge.fury.io/js/chatstreamjs.svg)](https://badge.fury.io/js/chatstreamjs)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)


## インストール

```
npm install chatstreamjs
```

## 使い方

### ストリーミング文章生成を開始する

```js
import {ChatStreamClient, StreamStatus} from 'chatstreamjs';

// ChatStreamクライアントを生成
const client = new ChatStreamClient({
    endpoint: `http://localhost:3000/chat_stream`, // ChatStreamサーバーのエンドポイント
});

// ChatStream サーバーにリクエスト（ユーザーの入力プロンプト）を送信
client.send(
    {
        user_input: 'こんにちは',// 入力テキスト
        onResponse: (data) => { // ChatStreamサーバーからのレスポンス（トークン生成毎に繰り返し呼び出される)

            const {
                // [response_text]サーバーからレスポンスされたテキスト
                response_text,
                // [pos]
                // レスポンスの位置。
                // "begin":この文章生成における最初のトークン生成
                // "mid":この文章生成における途中のトークン生成
                // "end":この文章生成の終了（終了のみの通知であるため response_text は null となる)
                pos,
                // [status]
                // 文章生成時のステータス
                // StreamStatus.OK: ストリーミングリクエストが正常に処理された
                // StreamStatus.ABORTED: (自らabortメソッドを呼び出して)通信が中断された
                // StreamStatus.SERVER_ERROR: サーバーから5xx（サーバーエラー）のHTTPステータスコードが返された
                // StreamStatus.CLIENT_ERROR: サーバーから4xx（クライアントエラー）のHTTPステータスコードが返された
                // StreamStatus.NETWORK_ERROR: 通信中にネットワークが切断された
                // StreamStatus.FETCH_ERROR: そのほかの予期せぬ通信エラー
                // StreamStatus.REQUEST_ALREADY_STARTED: ストリーミングリクエスト中に、再度 sendメソッドが呼び出された
                status,
                // 文章生成時のエラー詳細
                // err.json.error: ChatStream サーバーのエラーメッセージ
                // err.json.detail: ChatStream サーバーのエラーメッセージ詳細
                err,
                // [statusCode]
                // HTTPステータスコード
                // statusCode==429 ... ChatStreamサーバーにアクセスが集中してリクエスト捌けなかった。StreamStatus.CLIENT_ERRORと同時にセットされる
                // statusCode==500 ... ChatStreamサーバー内でエラーが発生した。StreamStatus.SERVER_ERRORと同時にセットされる
                statusCode,

            } = data;

            if (response_text) {
                console.log(`ASSISTANT: ${response_text}`);
            }

            if (pos == "end") {
                // 今ターンのリクエストによる文章生成が終了した
                // ただし、正常終了とは限らないので、 status をハンドリングする
            }
        }
    });
```

send の戻り値は Promise ですが、呼出し時に await は使用しません。なぜなら、レスポンスは onResponse でコールバックされる方式のため、await する意味がないのと、
await してしまうと、たとえば abort を呼び出したいとき不都合が生じます。

### 文章生成中に生成を中断する

`abort` メソッドにより、明示的に現在の通信を切断しストリーミング文章生成を停止することができます。

```js
client.abort();
```

本メソッドは通信の切断により文章生成を強制的に止めているように見えますが、ChatStreamサーバー側でクライアントによる切断を適切にハンドリングしますのできわめてまっとうな操作です。

### 文章を再生成する 

`send` メソッドのパラメータに `regenerate:true` を追加することで、AI アシスタント側のチャットを再生成することができます。

```js
client.send(
    {
        user_input: null,
        regenerate: true,// 再生成を促す
        onResponse: (data) => {
        }
    });
```

`abort` で通信を切断し、 `regenerate:true` で再生成という流れになることもあります。

# fetch オプションの指定

ChatStream サーバーとの通信には内部で `fetch` が使われているため **fetchOpts** に `fetch` オプションをそのまま指定可能。

## コンストラクタで指定

```js
// ChatStreamクライアントを生成
const client = new ChatStreamClient({
        endpoint: `http://localhost:3000/chat_stream`, // ChatStreamサーバーのエンドポイント
        fetchOpts: { // fetch に渡すオプションをそのまま指定できる
            credentials: 'include',// 'include' 開発時にセッションクッキー等を保持させたい場合
            method: 'POST',// HTTP メソッドの指定
            headers: {
                // HTTP ヘッダの指定
                'Content-Type': 'application/json',
                'X-Original-Header': 'original value',
            }
        },
    }
);
```

## send メソッドで指定

リクエストごとにヘッダを変更したい、など send メソッド毎に設定することも可能です

このとき、ヘッダはコンストラクタで指定したものにさらに追記されます。

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
