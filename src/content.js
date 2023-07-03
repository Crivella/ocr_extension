// THIS IS A TEST

import axios from "axios";
// import Base64 from 'crypto-js/enc-base64';
import md5 from 'crypto-js/md5';
// import md5 from 'md5';

// axios.defaults.xsrfHeaderName = 'X-CSRFToken'
// axios.defaults.xsrfCookieName = 'csrftoken'
// axios.defaults.withCredentials = true

const ENDPOINT = 'http://127.0.0.1:4000'

var cookie = "???"
// console.log('background.js loaded');
// console.log('process.env.NODE_ENV', process.env.NODE_ENV);
// console.log(axios)

// browser.contextMenus.create({
//     id: "collect-image",
//     title: "Add to the collected images",
//     contexts: ["image"],
//   });

const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0',
    'Cookie': `csrftoken=${cookie}`,
    'X-CSRFToken': `${cookie}`,
}
  
// const handshake = () => {
//     console.log('handshake')
//     axios.get(`${ENDPOINT}/test/`, {
//         headers: {
//             'Accept': '*/*',
//             'Host': '127.0.0.1:4000',
//             'Content-Type': 'application/json',
//         }
//     }).then((res) => {
//         console.log(res.headers)
//         // cookie = res.headers['set-cookie'][0]
//         // console.log(cookie)
//         // axios.defaults.headers.common['Cookie'] = cookie
//         // console.log(axios.defaults.headers.common['Cookie'])
//     })
//     .catch((err) => {
//         console.log(err)
//     })
// }

// handshake();

function getBase64Image(blob) {
    var base64data;
    var reader = new FileReader();

    return new Promise((resolve, reject) => {

        reader.readAsDataURL(blob);
        reader.onloadend = function() {
            const split = reader.result.split(',');
            var base = split[0];
            base = base.split('/')[1].split(';')[0];
            console.log(reader.result.split(',')[0])
            base64data = reader.result.split(',')[1];
            resolve([base, base64data]);
        }
    })

}

function drawBox({box, wrapper, ocr, tsl}) {
    const [l,b,r,t] = box;

    const text = document.createElement('div');
    text.className = 'patch-text'
    text.innerHTML = `${tsl}`
    text.style.width = `${r-l}px`;
    text.style.height = `${t-b}px`;
    text.style.top = `${b}px`;
    text.style.left = `${l}px`;

    wrapper.appendChild(text);

    return text;
}

/* TODO
- Make textboxes resize with images
- Make script sensitive to img changed with JS
- Avoid spamming server with requests
- Implement browser action to communicate with server (e.g. model selection)
- Implement browser action to toggle on/off
*/
document.querySelectorAll('img').forEach((img) => {
    fetch(img.src).then((res) => res.blob())
    .then(async (blob) => {
        const wrapper = document.createElement('div');
        wrapper.appendChild(img.cloneNode(true));

        wrapper.className = 'wrapper'
        // wrapper.style.width = img.width + 'px';
        // wrapper.style.height = img.height + 'px';

        img.replaceWith(wrapper);

        const [fmt, base64data] = await getBase64Image(blob);
        if ( ! ['jpeg', 'png', 'gif'].includes(fmt) ) {
            return;
        }
        const md5Hash = md5(base64data).toString();
        // console.log(md5Hash)

        axios.post(`${ENDPOINT}/test/`, {
            url: img.src,
            md5: md5Hash,
            contents: base64data
        }, {
            headers: headers
        })
        .then((res) => {
            const result = res.data.result;
            result.forEach(({ocr, tsl, box}) => {
                console.log(ocr, tsl, box)
                const textdiv = drawBox({wrapper, ocr, tsl, box});
                textdiv.addEventListener('click', () => {
                    navigator.clipboard.writeText(ocr);
                })
            })
        })
        .catch(function (error) {
            console.log(error);
        });
    })
})