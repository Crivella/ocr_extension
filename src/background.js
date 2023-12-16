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
This is the background page. It is responsible for:
    - injecting the content script in the page
    - listening for messages from the content script
    - enabling/disabling the addon on the current tab
    - updating the page action icon
    - handle global variables to preserve content script state on page reload
    - handle communication between the content and the popup
*/
const TITLE_APPLY = "Enable OCR";
const TITLE_REMOVE = "Disable OCR";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];

const enabledIds = [];

/* Hub controlled variables */
var ENDPOINT;
var FONT_SCALE;
var SHOW_TRANSLATED;
var TEXT_ORIENTATION;
var R;
var G;
var B;
var LANG_SRC;
var LANG_DST;
var SELECTED_OPTIONS;
var BOX_MODEL;
var OCR_MODEL;
var TSL_MODEL;

browser.storage.local.get().then((res) => {
    ENDPOINT = res.endpoint || 'http://127.0.0.1:4000';
    FONT_SCALE = res.fontScale || 1.0;
    SHOW_TRANSLATED = res.showTranslated === undefined ? true : res.showTranslated;
    TEXT_ORIENTATION = res.textOrientation || 'horizontal-tb';
    LANG_SRC = res.langSrc;
    LANG_DST = res.langDst;
    R = res.R || 170;
    G = res.G || 68;
    B = res.B || 68;
    SELECTED_OPTIONS = res.selectedOptions || {};
})

/*
Returns true only if the URL's protocol is in APPLICABLE_PROTOCOLS.
Argument url must be a valid URL string.
*/
function protocolIsApplicable(url) {
    const protocol = (new URL(url)).protocol;
    console.log(protocol);
    return APPLICABLE_PROTOCOLS.includes(protocol);
  }

/*
Inject the content in a tab
*/
function initializePageAction(tab) {
    // console.log('initializePageAction', tab.id)
    if (!protocolIsApplicable(tab.url)) {
        console.log('not applicable', tab.url)
        return;
    }
    browser.tabs.executeScript(tab.id, {file: "dist/content.js"})
    browser.tabs.insertCSS(tab.id, {file: "content.css"})
    browser.tabs.sendMessage(tab.id, {
        type: 'set-endpoint',
        endpoint: ENDPOINT,
    })
    browser.pageAction.setIcon({tabId: tab.id, path: "icons/off.png"});
    browser.pageAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
    browser.pageAction.show(tab.id);
}

/*
When first loaded, initialize the page action for all tabs.
*/
let gettingAllTabs = browser.tabs.query({});
gettingAllTabs.then((tabs) => {
    for (let tab of tabs) {
        initializePageAction(tab);
    }
});

/*
Each time a tab is updated, reset the page action for that tab.
*/
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    initializePageAction(tab);
    console.log('onUpdated', id, changeInfo, tab, enabledIds)
    if (enabledIds.includes(id)) {
        enableOCR(tab)
    }
});

/*
Toggle OCR on/off for tab
*/
function enableOCR(tab) {
    console.log('enable-ocr', tab.id)
    if ( ! enabledIds.includes(tab.id)) {
        enabledIds.push(tab.id);
    }
    browser.pageAction.setIcon({tabId: tab.id, path: "icons/on.png"});
    browser.pageAction.setTitle({tabId: tab.id, title: TITLE_REMOVE});
    // browser.tabs.insertCSS({code: CSS});
    browser.tabs.sendMessage(tab.id, {
        type: 'enable-ocr',
    })
    browser.tabs.sendMessage(tab.id, {
        type: SHOW_TRANSLATED ? 'show-translated-text' : 'show-original-text',
        lang: SHOW_TRANSLATED ? LANG_DST : LANG_SRC,
    })
}

function disableOCR(tab) {
    console.log('disable-ocr', tab.id)
    enabledIds.splice(enabledIds.indexOf(tab.id), 1)
    browser.pageAction.setIcon({tabId: tab.id, path: "icons/off.png"});
    browser.pageAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
    browser.tabs.sendMessage(tab.id, {
        type: 'disable-ocr',
    })
}

function toggleOCR(tab) {
    function gotTitle(title) {
        if (title === TITLE_APPLY) {
            enableOCR(tab);
        } else {
            disableOCR(tab);
        }
    }
  
    let gettingTitle = browser.pageAction.getTitle({tabId: tab.id});
    gettingTitle.then(gotTitle);
  }

browser.pageAction.onClicked.addListener(toggleOCR);

browser.menus.create({
    id: "selection-translate",
    title: "Translate text",
    contexts: ["selection"],
});

// browser.menus.create({
//     id: "textbox-menu-2",
//     title: "Test2",
//     contexts: ["all"],
// });

browser.menus.onClicked.addListener((info, tab) => {
    console.log('menu clicked', info, tab);
    switch (info.menuItemId) {
        case "selection-translate":
            browser.tabs.sendMessage(tab.id, {
                targetElementId: info.targetElementId,
                type: 'translate-selection',
                text: info.selectionText.replaceAll('\r', ''),
            })
            break;
        default:
            break;
    }
})

function BroadcastMessage(msg) {
    browser.tabs.query({}).then((tabs) => {
        tabs.forEach((tab) => {
            browser.tabs.sendMessage(tab.id, msg)
        })
    })
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.type) {
        case 'set-endpoint': {
            console.log('setting endpoint', msg.endpoint);
            ENDPOINT = msg.endpoint;
            browser.storage.local.set({endpoint: ENDPOINT});
            // Broadcast the endpoint to all tabs
            BroadcastMessage({
                type: 'set-endpoint',
                endpoint: ENDPOINT,
            })
            break;
        }
        case 'get-endpoint': {
            console.log('getting endpoint', ENDPOINT);
            sendResponse({endpoint: ENDPOINT});
            break;
        }
        case 'set-font-scale': {
            console.log('setting font scale', msg.fontScale);
            FONT_SCALE = msg.fontScale;
            browser.storage.local.set({fontScale: FONT_SCALE});
            // Broadcast the font scale to all tabs
            BroadcastMessage({
                type: 'set-font-scale',
                fontScale: FONT_SCALE,
            })
            break;
        }
        case 'get-font-scale': {
            console.log('getting font scale', FONT_SCALE);
            sendResponse({fontScale: FONT_SCALE});
            break;
        }
        case 'set-color': {
            console.log('setting color', msg.color);
            [R, G, B] = msg.color;
            browser.storage.local.set({R: R, G: G, B: B});
            // Broadcast the color to all tabs
            BroadcastMessage({
                type: 'set-color',
                color: [R, G, B],
            })
            break;
        }
        case 'set-lang-src': {
            console.log('setting lang src', msg.lang);
            LANG_SRC = msg.lang;
            browser.storage.local.set({langSrc: LANG_SRC});
            break;
        }
        case 'set-lang-dst': {
            console.log('setting lang dst', msg.lang);
            LANG_DST = msg.lang;
            browser.storage.local.set({langDst: LANG_DST});
            break;
        }
        case 'get-color': {
            console.log('getting color', [R, G, B]);
            sendResponse({color: [R, G, B]});
            break;
        }
        case 'set-show-text': {
            console.log('showing translated text', msg);
            SHOW_TRANSLATED = msg.active;
            TEXT_ORIENTATION = msg.orientation;
            browser.storage.local.set({showTranslated: SHOW_TRANSLATED});
            browser.storage.local.set({orientation: TEXT_ORIENTATION});
            BroadcastMessage({
                type: SHOW_TRANSLATED ? 'show-translated-text' : 'show-original-text',
                orientation: TEXT_ORIENTATION,
            })
            break;
        }
        case 'get-show-text': {
            console.log('getting show text', SHOW_TRANSLATED);
            sendResponse({
                showTranslated: SHOW_TRANSLATED,
                orientation: TEXT_ORIENTATION,
            });
            break;
        }
        case 'set-models': {
            BOX_MODEL = msg.boxModel;
            OCR_MODEL = msg.ocrModel;
            TSL_MODEL = msg.tslModel;
            break;
        }
        case 'set-selected-options': {
            console.log('setting selected options', msg.options);
            SELECTED_OPTIONS = msg.options;
            browser.storage.local.set({selectedOptions: SELECTED_OPTIONS});
            BroadcastMessage({
                type: 'set-selected-options',
                options: {
                    ...SELECTED_OPTIONS[BOX_MODEL],
                    ...SELECTED_OPTIONS[OCR_MODEL],
                    ...SELECTED_OPTIONS[TSL_MODEL],
                }
            })
            break;
        }


        default:
            break;
    }
})
