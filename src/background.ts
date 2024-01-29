import cn from "./utils/locale/cn.json";
import en from "./utils/locale/en.json";

let Lang = {};

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
        type: 'normal',
        title: t('整页导入Obsidian'),
        id: 'page',
        contexts: ['page'],
    });

    chrome.contextMenus.create({
        title: t('导入选择部分到Obsidian'),
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
        createMenu();
    } else if (request.lang) {
        initLang(request.lang);
        removeMenu()
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


initLang()
