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

    if (obj.tagName == 'IMG') {
        const blob = await fetchBlobFromUrl(obj.src);
        const [fmt, data] = await blobToBase64(blob);
        if ( ! ['jpeg', 'png', 'gif'].includes(fmt) ) {
            console.log('not supported format', fmt, 'falling back to canvas');
            const canvas = getCanvas(img);
            blob = await blobFromCanvas(canvas);
            data = (await blobToBase64(blob))[1];
        }
        base64data = data;
    } else if (obj.tagName == 'CANVAS') {
        const blob = await blobFromCanvas(obj);
        const [fmt, data] = await blobToBase64(blob);
        base64data = data;
    } else {
        throw new Error('Unsupported object type');
    }

    return base64data;
}