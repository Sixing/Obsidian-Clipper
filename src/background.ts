import cn from "./utils/locale/cn.json";
import en from "./utils/locale/en.json";

let Lang = {};
let isWindows = false;

const initLang = async (langValue?: string) => {
    if (langValue) {
        Lang = langValue === 'cn' ? cn : en
    } else {
        const {lang } = await chrome.storage.sync.get([
            "lang"
          ]);
        Lang = lang === 'cn' ? cn : en
    }
}

const t = (key: string) => {
    return Lang[key]
}

const createMenu = () => {
    chrome.contextMenus.create({
        title: t('保存到Obsidian'),
        type: 'normal',
        id: 'obsidian',
        contexts: ['all'],
    });

    chrome.contextMenus.create({
        title: t('导入选择部分到新仓库'),
        type: 'normal',
        id: 'selection',
        parentId: 'obsidian',
        contexts: ['selection'],
    });

    chrome.contextMenus.create({
        title: t('导入选择部分到已有的仓库'),
        type: 'normal',
        id: 'addSelection',
        parentId: 'obsidian',
        contexts: ['selection'],
    });

    if (!isWindows) {
        chrome.contextMenus.create({
            type: 'normal',
            title: t('整页导入Obsidian'),
            parentId: 'obsidian',
            id: 'page',
            contexts: ['page'],
        }); 
    }
}

const removeMenu = () => {
    chrome.contextMenus.removeAll();
}

chrome.contextMenus.onClicked.addListener(({menuItemId}, tab) => {
    let importToExistValue = menuItemId === 'addSelection' ? true : false;
    getCurrentTab(tab, importToExistValue);
});

chrome.commands.onCommand.addListener(async command => {
    if (command === 'import-article') {
        const tab = await chrome.tabs.query({
            active: true,
        });
        if (tab.length) { getCurrentTab(tab[0])};
    }
  });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.enabled) {
        isWindows = request.isWindows;
        createMenu();
    } else if (request.lang) {
        initLang(request.lang);
        removeMenu()
        createMenu();
    } else if (request.windows) {

    } else {
        removeMenu();
    }
})



const getCurrentTab = ((currentTab: any, importToExistValue: boolean = false) => {
        //过滤标签页
        if(currentTab.url !=="chrome://newtab/" && currentTab.url !=="chrome-extension://"){
            chrome.tabs.sendMessage(currentTab.id, {type: 'aciton', importToExistValue});
        }
})


initLang()
