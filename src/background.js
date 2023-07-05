const TITLE_APPLY = "Enable OCR";
const TITLE_REMOVE = "Disable OCR";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];

const enabledIds = [];

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
