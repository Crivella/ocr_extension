import axios from 'axios';
import md5 from 'md5';

const ENDPOINT = 'http://127.0.0.1:4000'
// axios.defaults.xsrfHeaderName = 'X-CSRFToken'
// axios.defaults.xsrfCookieName = 'csrftoken'
// axios.defaults.withCredentials = true

(function() {
    if (window.hasRun5124677111) {
        return;
    }
    window.hasRun5124677111 = true;

    async function fetchBlobFromUrl(url) {
        const res = await fetch(url);
        const blob = await res.blob();
        
        return blob;
    }

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

    async function getOcr(md5Hash, base64data) {
        try {
            const res = await axios.post(`${ENDPOINT}/test/`, {
                md5: md5Hash,
                contents: base64data,
            }, {
                // headers: headers,
            })

            return res.data;
        }
        catch (err) {
            console.log(err)
        }
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

    browser.runtime.onMessage.addListener(async (msg) => {
        if (msg.type === 'translate-image') {
            const img = document.querySelector('img[src="'+msg.srcUrl+'"]');
            if (img.classList.contains('wrapped')) {
                return;
            }
            // console.log(img);
            
            const blob = await fetchBlobFromUrl(msg.srcUrl);
            const [fmt, base64data] = await getBase64Image(blob);
            if ( ! ['jpeg', 'png', 'gif'].includes(fmt) ) {
                return;
            }
            const md5Hash = md5(base64data);
            // console.log(md5Hash);
            // console.log(msg.srcUrl);
            
            const wrapper = document.createElement('div');
            if (img.classList.length > 0) {
                wrapper.classList.add(img.classList);
            }
            img.classList.add('wrapped');
            wrapper.classList.add('wrapper');
            wrapper.appendChild(img.cloneNode(true));
            img.replaceWith(wrapper);

            const ocr = await getOcr(md5Hash, base64data);
            // console.log(ocr);
            ocr.result.forEach(({ocr, tsl, box}) => {
                // console.log(ocr, tsl, box)
                const textdiv = drawBox({wrapper, ocr, tsl, box});
                textdiv.addEventListener('click', () => {
                    navigator.clipboard.writeText(ocr);
                })
            })
        }
    })

    /* TODO
    - Make textboxes resize with images
    - Make script sensitive to img changed with JS
    - Avoid spamming server with requests
    - Implement browser action to communicate with server (e.g. model selection)
    - Implement browser action to toggle on/off
    */
})();