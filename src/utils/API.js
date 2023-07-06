import axios from "axios";

var ENDPOINT;

// axios.defaults.xsrfHeaderName = 'X-CSRFToken'
// axios.defaults.xsrfCookieName = 'csrftoken'
// axios.defaults.withCredentials = true

export function setEndpoint(endpoint) {
    ENDPOINT = endpoint;
}

async function getOcrLazy(md5Hash) {
    console.log('GET OCR - Lazy');
    const res = await axios.post(`${ENDPOINT}/test/`, {
        md5: md5Hash,
    })

    return res.data;
}

async function getOcrWork(md5Hash, base64data) {
    console.log('GET OCR - Work');
    const res = await axios.post(`${ENDPOINT}/test/`, {
        md5: md5Hash,
        contents: base64data,
    })

    return res.data;
}

export async function getOcr(md5Hash, base64data) {
    console.log('GET OCR');
    var res;
    try {
        res =  await getOcrLazy(md5Hash);
    } catch (err) {
        // console.log(err);
        res = await getOcrWork(md5Hash, base64data);
    }
    return res;
}