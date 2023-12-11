/**********************************************************************************
* ocr_extension - a browser extension to perform OCR and translation of images.   *
* Copyright (C) 2023-present Davide Grassano                                      *
*                                                                                 *
* This program is free software: you can redistribute it and/or modify            *
* it under the terms of the GNU General Public License as published by            *
* the Free Software Foundation, either version 3 of the License.                  *
*                                                                                 *
* This program is distributed in the hope that it will be useful,                 *
* but WITHOUT ANY WARRANTY; without even the implied warranty of                  *
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                   *
* GNU General Public License for more details.                                    *
*                                                                                 *
* You should have received a copy of the GNU General Public License               *
* along with this program.  If not, see {http://www.gnu.org/licenses/}.           *
*                                                                                 *
* Home: https://github.com/Crivella/ocr_extension                                 *
**********************************************************************************/
/*
This is the main content script that is injected into the page
*/
import md5 from 'md5';

import { getOcr, setEndpoint, textTranslation } from './utils/API';
import { base64FromAny } from './utils/blob';
import { createContextMenu, destroyContextMenu, destroyDialog } from './utils/contextmenu';
import { getSizes } from './utils/image';
import { drawBox } from './utils/textbox';
import { unwrapImage, wrapImage } from './utils/wrapper';

var OCR = false;

const writingModes = {
    'ja': 'vertical-rl',
    'ko': 'vertical-rl',
    'ch_sim': 'vertical-rl',
    'ch_tra': 'vertical-rl',
};

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

    var showTranslated = true;
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
            const toWrite = showTranslated ? tsl : ocr;
            const textdiv = drawBox({
                toWrite, box, max_width: nw, max_height: nh
            });
            textdiv.originalText = ocr;
            textdiv.translatedText = tsl;
            wrapper.appendChild(textdiv);
            // Copy original (OCRed) text to clipboard on click
            textdiv.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(ocr);
            })
            textdiv.addEventListener('contextmenu', createContextMenu)
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
    Used to handle 'DOMNodeRemoved' event on the document.
    EG: some sites can remove images to the page using JS.
    */
    function handleNodeRemoved(e) {
        const tag = e.target.tagName;
        if (['IMG', 'CANVAS'].includes(tag)) {
            console.log('image removed');
            const topop = [];
            images.forEach((ptr, idx) => {
                if (ptr.img === e.target) {
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
        }
    }

    /*
    Enable the addon on the current tab.
     - process all img/canvas already on the page
     - add event listeners
        - 'DOMNodeInserted': process new images added to the page
        - 'DOMNodeRemoved': remove all the textboxes if an image is removed
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
        document.addEventListener('DOMNodeRemoved', handleNodeRemoved)
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
        document.removeEventListener('DOMNodeRemoved', handleNodeRemoved);
        
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
        
        destroyDialog();
        destroyContextMenu();
    }

    /*
    Listen for messages from the background script.
    */
    browser.runtime.onMessage.addListener(async (msg) => {
        switch (msg.type) {
            case 'enable-ocr':
                enableOCR();
                break;
            case 'disable-ocr':
                disableOCR();
                break;
            case 'set-endpoint':
                setEndpoint(msg.endpoint);
                break;
            case 'set-font-scale':
                document.documentElement.style.setProperty('--ocr-text-font-scale', msg.fontScale);
                break;
            case 'set-color':
                document.documentElement.style.setProperty('--ocr-text-color', `rgb(${msg.color.join(',')})`);
                break;
            case 'translate-selection':
                console.log('translate-selection... run', msg);
                const res = await textTranslation(msg.text);
                console.log('translate-selection... res', res);
                const element = browser.menus.getTargetElement(msg.targetElementId);
                console.log('translate-selection... element', element, msg.text, res.text);
                element.innerText = element.innerText.replace(msg.text, res.text);
                break;
            case 'show-original-text':
                console.log('show-original');
                showTranslated = false;
                document.documentElement.style.setProperty('--ocr-text-writing-mode', writingModes[msg.lang] || 'horizontal-tb');
                images.forEach((ptr) => {
                    ptr.boxes.forEach((box) => {
                        box.innerText = box.originalText;
                    })
                })
                break;
            case 'show-translated-text':
                console.log('show-translated');
                showTranslated = true;
                document.documentElement.style.setProperty('--ocr-text-writing-mode', writingModes[msg.lang] || 'horizontal-tb');
                images.forEach((ptr) => {
                    ptr.boxes.forEach((box) => {
                        box.innerText = box.translatedText;
                    })
                })
                break
            default:
                console.log('unknown message', msg);
        }
    })
})();