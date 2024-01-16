import TurndownService from 'Turndown';
import Readability from '@tehshrike/readability'

const loadResource = async () => {
    const vault = "";
    let date, published;
    const { obsidianClipper } = await chrome.storage.sync.get(['obsidianClipper']);
    const { category, tag, theme, authorBrackets: inputAuthor, title: inputTitle, url = location.href } = obsidianClipper; // 分类，标签，主题
    /* Optional folder name such as "Clippings/" */
    const folder =  `${category}/` || "Clippings/";
    const regex = /(https?:\/\/)?(www\.)?(youtube\.com)\/watch\?v=([a-zA-Z0-9_-]+)/;
    const sourceUrl = url;

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
            fileName = fileName.replace(':', '').replace(/[/\\?%*|"<>]/g, '-');
        } else {
            fileName = fileName.replace(':', '').replace(/\//g, '-').replace(/\\/g, '-');
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
    const generateFileContent = () => {
      // Initialize the YAML front matter
      let yamlFrontMatter = '---\n';

      // Add the "分类" field if the "category" variable exists
      if (category) {
        yamlFrontMatter += '分类: "[[' + `${category}` + ']]"\n';
      }

      // Add the "主题" field if the "theme" variable exists
      if (theme) {
        yamlFrontMatter += '主题: ' + `${theme}` + '\n';
      }

      // Add the "tag" field if the "finalTag" variable exists
      if (finalTag) {
        yamlFrontMatter += 'tag: "' + finalTag + '"\n';
      }

      // Add the "作者" field if the "authorBrackets" variable exists
      if (authorBrackets) {
        yamlFrontMatter += '作者: ' + authorBrackets + '\n';
      }

      // Add the "文章标题" field if the "title" variable exists
      if (title) {
        yamlFrontMatter += '文章标题: "' + title + '"\n';
      }

      // Add the "源地址" field if the "sourceUrl" variable exists
      if (sourceUrl) {
        yamlFrontMatter += '源地址: ' + sourceUrl + '\n';
      }

      // Add the "创建日" field if the "date" variable exists
      if (date) {
        yamlFrontMatter += '创建日: ' + date + '\n';
      }

      // Add the "已发布" field if the "published" variable exists
      if (published) {
        yamlFrontMatter += '已发布: ' + published + '\n';
      }

      // End the YAML front matter
      yamlFrontMatter += '---\n\n';

      // Combine the YAML front matter and markdown body to create the file content
      const fileContent = yamlFrontMatter + markdownBody;
  
      return fileContent;
    }

    const fileContent = generateFileContent();

    // const fileContent =
    //       '---\n'
    // + '分类: "[[' + `${category}` + ']]"\n'
    // + '主题: ' + `${theme}` + '\n'
    // + 'tag: "' + finalTag + '"\n'
    // + '作者: ' + authorBrackets + '\n'
    // + '文章标题: "' + title + '"\n'
    // + '源地址: ' + sourceUrl + '\n'
    // + '创建日: ' + date + '\n'
    // + '已发布: ' + published + '\n'
    // + '---\n\n'
    // + markdownBody ;
    

    document.location.href = "obsidian://new?"
        + "file=" + encodeURIComponent(folder + fileName)
        + "&content=" + encodeURIComponent(fileContent)
        + vaultName ;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse('received');
    if (request.type === 'aciton') {
        try {
            loadResource();
        } catch(e) {
            console.log('clipboard error', e)
        }
    } else {
        console.log('---other message');
    }
});

