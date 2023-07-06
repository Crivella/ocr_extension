import { randomId } from './defaults.js';

export const wrapperClass = `ocr-wrapper-${randomId}`;
export const wrappedClass = `ocr-wrapped-${randomId}`;

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

export function wrapImage(img) {
    // This is necessary since some sites can replace an already wrapped image
    // using JS (at somepoint this should be detected automatically)
    console.log('wrapping image');

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

    return [newImg, wrapper]
}

export function unwrapImage(img) {
    console.log('unwrapping image');

    img.classList.remove(wrappedClass);
    img.classList.remove('ocr-loading');
    img.classList.remove('ocr-error');

    const wrapper = img.parentNode;
    wrapper.replaceWith(img);
}