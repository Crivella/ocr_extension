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
    * Image related functions
*/

/*
Get the sizes of an image
*/
export function getSizes(img) {
    var nw;
    var nh;
    if (img.tagName == 'IMG') {
        nw = img.naturalWidth;
        nh = img.naturalHeight;
    } else if (img.tagName == 'CANVAS') {
        nw = img.width;
        nh = img.height;
    }

    return [nw, nh];
}

/*
Transform an image node to a canvas node
*/
export function getCanvas(img) {
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