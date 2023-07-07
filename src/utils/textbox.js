export function drawBox({box, tsl, max_width, max_height}) {
    const [l,b,r,t] = box;
    const w = r-l;
    const h = t-b;

    console.log('BOX',l,b,r,t,w,h);

    const text = document.createElement('div');
    text.className = 'patch-text'
    text.innerHTML = `${tsl}`
    text.style.width = `${w/max_width*100}%`;
    text.style.height = `${h/max_height*100}%`;
    text.style.top = `${b/max_height*100}%`;
    text.style.left = `${l/max_width*100}%`;

    const box_fill_factor = 0.8; // Box should not be 100% charaters but also empty space
    const char_area = w * h / tsl.length * box_fill_factor;
    // Font size in px renormalized to viewport width
    // This approach is ok as long as image reseizes with the window
    const size = Math.sqrt( char_area ) / (window.innerWidth / 100);

    text.style.fontSize = `calc(${size}vw * var(--ocr-text-font-scale, 1))`;
    text.style.lineHeight = `calc(${size}vw * var(--ocr-text-font-scale, 1))`;

    return text;
}