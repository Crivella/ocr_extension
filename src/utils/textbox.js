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

    const size = Math.sqrt(w*h/tsl.length*0.3)/7;

    text.style.fontSize = `${size}vw`;
    text.style.lineHeight = `${size}vw`;

    return text;
}