/*
Inject the content in a tab
*/
function initializePageAction(tab) {
    // console.log('initializePageAction', tab.id)
    browser.tabs.executeScript(tab.id, {file: "dist/content.js"})
    browser.tabs.insertCSS(tab.id, {file: "content.css"})
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
});

/*
Create a context menu which will only show up for images.
*/
browser.menus.create({
    id: "translate-image",
    title: "Translate",
    contexts: ["image"]
});

browser.menus.onClicked.addListener(async (info, tab) => {
    // console.log(info)
    // console.log(tab)
    // console.log('translate-image')
    // console.log('translate-image', info.srcUrl)
    // console.log('translate-image', tab)
    try {
        await browser.tabs.sendMessage(tab.id, {
            type: 'translate-image',
            srcUrl: info.srcUrl,
            tab: tab,
        })
        // browser.menus.remove(info.menuItemId)
    }
    catch (err) {
        console.log(err)
    }
});

