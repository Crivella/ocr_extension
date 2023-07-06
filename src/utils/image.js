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