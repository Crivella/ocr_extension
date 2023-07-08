import React, { createContext, useContext, useEffect, useState } from "react";
import ReactDOM from 'react-dom/client';

import { getOtherTranslations } from "./API";

var menu = null;
var target = null;

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
    if (! menu.contains(e.target)) {
        destroyContextMenu();
    }
}

function handleGlobalRightClick(e) {
    if (! menu.contains(e.target)) {
        destroyContextMenu();
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
    copy: '1',
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
                case actionIds.copy: {
                    console.log('copy');
                    navigator.clipboard.writeText(target.originalText);
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
            <MenuItem id={actionIds.copy}>Copy</MenuItem>
            <MenuItem id={actionIds.copyOriginal}>Copy Original</MenuItem>
            <MenuItem id={actionIds.copyTranslated}>Copy Translated</MenuItem>
            <MenuDivider />
            <MenuItem id={actionIds.getOtherTranslations}>Get Other Translations</MenuItem>
        </menuContext.Provider>
    )
}
