import React, { createContext, useContext, useEffect, useState } from "react";
import ReactDOM from 'react-dom/client';

import { getOtherTranslations } from "./API";

var menu = null;
var target = null;
var dialog = null;

const menuContext = createContext({});

export function createContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();

    if (menu) {
        menu.remove();
    }

    target = e.target;

    menu = document.createElement('div');
    menu.className = "ocr-cmenu";
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    menu.style.position = "fixed";
    menu.style.zIndex = "9999";

    document.body.appendChild(menu);
    document.addEventListener('click', handleGlobalClick)
    document.addEventListener('contextmenu', handleGlobalRightClick)
    console.log('creating context menu', menu);

    const root = ReactDOM.createRoot(menu);
    root.render(
        <TextBoxMenu />
    );

}

function handleGlobalClick(e) {
    // https://stackoverflow.com/questions/36695438/detect-click-outside-div-using-javascript
    if (! menu.contains(e.target)) {
        destroyContextMenu();
        destroyDialog();
    }
}

function handleGlobalRightClick(e) {
    if (! menu.contains(e.target)) {
        destroyContextMenu();
        destroyDialog();
    }
    else{
        e.preventDefault();
        e.stopPropagation();
    }
}

function destroyContextMenu() {
    if (! menu) {
        return;
    }
    menu.remove();
    document.removeEventListener('click', handleGlobalClick);
    document.removeEventListener('contextmenu', handleGlobalRightClick);
    menu = null;
    target = null;
}

function createDialog(translations) {
    dialog = document.createElement('dialog');
    dialog.classList.add('ocr-dialog');

    var row;
    var col;
    row = document.createElement('tr');
    row.className = 'ocr-dialog-row';
    col = document.createElement('th');
    col.innerText = 'Model';
    row.appendChild(col);
    col = document.createElement('th');
    col.innerText = 'Translation';
    row.appendChild(col);
    dialog.appendChild(row);

    translations.forEach((translation) => {
        row = document.createElement('tr');
        row.className = 'ocr-dialog-row';
        col = document.createElement('td');
        col.innerText = translation.model;
        row.appendChild(col);
        col = document.createElement('td');
        col.innerText = translation.text;
        row.appendChild(col);
        dialog.appendChild(row);
    })

    const close = document.createElement('button');
    close.innerText = 'X';
    close.className = 'ocr-dialog-close';
    close.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        destroyDialog();
    })
    dialog.appendChild(close);

    return dialog;
}

function destroyDialog() {
    if (! dialog) {
        return;
    }
    dialog.close();
    dialog.remove();
    dialog = null;
}

function removeBox() {
    if (target) {
        target.remove();
    }
}

function MenuItem({ id, children }) {

    const { setValue } = useContext(menuContext);

    const onClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('clicked', id);
        setValue(id);
    }

    return (
        <div style={{display: 'flex'}}>
            <button onClick={onClick} className="ocr-cmenu-item">
                {children}
            </button>
        </div>
    )
}

function MenuDivider() {
    return (
        <div style={{display: 'flex'}}>
            <hr className="ocr-cmenu-divider" />
        </div>
    )  
}

const actionIds = {
    close: '1',
    copyOriginal: '2',
    copyTranslated: '3',
    getOtherTranslations: '4',
}

function TextBoxMenu() {
    const [value, setValue] = useState(null);

    useEffect(() => {
        if (value) {
            console.log('value', value);
            switch (value) {
                case actionIds.close: {
                    console.log('close');
                    removeBox();
                    destroyContextMenu();
                    break;
                }
                case actionIds.copyOriginal: {
                    console.log('copy original');
                    navigator.clipboard.writeText(target.originalText);
                    destroyContextMenu();
                    break;
                }
                case actionIds.copyTranslated: {
                    console.log('copy translated');
                    navigator.clipboard.writeText(target.translatedText);
                    destroyContextMenu();
                    break;
                }
                case actionIds.getOtherTranslations: {
                    console.log('get other translations');
                    getOtherTranslations(target.originalText)
                        .then((res) => {
                            console.log('got other translations', res);

                            createDialog(res.translations);

                            document.body.appendChild(dialog);
                            document.addEventListener('keydown', (e) => {
                                if (e.key === 'Escape') {
                                    closeDialog();
                                }
                            })
                            dialog.showModal();
                        });
                    destroyContextMenu();
                    
                    break;
                }
                default: {
                    console.log('unknown');
                    break;
                }
            }
        }
    }, [value])

    const newProps = {
        value,
        setValue,
    }
    
    return (
        <menuContext.Provider value={newProps}>
            <MenuItem id={actionIds.close}>Close</MenuItem>
            <MenuItem id={actionIds.copyOriginal}>Copy Original</MenuItem>
            <MenuItem id={actionIds.copyTranslated}>Copy Translated</MenuItem>
            <MenuDivider />
            <MenuItem id={actionIds.getOtherTranslations}>Get Other Translations</MenuItem>
        </menuContext.Provider>
    )
}
