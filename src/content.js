import md5 from 'md5';

import { getOcr, setEndpoint } from './utils/API';
import { base64FromAny } from './utils/blob';
import { getSizes } from './utils/image';
import { drawBox } from './utils/textbox';
import { unwrapImage, wrapImage } from './utils/wrapper';

var OCR = false;

(function() {
    if (window.hasRun5124677111) {
        return;
    }
    window.hasRun5124677111 = true;

    const images = [];

    function applyOcr(img, wrapper, ocr) {
        console.log('applying ocr');

        const ptr = {
            img: img,
            wrapper: wrapper,
            boxes: []
        };
        images.push(ptr);

        ocr.result.forEach(({ocr, tsl, box}) => {
            // console.log(ocr, tsl, box)
            const [nw, nh] = getSizes(img);
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
            ptr.boxes.push(textdiv);
        })
    }

    async function processImage(img) {
        console.log('PROCESSING', img);
        // This is the entire image size (should be atleas 10k pixels)
        if ( img.width*img.height < 100*100 ) {
            console.log('image too small', img.width, img.height);
            return;
        }
        
        // Get a blob from the image
        const base64data = await base64FromAny(img);

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

        const [newImg, wrapper] = wrapImage(img);

        applyOcr(newImg, wrapper, ocr);
    }

    function onImageReload() {
        console.log('image reloaded');
        textboxes.forEach((textbox) => {
            textbox.remove();
        })
        textboxes.length = 0;
    }
    
    function handleNodeInserted(e) {
        const tag = e.target.tagName;
        if (['IMG', 'CANVAS'].includes(tag)) {
            console.log('image inserted');
            // This should actually check for images that are still there
            // or maybe use a listenere for node removed?
            // onImageReload();
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

        console.log(images);
        var i = images.length;
        while (i--) {
            const ptr = images[i];
            console.log('DO', ptr);
            ptr.boxes.forEach((textbox) => {
                textbox.remove();
            })
            unwrapImage(ptr.img);
            images.splice(i, 1);
        }
    }

    browser.runtime.onMessage.addListener(async (msg) => {
        if (msg.type === 'set-endpoint') {
            console.log('setting endpoint', msg.endpoint);
            setEndpoint(msg.endpoint);
        }
        if (msg.type === 'enable-ocr') {
            console.log('OCR enabled');
            enableOCR();
        }
        if (msg.type === 'disable-ocr') {
            console.log('OCR disabled');
            disableOCR();
        }
    })
})();