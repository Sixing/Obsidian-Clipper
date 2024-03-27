import TurndownService from 'Turndown';
import Readability from '@tehshrike/readability'
import cn from "./utils/locale/cn.json";
import en from "./utils/locale/en.json";
import { message } from "antd"

let Lang = {};

const loadResource = async (importToExistValue) => {
    const vault = "";
    let date, published;
    const { obsidianClipper = {}, lang } = await chrome.storage.sync.get(['obsidianClipper', 'lang']);
    const { category, tag, theme, authorBrackets: inputAuthor, title: inputTitle, url = location.href } = obsidianClipper; // 分类，标签，主题
    /* Optional folder name such as "Clippings/" */
    const folder =  `${category}/` || "Clippings/";
    const regex = /(https?:\/\/)?(www\.)?(youtube\.com)\/watch\?v=([a-zA-Z0-9_-]+)/;
    const sourceUrl = url;
    Lang = lang === 'cn' ? cn : en

    const t = (key: string) => {
        return Lang[key]
    }

    /* Optional tags  */
    let tags = "clippings";

    /* Parse the site's meta keywords content into tags, if present */
    if (document.querySelector('meta[name="keywords" i]')) {
        var keywords = document.querySelector('meta[name="keywords" i]').getAttribute('content').split(',');

        keywords.forEach(function(keyword) {
            let tag = ' ' + keyword.split(' ').join('');
            tags += tag;
        });
    }

    const finalTag = `${tag}` || tags;

    function getSelectionHtml() {
        var html = "";
        if (typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var container = document.createElement("div");
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html = container.innerHTML;
            }
        } else if (typeof document.selection != "undefined") {
            if (document.selection.type == "Text") {
                html = document.selection.createRange().htmlText;
            }
        }
        return html;
    }

    const selection = getSelectionHtml();

    const {
        title: articleTitle,
        byline,
        content
    } = new Readability(document.cloneNode(true)).parse();
    const title = inputTitle || articleTitle;

    function getFileName(fileName) {
        var userAgent = window.navigator.userAgent,
            platform = window.navigator.platform,
            windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];

        if (windowsPlatforms.indexOf(platform) !== -1) {
            fileName = fileName.replace(/:/g, '').replace(/[/\\?%*|"<>]/g, '-');
        } else {
            fileName = fileName.replace(/:/g, '').replace(/\//g, '-').replace(/\\/g, '-');
        }
        return fileName;
    }
    const fileName = getFileName(title);

    if (selection) {
        var markdownify = selection;
    } else {
        markdownify = content;
    }

    if (vault) {
        var vaultName = '&vault=' + encodeURIComponent(`${vault}`);
    } else {
        vaultName = '';
    }

    let markdownBody = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'indented',
        emDelimiter: '*',
        linkStyle: 'referenced',
        linkReferenceStyle: 'full',
        preformattedCode: true,
    }).turndown(markdownify);

    // Utility function to get meta content by name or property
    if (regex.test(sourceUrl)) {
      markdownBody = `![](${sourceUrl})${markdownBody}`
    }

    function getMetaContent(attr, value) {
        var element = document.querySelector(`meta[${attr}='${value}']`);
        return element ? element.getAttribute("content").trim() : "";
    }

    // Fetch byline, meta author, property author, or site name
    var author = inputAuthor || byline || getMetaContent("name", "author") || getMetaContent("property", "author") || getMetaContent("property", "og:site_name");

    // Check if there's an author and add brackets
    var authorBrackets = author ? `"[[${author}]]"` : "";


    /* Try to get published date */
    var timeElement = document.querySelector("time");
    var publishedDate = timeElement ? timeElement.getAttribute("datetime") : "";

    const getDate = () => {
      const date = publishedDate ? new Date(publishedDate) : new Date();
      const year = date.getFullYear();
      let month: string | number = date.getMonth() + 1; // Months are 0-based in JavaScript
      let day: string | number = date.getDate();
  
      // Pad month and day with leading zeros if necessary
      month = month < 10 ? '0' + month : month;
      day = day < 10 ? '0' + day : day;
      return { year, month, day };
    }

    const { year, month, day } = getDate();
    date = year + '/' + month + '/' + day

    if (publishedDate && publishedDate.trim() !== "") {
      published = year + '-' + month + '-' + day;
    }
    
    /* YAML front matter as tags render cleaner with special chars  */
    const fileContent = importToExistValue ? `\n${markdownBody}` : [
      '---',
      category ? `${t('仓库/文件夹')}: "[[${category}]]"` : null,
      theme ? `${t('主题')}: ${theme}` : null,
      finalTag ? `tag: "${finalTag}"` : null,
      authorBrackets ? `${t('作者')}: ${authorBrackets}` : null,
      title ? `${t('文章标题')}: "${title}"` : null,
      sourceUrl ? `${t('源地址')}: ${sourceUrl}` : null,
      published ? `${t('已发布')}: ${published}` : `${t('创建日')}: ${date}`,
      '---',
      '',
      markdownBody
    ].filter(line => line !== null).join('\n');

    // for Windows, custome protocol has 2048 limit for url
    let obsidianUrl;
    if (navigator.userAgent.includes("Windows")) {
        obsidianUrl = "obsidian://new?"
        + "file=" + encodeURIComponent(folder + fileName)
        + "&content=" + encodeURIComponent(fileContent)
        + "&append"
        + vaultName;
        if (obsidianUrl.length > 2048) {
            message.warning(t('超出长度'));
            return;
        }
    } else {
        obsidianUrl = "obsidian://new?"
        + "file=" + encodeURIComponent(folder + fileName)
        + "&content=" + encodeURIComponent(fileContent)
        + "&append"
        + vaultName;
        document.location.href = obsidianUrl
    }
    document.location.href = obsidianUrl
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse('received');
    const { type, importToExistValue = false } = request;
    if (type === 'aciton') {
        try {
            loadResource(importToExistValue);
        } catch(e) {
            console.log('clipboard error', e)
        }
    } else {
        console.log('---other message');
    }
});

