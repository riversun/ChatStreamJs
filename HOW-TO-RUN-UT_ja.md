# 単体テストの方法について

本ライブラリの単体テストはブラウザ上で実行される。

## 単体テストの実行方法 一括実行

以下のコマンドを実行する

```
npm test
```

これで、自動的に Karma Server が起動し、 Chromium 上でライブラリ挙動を確認できる状態となる、
また、同時に ChatStreamをエミュレーターした Node.js サーバーも起動し、

Karma によって　ヘッドレスの Chromium 上に読み込まれた ChatStreamJS から、Node.js の ChatStream エミュレーションサーバーへのアクセスが実行される。


## 単体テストを1件だけ実行

### まず単体テスト用サーバーを起動する

- Linux環境

```
npm run server_wake_up_linux
```


- Windows環境

```
npm run server_wake_up_win
```

### IDEから1件の単体テストを指定して実行する

Karma(Chromium) Server は不安定のため、
実行がうまくいかない場合は、 Karma Server を再起動する



## 新たにソースコードが増えたとき

**[karma.conf.cjs](karma.conf.cjs)** にテストコード、テストされるソースコードどちらも追加すること。

```
        files: [
            'src/stream-status.js',
            'src/chat-stream-client.js',
            'test/chat-stream-client.spec.js'
        ],
```
