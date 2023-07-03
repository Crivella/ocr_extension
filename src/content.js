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
            base64data = reader.result.split(',')[1];
            resolve(base64data);
        }
    })

}

function drawBox({box, img, ocr, tsl}) {
    const [l,b,r,t] = box;
    const rect = img.getBoundingClientRect();
    const {bottom, left} = rect;

    // const div = document.createElement('div');
    // div.style.position = 'absolute';
    // div.style.border = '2px solid red';
    // div.style.width = `${r-l}px`;
    // div.style.height = `${t-b}px`;
    // div.style.bottom = `${bottom-t}px`;
    // div.style.left = `${left+l}px`;
    // div.style.zIndex = 9
    // div.style.pointerEvents = 'none'

    const text = document.createElement('div');
    text.style.position = 'absolute';
    text.style.border = '2px solid red';
    text.style.width = `${r-l}px`;
    text.style.height = `${t-b}px`;
    text.style.bottom = `${bottom-t}px`;
    text.style.left = `${left+l}px`;
    text.style.zIndex = 9
    text.style.pointerEvents = 'none'
    text.style.backgroundColor = 'white'
    text.style.color = 'black'
    text.style.opacity = 0.8,
    text.style.fontSize = '12px'
    text.style.fontFamily = 'monospace'
    text.style.padding = '2px'
    text.style.textAlign = 'center'
    text.style.verticalAlign = 'middle'
    // text.style.lineHeight = `${t-b}px`
    text.innerHTML = `${ocr}<br>${tsl}`

    document.body.appendChild(text);
}

document.querySelectorAll('img').forEach((img) => {
    console.log(img.src)
    // axios.get(img.src).then((res) => {
    //     const data = res.data
    //     console.log(typeof data)
    //     console.log(data)
    //     const blob = new Blob([data], {type: 'image/jpeg'})
    //     console.log(typeof blob)
    //     console.log(blob)
    //     const md5Hash = md5(blob).toString()
    //     console.log(md5Hash)
    // })
    fetch(img.src).then((res) => {
        console.log('RES', res)
        // console.log('RES', res.arrayBuffer())
        // md5.di
        return res.blob()
    }).then(async (blob) => {
        // const wrapper = document.createElement('div');

        // wrapper.appendChild(img.cloneNode(true));

        var rect = img.getBoundingClientRect();
        var {top, left, right, bottom} = rect;

        console.log('RECT', rect)

        // console.log('BLOB', blob)
        var base64data = await getBase64Image(blob);
        // console.log(base64data)
        // const base64 = Base64.stringify(blob);
        const md5Hash = md5(base64data).toString();
        // const md5Hash = md5(blob);
        console.log(md5Hash)

        // console.log('POSTING')
        // console.log(`${ENDPOINT}/test/`)
        axios.post(`${ENDPOINT}/test/`, {
            url: img.src,
            md5: md5Hash,
            contents: base64data
        }, {
            headers: headers
        })
        .then((res) => {
            console.log(res)
            const result = res.data.result;
            // console.log(boxes)
            result.forEach(({ocr, tsl, box}) => {
                console.log(ocr, tsl, box)
                drawBox({img, ocr, tsl, box});
            })
            // console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
        // img.replaceWith(wrapper);
    })
    // img.addEventListener('click', (e) => {
    //     console.log('img clicked')
    //     console.log(e.target.src)
    //     // axios.post('http://localhost:8000/api/collected_images/', {
    //     //     url: e.target.src
    //     // })
    //     // .then(function (response) {
    //     //     console.log(response);
    //     // })
    //     // .catch(function (error) {
    //     //     console.log(error);
    //     // }); 
    // })
})