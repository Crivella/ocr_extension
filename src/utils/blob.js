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
    * This file contains functions for getting and handling blobs
*/
import { getCanvas } from './image';

/*
Get the image
*/
export async function fetchBlobFromUrl(url) {
    console.log('FETCHING', url);

    const res = await fetch(url);
    const blob = await res.blob();
    console.log(blob);

    return blob;
}

/*
Turn a blob into a base64 string
*/
export function blobToBase64(blob) {
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

/*
Get a blob from a canvas
*/
export function blobFromCanvas(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        })
    })
}

/*
Get a blob from an img or canvas
*/
export async function base64FromAny(obj) {
    var base64data;
    var blob;

    if (obj.tagName == 'IMG') {
        blob = await fetchBlobFromUrl(obj.src);
        var [fmt, data] = await blobToBase64(blob);
        if ( ! ['jpeg', 'png', 'gif'].includes(fmt) ) {
            console.log('not supported format', fmt, 'falling back to canvas');
            const canvas = getCanvas(obj);
            blob = await blobFromCanvas(canvas);
            console.log('Generated blob:',blob)
            data = (await blobToBase64(blob))[1];
        }
        base64data = data;
    } else if (obj.tagName == 'CANVAS') {
        blob = await blobFromCanvas(obj);
        const [fmt, data] = await blobToBase64(blob);
        base64data = data;
    } else {
        throw new Error('Unsupported object type');
    }

    return base64data;
}