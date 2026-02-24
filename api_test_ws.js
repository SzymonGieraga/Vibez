import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
    vus: 100,
    duration: '100s',
    insecureSkipTLSVerify: true,
};

const url = 'wss://192.168.18.53:8443/ws-raw';
const TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImEzOGVhNmEwNDA4YjBjYzVkYTE4OWRmYzg4ODgyZDBmMWI3ZmJmMGUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcHItaW4tZjAyMmIiLCJhdWQiOiJwci1pbi1mMDIyYiIsImF1dGhfdGltZSI6MTc2NzYyNDMxMSwidXNlcl9pZCI6IkNpajdHWTRiTGhNbWZLRTAwbzNjVDU2bzBpcTEiLCJzdWIiOiJDaWo3R1k0YkxoTW1mS0UwMG8zY1Q1Nm8waXExIiwiaWF0IjoxNzY3NjI0MzExLCJleHAiOjE3Njc2Mjc5MTEsImVtYWlsIjoiaGFzbG8udG9Ac3p5bW9uLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJoYXNsby50b0Bzenltb24uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.b4LS4nQnem9MoMV-WYY1CPnOxMugoq9hw_K4QhhidlV1SBeJz-LHxXANa-spNs1q1p1Z0j9xryOZ7gJtAZgz_xRxltSeYKQDD_I8BoSoV5mr8gB4FX7KNjcEZ2gn6MtYdvOHdCkjs47WP7-xcIDvSOHElTkesmE0psjv0F0neXKczssc1WJ8DPzGkIUELzBalxGJrDBJxDIjZiWyHCwfK3CGtGhdWalfQLxGS1M8GOjWiS13vd6C2eQZGVZ5weDiAUOWwO1mlz3PsIFJ6mRG-XHZ17bctJDTDtZBtZc1nnGh7NFmNpD9laiO38f_Yqz1SgEBUSup3f_bT6xXBQCHQg'
const CHAT_ID = '9497e252-18af-4869-9e9b-cbd71cec5947';

export default function () {
    const params = { tags: { my_tag: 'chat_test' } };

    const response = ws.connect(url, params, function (socket) {
        socket.on('open', function open() {
            const connectFrame = `CONNECT
            accept-version:1.1,1.0
            heart-beat:10000,10000
            Authorization:Bearer ${TOKEN}
            \0`;
            socket.send(connectFrame);
        });

        socket.on('message', function (message) {
            if (message.startsWith('CONNECTED')) {
                const subscribeFrame = `SUBSCRIBE
                id:sub-0
                destination:/user/queue/chat-messages

\0`;
                socket.send(subscribeFrame);

                const sendFrame = `SEND
                    destination:/app/chat/${CHAT_ID}/send
                    content-type:application/json
                    {"content":"Load test message","reelId":null}
                    \0`;

                socket.setInterval(function timeout() {
                    socket.send(sendFrame);
                }, 1000);
            }
        });

        socket.on('close', function () {
            console.log('Disconnected');
        });

        socket.on('error', function (e) {
            console.log('Error: ' + e.error());
        });

        socket.setTimeout(function () {
            socket.close();
        }, 10000);
    });

    check(response, { 'status is 101': (r) => r && r.status === 101 });
}