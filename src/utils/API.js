/*
    This file contains all the API calls for the application.
*/
import axios from "axios";

var ENDPOINT;

// axios.defaults.xsrfHeaderName = 'X-CSRFToken'
// axios.defaults.xsrfCookieName = 'csrftoken'
// axios.defaults.withCredentials = true

/*
Set the endpoint in the global variable.
Used when the content script receive a message from the popup script.
*/
export function setEndpoint(endpoint) {
    ENDPOINT = endpoint;
}

/*
Perform a one-sided handshake with the server.
The server is supposed to reply with a list of languages/models available.
*/
export async function handshake({ endpoint, signal}) {
    console.log(`GET ${endpoint}/`);
    const res = await axios.get(`${endpoint}/`, {}, signal);

    return res.data;
}

/*
Generic function to send a POST request to the server.
Used by React components in in the popup script.
*/
export async function post(target, data) {
    console.log(`POST ${ENDPOINT}/${target}/`);
    const res = await axios.post(`${ENDPOINT}/${target}/`, data);

    return res;
}



/*
Attempt to get an already computed OCR_TLS result from the server.
Will only send the md5 hash of the image to limit network usage.
*/
async function getOcrLazy(md5Hash) {
    console.log('GET OCR - Lazy');
    const res = await axios.post(`${ENDPOINT}/run_ocrtsl/`, {
        md5: md5Hash,
    })

    return res.data;
}

/*
Request the OCR_TLS result from the server by sending the md5 and base64 of the content.
*/
async function getOcrWork(md5Hash, base64data) {
    console.log('GET OCR - Work');
    const res = await axios.post(`${ENDPOINT}/run_ocrtsl/`, {
        md5: md5Hash,
        contents: base64data,
    })

    return res.data;
}

/*
Wrapper that will first try to get the OCR_TLS result lazily.
If that fails, it will try to get the OCR_TLS result by sending the image.
*/
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

/*
Get all translations for a given textbox, stored in the server.
*/
export async function getOtherTranslations(text) {
    console.log('GET OTHER TRANSLATIONS');
    const res = await axios.get(`${ENDPOINT}/get_trans/`, {
        params: {text: text},
    })

    return res.data;
}

/*
Request the server to perform translation only on the given text.
*/
export async function textTranslation(text) {
    console.log('GET TRANSLATION');
    const res = await axios.post(`${ENDPOINT}/run_tsl/`, {
        text: text,
        })

    return res.data;
}