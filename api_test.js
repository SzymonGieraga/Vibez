import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    insecureSkipTLSVerify: true,
    stages: [
        { duration: '100s', target: 100 },
    ],
};

const BASE_URL = 'https://192.168.18.53:8443';
const TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImEzOGVhNmEwNDA4YjBjYzVkYTE4OWRmYzg4ODgyZDBmMWI3ZmJmMGUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcHItaW4tZjAyMmIiLCJhdWQiOiJwci1pbi1mMDIyYiIsImF1dGhfdGltZSI6MTc2NzYyNDMxMSwidXNlcl9pZCI6IkNpajdHWTRiTGhNbWZLRTAwbzNjVDU2bzBpcTEiLCJzdWIiOiJDaWo3R1k0YkxoTW1mS0UwMG8zY1Q1Nm8waXExIiwiaWF0IjoxNzY3NjI0MzExLCJleHAiOjE3Njc2Mjc5MTEsImVtYWlsIjoiaGFzbG8udG9Ac3p5bW9uLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJoYXNsby50b0Bzenltb24uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.b4LS4nQnem9MoMV-WYY1CPnOxMugoq9hw_K4QhhidlV1SBeJz-LHxXANa-spNs1q1p1Z0j9xryOZ7gJtAZgz_xRxltSeYKQDD_I8BoSoV5mr8gB4FX7KNjcEZ2gn6MtYdvOHdCkjs47WP7-xcIDvSOHElTkesmE0psjv0F0neXKczssc1WJ8DPzGkIUELzBalxGJrDBJxDIjZiWyHCwfK3CGtGhdWalfQLxGS1M8GOjWiS13vd6C2eQZGVZ5weDiAUOWwO1mlz3PsIFJ6mRG-XHZ17bctJDTDtZBtZc1nnGh7NFmNpD9laiO38f_Yqz1SgEBUSup3f_bT6xXBQCHQg';
export default function () {
    const params = {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
        },
    };

    const res = http.get(`${BASE_URL}/api/reels/feed`, params);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(1);
}