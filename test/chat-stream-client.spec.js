import ChatStreamClient from '../src/chat-stream-client.js'
import {StreamStatus} from '../src/stream-status.js';

const port = 3000;
describe("ChatStreamClient", () => {


    beforeEach(() => {
        // タイムアウトを１分に設定
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000; // set default timeout to 10 seconds for this suite


    });

    afterEach(() => {
    });

    describe("send", () => {

        it("user_input,regenerate など必要な値が送信されていること", (done) => {
            const TEST_DEF = `user_input,regenerate など必要な値が送信されていること`;
            //spyOn(client, 'send').and.callThrough();
            //client.requestStarted = true;
            const client = new ChatStreamClient({
                endpoint: `http://localhost:${port}/chat_echo`
            });

            let counter = 0;
            let prev_response_text = ``;
            // jasmine の場合 await と done は共存できないので、awaitしない
            client.send({
                user_input: 'こんにちは',
                onResponse: (data) => {
                    const {response_text, pos, status, statusCode, err} = data;

                    console.log(`【UT実行中】${TEST_DEF} 【${counter}回目のonResponse】 response_text:${response_text} pos:${pos} status:${status} statusCode:${statusCode} err:${JSON.stringify(err)} `);


                    if (pos == "end") {
                        let final_text = response_text;
                        if (!final_text) {
                            // pos=="end" のとき response_text は falsy になるため、判定用テキストとして、１ターン前の response_text を使用している
                            final_text = prev_response_text;
                        }
                        expect(status).toBe('ok');
                        expect(final_text).toBe(`{"user_input":"こんにちは","regenerate":false}`);

                        done();
                    }
                    counter++;
                    prev_response_text = response_text;
                }
            });

        });

        it("文章をストリーム受信できること", (done) => {
            // ストリーミング受信できていることを確認するため onResponse 呼び出し回数をカウント
            const TEST_DEF = '文章をストリーム受信できること';
            const client = new ChatStreamClient({
                endpoint: `http://localhost:${port}/chat_cat_short`
            });
            let counter = 0;
            let prev_response_text = ``;
            client.send(// jasmine の場合 await と done は共存できないので、awaitしない
                {
                    user_input: 'こんにちは', onResponse: (data) => {

                        const {response_text, pos, status, statusCode, err} = data;
                        console.log(`【UT実行中】${TEST_DEF} 【${counter}回目のonResponse】 response_text:${response_text} pos:${pos} status:${status} statusCode:${statusCode} err:${JSON.stringify(err)} `);

                        if (response_text) {
                            // 中身をともなう response_text が返ってきているときカウントアップ
                            counter++;
                        }

                        if (pos == "end") {
                            let final_text = response_text;
                            if (!final_text) {
                                // pos=="end" のとき response_text は falsy になるため、判定用テキストとして、１ターン前の response_text を使用している
                                final_text = prev_response_text;
                            }
                            expect(counter > 30).toBe(true);
                            expect(status).toBe(StreamStatus.OK);
                            expect(final_text).toBe(`吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。`);
                            done();
                        }

                        prev_response_text = response_text;
                    }
                });

        });

        // 一時スキップしたい場合は xit
        it("終了ステータスの検証 StreamStatus.ABORTED:ストリーム受信中にabortできること", (done) => {

            const TEST_DEF = 'ストリーム受信中にabortできること';

            const client = new ChatStreamClient({
                endpoint: `http://localhost:${port}/chat_cat`
            });

            let counter = 0;

            let prev_response_text = ``;

            client.send(// jasmine の場合 await と done は共存できないので、awaitしない
                {
                    user_input: 'こんにちは', onResponse: (data) => {
                        counter++;
                        let {response_text, pos, status, statusCode, err} = data;


                        if (counter > 30) {
                            client.abort();
                        }

                        console.log(`【UT実行中】${TEST_DEF} 【${counter}回目のonResponse】 response_text:${response_text} pos:${pos} status:${status} statusCode:${statusCode} err:${JSON.stringify(err)} `);

                        if (pos == "end") {
                            if (!response_text) {
                                // pos=="end" のとき response_text は falsy になるため、判定用テキストとして、１ターン前の response_text を使用している
                                response_text = prev_response_text;
                            }
                            expect(status).toBe(StreamStatus.ABORTED);
                            expect(response_text.startsWith(`吾輩は猫である。名前はまだ無い`)).toBe(true);
                            expect(response_text.startsWith(`吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た`)).toBe(false);

                            done();
                        }
                        prev_response_text = response_text;
                    }
                });

        });

        it("終了ステータスの検証 StreamStatus.REQUEST_ALREADY_STARTED:リクエスト開始後に再度リクエストできない", (done) => {

            const TEST_DEF = '終了ステータスの検証 StreamStatus.REQUEST_ALREADY_STARTED:リクエスト開始後に再度リクエストできない';

            const client = new ChatStreamClient({
                endpoint: `http://localhost:${port}/chat_cat`
            });
            // spyOn(client, 'send').and.callThrough();
            // client.requestStarted = true;

            let counter = 0;

            let prev_response_text = ``;


            client.send(// jasmine の場合 await と done は共存できないので、awaitしない
                {
                    user_input: 'こんにちは', onResponse: (data) => {
                        counter++;
                        let {response_text, pos, status, statusCode, err} = data;


                        console.log(`【UT実行中】${TEST_DEF} 【${counter}回目のonResponse】 response_text:${response_text} pos:${pos} status:${status} statusCode:${statusCode} err:${JSON.stringify(err)} `);

                        if (pos == "end") {
                            if (!response_text) {
                                // pos=="end" のとき response_text は falsy になるため、判定用テキストとして、１ターン前の response_text を使用している
                                response_text = prev_response_text;
                            }


                        }
                        prev_response_text = response_text;
                    }
                });


            // 時間をおいて、2回目のリクエストを行う
            setTimeout(() => {
                expect(client.requestStarted).toBe(true);
                client.send(// jasmine の場合 await と done は共存できないので、awaitしない
                    {
                        user_input: 'こんにちは,その2',
                        onResponse: (data) => {
                            counter++;
                            let {response_text, pos, status, statusCode, err} = data;

                            console.log(`【UT実行中-2】${TEST_DEF} 【${counter}回目のonResponse】 response_text:${response_text} pos:${pos} status:${status} statusCode:${statusCode} err:${JSON.stringify(err)} `);
                            expect(status).toBe(StreamStatus.REQUEST_ALREADY_STARTED);
                            expect(pos).toBe('end');


                            done();

                            prev_response_text = response_text;
                        }
                    });
            }, 300);


        });
        it("終了ステータスの検証 StreamStatus.REQUEST_ALREADY_STARTED:リクエスト終了には再度再度リクエストできる", (done) => {

            const TEST_DEF = '終了ステータスの検証 StreamStatus.REQUEST_ALREADY_STARTED:リクエスト終了には再度再度リクエストできる';

            const client = new ChatStreamClient({
                endpoint: `http://localhost:${port}/chat_cat_short`
            });

            let counter = 0;

            let prev_response_text = ``;


            client.send(// jasmine の場合 await と done は共存できないので、awaitしない
                {
                    user_input: 'こんにちは', onResponse: (data) => {
                        counter++;
                        let {response_text, pos, status, statusCode, err} = data;


                        console.log(`【UT実行中】${TEST_DEF} 【${counter}回目のonResponse】 response_text:${response_text} pos:${pos} status:${status} statusCode:${statusCode} err:${JSON.stringify(err)} `);

                        if (pos == "end") {
                            if (!response_text) {
                                // pos=="end" のとき response_text は falsy になるため、判定用テキストとして、１ターン前の response_text を使用している
                                response_text = prev_response_text;
                            }

                            {
                                //リクエスト終了時　pos == "end" での onResponse 時点で requestStarted=false となっていること
                                expect(client.requestStarted).toBe(false);

                                client.send(// jasmine の場合 await と done は共存できないので、awaitしない
                                    {
                                        user_input: 'こんにちは,その2',
                                        onResponse: (data) => {
                                            counter++;
                                            let {response_text, pos, status, statusCode, err} = data;

                                            console.log(`【UT実行中】${TEST_DEF} 【${counter}回目のonResponse】 response_text:${response_text} pos:${pos} status:${status} statusCode:${statusCode} err:${JSON.stringify(err)} `);

                                            if (pos == "end") {
                                                expect(status).toBe(StreamStatus.OK);
                                                done();

                                            }
                                            prev_response_text = response_text;
                                        }
                                    });
                            }


                        }
                        prev_response_text = response_text;
                    }
                });


        });

        it("終了ステータスの検証 StreamStatus.NETWORK_ERROR: サーバーから切断された場合", (done) => {
            // ストリーミング受信できていることを確認するため onResponse 呼び出し回数をカウント
            const TEST_DEF = '終了ステータスの検証 StreamStatus.NETWORK_ERROR: サーバーから切断された場合';
            const client = new ChatStreamClient({
                endpoint: `http://localhost:${port}/chat_disconnect`
            });
            let counter = 0;
            let prev_response_text = ``;
            client.send(// jasmine の場合 await と done は共存できないので、awaitしない
                {
                    user_input: 'こんにちは', onResponse: (data) => {

                        const {response_text, pos, status, statusCode, err} = data;
                        console.log(`【UT実行中】${TEST_DEF} 【${counter}回目のonResponse】 response_text:${response_text} pos:${pos} status:${status} statusCode:${statusCode} err:${JSON.stringify(err)} `);

                        if (response_text) {
                            // 中身をともなう response_text が返ってきているときカウントアップ
                            counter++;
                        }

                        if (pos == "end") {

                            expect(counter > 10).toBe(true);// 途中まで受信
                            expect(status).toBe(StreamStatus.NETWORK_ERROR);

                            done();
                        }

                        prev_response_text = response_text;
                    }
                });

        });

        it("終了ステータスの検証 StreamStatus.CLIENT_ERROR: クライアントサイドエラーの場合", (done) => {

            const TEST_DEF = '終了ステータスの検証 StreamStatus.CLIENT_ERROR: クライアントサイドエラーの場合';
            const client = new ChatStreamClient({
                endpoint: `http://localhost:${port}/chat_too_many_request`
            });
            let counter = 0;
            let prev_response_text = ``;
            client.send(// jasmine の場合 await と done は共存できないので、awaitしない
                {
                    user_input: 'こんにちは', onResponse: (data) => {

                        const {response_text, pos, status, statusCode, err} = data;
                        console.log(`【UT実行中】${TEST_DEF} 【${counter}回目のonResponse】 response_text:${response_text} pos:${pos} status:${status} statusCode:${statusCode} err:${JSON.stringify(err)} `);

                        if (pos == "end") {
                            expect(err.json).toBeTruthy();
                            expect(err.json.error).toBe("too_many_requests");

                            done();
                        }

                        prev_response_text = response_text;
                    }
                });

        });


    });


});
