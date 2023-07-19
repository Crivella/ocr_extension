/*
    * This file contains functions for wrapping and unwrapping images.
*/
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

/*
Unwrap an image node, by removing the wrapper div and add-on classes from the node.
*/
export function unwrapImage(img) {
    console.log('unwrapping image');

    img.classList.remove(wrappedClass);
    img.classList.remove('ocr-loading');
    img.classList.remove('ocr-error');

    const wrapper = img.parentNode;
    wrapper.replaceWith(img);
}