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
    * Handle the creation of context menus used for right-clicking on textboxes.
*/
import React, { createContext, useContext, useEffect, useState } from "react";
import ReactDOM from 'react-dom/client';

import { getOtherTranslations } from "./API";

var menu = null;
var target = null;
var dialog = null;

const menuContext = createContext({});

/*
Create a context menu for the given target.
*/
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
    document.addEventListener('click', handleMenuClick)
    document.addEventListener('contextmenu', handleMenuRightClick)
    console.log('creating context menu', menu);

    const root = ReactDOM.createRoot(menu);
    root.render(
        <TextBoxMenu />
    );

}

/*
Destroy context menu when clicking outside of it.
Stop click propagation otherwise.
*/
function handleMenuClick(e) {
    // https://stackoverflow.com/questions/36695438/detect-click-outside-div-using-javascript
    if ( menu ) {
        if ( ! menu.contains(e.target)) {
            destroyContextMenu();
        }
        e.preventDefault();
        e.stopPropagation();
    }
}

/*
Destroy dialog when clicking outside of it.
Stop click propagation otherwise.
*/
function handleDialogClick(e) {
    // https://stackoverflow.com/questions/36695438/detect-click-outside-div-using-javascript
    if ( dialog ) {
        if( ! dialog.contains(e.target)) {
            destroyDialog();
        }
        e.preventDefault();
        e.stopPropagation();
    }
}

/*
Destroy context menu when right-clicking outside of it.
Stop click propagation otherwise.
*/
function handleMenuRightClick(e) {
    if ( menu ) {
        if( ! menu.contains(e.target)) {
            destroyContextMenu();
        }
        e.preventDefault();
        e.stopPropagation();
    }
}

/*
Destroy dialog when right-clicking outside of it.
Stop click propagation otherwise.
*/
function handleDialogRightClick(e) {
    if (dialog) {
        if( ! dialog.contains(e.target)) {
            destroyDialog();
        }
        e.preventDefault();
        e.stopPropagation();
    }
}

/*
Function to destroy the context menu and remove all event listeners.
*/
function destroyContextMenu() {
    if (! menu) {
        return;
    }
    menu.remove();
    document.removeEventListener('click', handleDialogClick);
    document.removeEventListener('contextmenu', handleDialogRightClick);
    menu = null;
    target = null;
}

/*
Function to create a dialog containing a table of all translations for a given textbox.
*/
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

    translations.forEach((translation, idx) => {
        row = document.createElement('tr');
        row.className = `ocr-dialog-row${(idx % 2) + 1}`;
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

    document.addEventListener('click', handleDialogClick);
    document.addEventListener('contextmenu', handleDialogRightClick);

    return dialog;
}

/*
Destroy dialog and remove all event listeners.
*/
function destroyDialog() {
    if (! dialog) {
        return;
    }
    dialog.close();
    dialog.remove();
    document.removeEventListener('click', handleMenuClick);
    document.removeEventListener('contextmenu', handleMenuRightClick);
    dialog = null;
}

/*
Remove the target textbox.
*/
function removeBox() {
    if (target) {
        target.remove();
    }
}

/*
React component to render an item in the context menu.
*/
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

/*
React component to render a divider in the context menu.
*/
function MenuDivider() {
    return (
        <div style={{display: 'flex'}}>
            <hr className="ocr-cmenu-divider" />
        </div>
    )  
}

/*
Map of action ids to have only one place where to change them.
*/
const actionIds = {
    close: '1',
    copyOriginal: '2',
    copyTranslated: '3',
    getOtherTranslations: '4',
}

/*
React component to render the context menu.
*/
function TextBoxMenu() {
    const [value, setValue] = useState(null);

    // Handle an action being selected.
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
                            dialog.show();
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
