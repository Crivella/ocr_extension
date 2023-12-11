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
    * This file contains functions to draw textboxes on the image
*/
const textboxClass = "patch-text";

/*
Draw a textbox on the image.
box is a list of 4 numbers representing: [left, bottom, right, top]
tsl is the translated text
max_width and max_height are the dimensions of the image (used to adjust the font size).
*/
export function drawBox({box, toWrite, max_width, max_height}) {
    const [l,b,r,t] = box;
    const w = r-l;
    const h = t-b;

    console.log('BOX',l,b,r,t,w,h);

    const text = document.createElement('div');
    text.className = textboxClass;
    text.innerHTML = `${toWrite}`;
    text.style.width = `${w/max_width*100}%`;
    text.style.height = `${h/max_height*100}%`;
    text.style.top = `${b/max_height*100}%`;
    text.style.left = `${l/max_width*100}%`;

    const box_fill_factor = 0.8; // Box should not be 100% charaters but also empty space
    const char_area = w * h / toWrite.length * box_fill_factor;
    // Font size in px renormalized to viewport width
    // This approach is ok as long as image reseizes with the window
    const size = Math.sqrt( char_area ) / (window.innerWidth / 100);

    text.style.fontSize = `calc(${size}vw * var(--ocr-text-font-scale, 1))`;
    text.style.lineHeight = `calc(${size}vw * var(--ocr-text-font-scale, 1))`;

    return text;
}