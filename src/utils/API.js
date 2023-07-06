import axios from "axios";

var ENDPOINT = 'http://127.0.0.1:4000';

// axios.defaults.xsrfHeaderName = 'X-CSRFToken'
// axios.defaults.xsrfCookieName = 'csrftoken'
// axios.defaults.withCredentials = true

export function setEndpoint(endpoint) {
    ENDPOINT = endpoint;
}

export async function getOcr(md5Hash, base64data) {
    console.log('GET OCR');
    const res = await axios.post(`${ENDPOINT}/test/`, {
        md5: md5Hash,
        contents: base64data,
    }, {
        // headers: headers,
    })

    return res.data;
}