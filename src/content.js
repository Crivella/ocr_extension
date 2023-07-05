import axios from 'axios';
import md5 from 'md5';

var ENDPOINT = 'http://127.0.0.1:4000';
var OCR = false;
// axios.defaults.xsrfHeaderName = 'X-CSRFToken'
// axios.defaults.xsrfCookieName = 'csrftoken'
// axios.defaults.withCredentials = true

const randomId = "5124677111"

const wrapperClass = `ocr-wrapper-${randomId}`;
const wrappedClass = `ocr-wrapped-${randomId}`;

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
        var reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.readAsDataURL(blob);
            reader.onloadend = function() {
                const split = reader.result.split(',');
                const fmt = split[0].split('/')[1].split(';')[0];
                console.log(fmt)
                const base64data = split[1];
                // console.log(base64data);
                resolve([fmt, base64data]);
            }
        })

    }

    async function getOcr(md5Hash, base64data) {
        console.log('GET OCR');
        const res = await axios.post(`${ENDPOINT}/test/`, {
            md5: md5Hash,
            contents: base64data,
        }, {
            // headers: headers,
        })

        return res.data;
    }

    function drawBox({box, tsl, max_width, max_height}) {
        const [l,b,r,t] = box;
        const w = r-l;
        const h = t-b;

        console.log('BOX',l,b,r,t,w,h);

        const text = document.createElement('div');
        text.className = 'patch-text'
        text.innerHTML = `${tsl}`
        text.style.width = `${w/max_width*100}%`;
        text.style.height = `${h/max_height*100}%`;
        text.style.top = `${b/max_height*100}%`;
        text.style.left = `${l/max_width*100}%`;

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

    function makeCanvas(img) {
        console.log('Generating blob using canvas');
        // Make sure to use real dimension to draw image
        // Otherwise any resize will result in different blob and md5
        // ... causing the OCR to be called again
        const w = img.naturalWidth;
        const h = img.naturalHeight;

        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');
        c.width = w;
        c.height = h;
        // console.log(img.width, img.height);
        ctx.drawImage(img, 0, 0, w, h);

        return c
    }

    function cloneNode(node) {
        const res = node.cloneNode();
        if (node.tagName == 'IMG') {
            res.src = node.src;
        } else if (node.tagName == 'CANVAS') {
            res.width = node.width;
            res.height = node.height;
            const ctx = res.getContext('2d');
            ctx.drawImage(node, 0, 0, node.width, node.height);
        }

        return res;
    }

    function wrapImage(img, ocr) {
        // This is necessary since some sites can replace an already wrapped image
        // using JS (at somepoint this should be detected automatically)
        console.log('wrapping image');
        var nw;
        var nh;
        if (img.tagName == 'IMG') {
            nw = img.naturalWidth;
            nh = img.naturalHeight;
        } else if (img.tagName == 'CANVAS') {
            nw = img.width;
            nh = img.height;
        }

        var newImg;
        var wrapper;
        if (img.parentNode.classList.contains(wrapperClass)) {
            img.classList.remove(wrappedClass);
            newImg = img;
            wrapper = img.parentNode;
        } else {
            newImg = cloneNode(img);
            wrapper = document.createElement('div');
            wrapper.appendChild(newImg);
            img.replaceWith(wrapper);
        }
        console.log('copying class', newImg.classList);
        newImg.classList.forEach((cls) => {
            wrapper.classList.add(cls);
        })

        newImg.classList.add(wrappedClass);
        wrapper.classList.add(wrapperClass);
        
        // console.log(ocr);
        ocr.result.forEach(({ocr, tsl, box}) => {
            // console.log(ocr, tsl, box)
            const textdiv = drawBox({
                tsl, box, max_width: nw, max_height: nh
            });
            wrapper.appendChild(textdiv);
            // Copy original (OCRed) text to clipboard on click
            textdiv.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(ocr);
            })
        })
    }

    function blobFromCanvas(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            })
        })
    }

    async function processImage(img) {
        console.log('PROCESSING', img);
        
        // Get a blob from the image
        var blob;
        var base64data;
        if (img.tagName == 'IMG')
        {
            var blob = await fetchBlobFromUrl(img.src);
            var [fmt, data] = await blobToBase64(blob);
            // If image is not a supported type, convert to canvas and get png blob
            if ( ! ['jpeg', 'png', 'gif'].includes(fmt) ) {
                console.log('not supported format', fmt, 'falling back to canvas');
                const canvas = makeCanvas(img);
                blob = await blobFromCanvas(canvas);
                data = (await blobToBase64(blob))[1];
            }
            base64data = data;
        } else if (img.tagName == 'CANVAS') {
            blob = await blobFromCanvas(img);
            console.log('CANVAS: blob', blob);
            base64data = (await blobToBase64(blob))[1];
        } else {
            console.log('unknown tag', img.tagName);
            return;
        }

        const md5Hash = md5(base64data);

        // Change image CSS while loading OCR and if error
        var ocr;
        img.classList.add('ocr-loading');
        try {
            ocr = await getOcr(md5Hash, base64data);
        } catch (err) {
            console.log(err);
            img.classList.add('ocr-error');
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                img.classList.remove('ocr-error');
            })
            return;
        } finally {
            img.classList.remove('ocr-loading');
        }

        wrapImage(img, ocr);
    }

    function handleNodeInserted(e) {
        const tag = e.target.tagName;
        if (['IMG', 'CANVAS'].includes(tag)) {
            console.log('image inserted');
            processImage(e.target);
        }
    }

    function enableOCR() {
        if (OCR === true) {
            return;
        }
        OCR = true;
        console.log('enabling OCR');
        document.querySelectorAll('img').forEach((img) => {
            processImage(img);
        })
        document.querySelectorAll('canvas').forEach((canvas) => {
            processImage(canvas);
        })
        document.addEventListener('DOMNodeInserted', handleNodeInserted)
    }

    function disableOCR() {
        if (OCR === false) {
            return;
        }
        OCR = false;
        console.log('disabling OCR');
        document.removeEventListener('DOMNodeInserted', handleNodeInserted);
        document.querySelectorAll(`.${wrapperClass}`).forEach((wrapper) => {
            wrapper.querySelectorAll('.patch-text').forEach((text) => {
                text.remove();
            })
            wrapper.classList.remove(wrapperClass);
            wrapper.firstChild.classList.remove(wrappedClass);
            wrapper.firstChild.classList.remove('ocr-loading');
            wrapper.firstChild.classList.remove('ocr-error');
            wrapper.replaceWith(wrapper.firstChild);
        })
    }

    browser.runtime.onMessage.addListener(async (msg) => {
        if (msg.type === 'set-endpoint') {
            ENDPOINT = msg.endpoint;
        }
        if (msg.type === 'enable-ocr') {
            console.log('OCR enabled');
            enableOCR();
        }
        if (msg.type === 'disable-ocr') {
            console.log('OCR disabled');
            disableOCR();
        }
        // if (msg.type === 'translate-image') {
        //     processImage(msg.srcUrl);
        // }
    })

    /* TODO
    ~ Make tool work by intercepting requests (eg cant refetch image from server)
      (Workaround: use canvas to get base64 data)
    X Make textboxes resize with images
    - Make script sensitive to img changed with JS
    - Avoid spamming server with requests (or implement a server-side throttled queue)
    X Implement popup to communicate with server (e.g. model selection)
    - Implement browser action to toggle on/off
    */
})();