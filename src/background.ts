const createMenu = () => {
    chrome.contextMenus.create({
        type: 'normal',
        title: '整页导入Obsidian',
        id: 'page',
        contexts: ['page'],
    });

    chrome.contextMenus.create({
        title: '导入选择部分到Obsidian',
        type: 'normal',
        id: 'selection',
        contexts: ['selection'],
    });
}

const removeMenu = () => {
    chrome.contextMenus.removeAll();
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    getCurrentTab(tab);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.enabled) {
        createMenu();
    } else {
        removeMenu();
    }
})

const getCurrentTab = ((currentTab: any) => {
        //过滤标签页
        if(currentTab.url !=="chrome://newtab/" && currentTab.url !=="chrome-extension://"){
            chrome.tabs.sendMessage(currentTab.id, {type: 'aciton'});
        }
})


