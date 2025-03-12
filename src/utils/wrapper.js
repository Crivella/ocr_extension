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
    * This file contains functions for wrapping and unwrapping images.
*/

import { debug } from "./logging";

export const wrapperClass = "ocr-wrapper";
export const wrappedClass = "ocr-wrapped";

/*
Generate a working clone of an image/canvas node.
*/
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

/*
Wrap an image node with a div with ocr-wrapper class.
Add the ocr-wrapped class to the image node.
*/
export function wrapImage(img) {
    // This is necessary since some sites can replace an already wrapped image
    // using JS (at somepoint this should be detected automatically)
    debug('wrapping image');

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
    debug('copying class', newImg.classList);
    newImg.classList.forEach((cls) => {
        wrapper.classList.add(cls);
    })

    newImg.classList.add(wrappedClass);
    wrapper.classList.add(wrapperClass);

    return [newImg, wrapper]
}

/*
Unwrap an image node, by removing the wrapper div and add-on classes from the node.
*/
export function unwrapImage(img) {
    debug('unwrapping image');

    img.classList.remove(wrappedClass);
    img.classList.remove('ocr-loading');
    img.classList.remove('ocr-error');

    const wrapper = img.parentNode;
    wrapper.replaceWith(img);
}