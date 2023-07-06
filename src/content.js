import md5 from 'md5';

import { getOcr, setEndpoint } from './utils/API';
import { base64FromAny } from './utils/blob';
import { getSizes } from './utils/image';
import { drawBox } from './utils/textbox';
import { unwrapImage, wrapImage } from './utils/wrapper';

var OCR = false;

/*
This is the main content script that is injected into the page
Function used to avoid multiple injection (cleaner than using an if?)
*/
(function() {
    // Check if the content script is already injected
    if (window.hasRun5124677111) {
        return;
    }
    window.hasRun5124677111 = true;

    const images = [];

    /*
    Apply the OCR result to the image
     - Wrap the image in a div
     - Draw the text boxes on top of the image
     - Add event handlers
        - Copy text to clipboard on click
    */
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

    /*
    Pipeline for processing an image:
     - Get a blob from the image
     - Get the blob in base64 format
     - Get the md5 hash of the base64 data
     - Get the OCR result from the API
     - Apply the OCR result to the image
     - Add event handlers
        - 'load': remove existing result and re-process image on reload
    */
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
        newImg.addEventListener('load', onImageReload);
    }

    /*
    Used to handle 'load' event on images that are already loaded.
    EG: some sites can replace an image with a new one using JS, by modifing the src attribute.
    */
    function onImageReload(e) {
        const img = e.target;
        console.log('image reloaded');
        const topop = [];
        images.forEach((ptr, idx) => {
            if (ptr.img === img) {
                topop.push(idx);
                ptr.boxes.forEach((box) => {
                    box.remove();
                })
            }
        })

        topop.sort((a, b) => b - a);
        topop.forEach((ptr) => {
            const i = images.indexOf(ptr);
            images.splice(i, 1);
        })

        processImage(img);
    }
    
    /*
    Used to handle 'DOMNodeInserted' event on the document.
    EG: some sites can add images to the page using JS.
    */
    function handleNodeInserted(e) {
        const tag = e.target.tagName;
        if (['IMG', 'CANVAS'].includes(tag)) {
            console.log('image inserted');
            processImage(e.target);
        }
    }

    /*
    Enable the addon on the current tab.
     - process all img/canvas already on the page
     - add event listeners
        - 'DOMNodeInserted': process new images added to the page
    */
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

    /*
    Disable the addon on the current tab.
     - remove all event listeners
     - remove all textboxes
     - unwrap all images
    */
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
            ptr.img.removeEventListener('load', onImageReload);
            unwrapImage(ptr.img);
            images.splice(i, 1);
        }
    }

    /*
    Listen for messages from the background script.
    */
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