import axios from 'axios';
import md5 from 'md5';

var ENDPOINT = 'http://127.0.0.1:4000';
// axios.defaults.xsrfHeaderName = 'X-CSRFToken'
// axios.defaults.xsrfCookieName = 'csrftoken'
// axios.defaults.withCredentials = true

(function() {
    if (window.hasRun5124677111) {
        return;
    }
    window.hasRun5124677111 = true;

    const textboxes = [];

    async function fetchBlobFromUrl(url) {
        console.log('FETCHING', url);

        const res = await fetch(url);
        const blob = await res.blob();
        console.log(blob);

        return blob;
    }

    function blobToBase64(blob) {
        var base64data;
        var reader = new FileReader();

        return new Promise((resolve, reject) => {

            reader.readAsDataURL(blob);
            reader.onloadend = function() {
                const split = reader.result.split(',');
                const fmt = split[0].split('/')[1].split(';')[0];
                console.log(fmt)
                base64data = reader.result.split(',')[1];
                resolve([fmt, base64data]);
            }
        })

    }

    async function getOcr(md5Hash, base64data) {
        const res = await axios.post(`${ENDPOINT}/test/`, {
            md5: md5Hash,
            contents: base64data,
        }, {
            // headers: headers,
        })

        return res.data;
    }

    function drawBox({box, img, tsl}) {
        const [l,b,r,t] = box;
        const w = r-l;
        const h = t-b;
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        const text = document.createElement('div');
        text.className = 'patch-text'
        text.innerHTML = `${tsl}`
        text.style.width = `${w/naturalWidth*100}%`;
        text.style.height = `${h/naturalHeight*100}%`;
        text.style.top = `${b/naturalHeight*100}%`;
        text.style.left = `${l/naturalWidth*100}%`;

        const size = Math.sqrt(w*h/tsl.length*0.3)/7;

        text.style.fontSize = `${size}vw`;
        text.style.lineHeight = `${size}vw`;

        textboxes.push(text);

        return text;
    }

    function onImageReload() {
        console.log('image reloaded');
        textboxes.forEach((textbox) => {
            textbox.remove();
        })
        textboxes.length = 0;
    }

    browser.runtime.onMessage.addListener(async (msg) => {
        if (msg.type === 'set-endpoint') {
            ENDPOINT = msg.endpoint;
        }
        if (msg.type === 'translate-image') {
            const img = document.querySelector('img[src="'+msg.srcUrl+'"]');
            if (img.classList.contains('wrapped')) {
                return;
            }
            // console.log(img.width, img.height);
            
            var blob = await fetchBlobFromUrl(msg.srcUrl);
            var [fmt, base64data] = await blobToBase64(blob);
            if ( ! ['jpeg', 'png', 'gif'].includes(fmt) ) {
                console.log('not supported format', fmt, 'falling back to canvas');
                const c = document.createElement('canvas');
                const ctx = c.getContext('2d');
                c.width = img.width;
                c.height = img.height;
                // console.log(img.width, img.height);
                ctx.drawImage(img, 0, 0, img.width, img.height);
                blob = await new Promise((resolve, reject) => {
                    c.toBlob((blob) => {
                        resolve(blob);
                    })
                })
                const res = await blobToBase64(blob);
                base64data = res[1];
                // return;
            }
            const md5Hash = md5(base64data);
            console.log(md5Hash);
            console.log(msg.srcUrl);
            var ocr;

            const newImg = img.cloneNode(true);
            newImg.addEventListener('load', onImageReload);
            newImg.classList.add('ocr-loading');
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    console.log(mutation);
                    if (mutation.attributeName === 'src') {
                        console.log('src changed');
                        onImageReload();
                    }
                })
            })
            observer.observe(newImg, {attributes: true});
            try {
                ocr = await getOcr(md5Hash, base64data);
            } catch (err) {
                console.log(err);
                newImg.classList.add('ocr-error');
                newImg.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    newImg.classList.remove('ocr-error');
                })
                return;
            } finally {
                newImg.classList.remove('ocr-loading');

            }
  
            const wrapper = document.createElement('div');
            if (newImg.classList.length > 0) {
                wrapper.classList.add(newImg.classList);
            }
            newImg.classList.add('wrapped');
            wrapper.classList.add('wrapper');
            wrapper.appendChild(newImg);
            
            // console.log(ocr);
            ocr.result.forEach(({ocr, tsl, box}) => {
                // console.log(ocr, tsl, box)
                const textdiv = drawBox({img, tsl, box});
                wrapper.appendChild(textdiv);
                textdiv.addEventListener('click', () => {
                    navigator.clipboard.writeText(ocr);
                })
            })
            img.replaceWith(wrapper);
        }
    })

    /* TODO
    - Make tool work by intercepting requests (eg cant refetch image from server)
    - Make textboxes resize with images
    - Make script sensitive to img changed with JS
    - Avoid spamming server with requests
    - Implement browser action to communicate with server (e.g. model selection)
    - Implement browser action to toggle on/off
    */
})();