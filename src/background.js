const TITLE_APPLY = "Enable OCR";
const TITLE_REMOVE = "Disable OCR";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];

const enabledIds = [];

/* Hub controlled variables */
var ENDPOINT = 'http://127.0.0.1:4000';
var FONT_SCALE = 1.0;
var R = 170;
var G = 68;
var B = 68;

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
            // Broadcast the color to all tabs
            BroadcastMessage({
                type: 'set-color',
                color: [R, G, B],
            })
            break;
        }
        case 'get-color': {
            console.log('getting color', [R, G, B]);
            sendResponse({color: [R, G, B]});
            break;
        }

        default:
            break;
    }
})
