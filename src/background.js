import _ from 'lodash';
import { getOptions } from './common';

chrome.runtime.onInstalled.addListener(() => {
  // 设置右键菜单
  setupContextMenu();
});

// 右键菜单点击处理
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

// 选项数据改变处理
chrome.storage.onChanged.addListener((list, sync) => {
  // 重新设置右键菜单
  setupContextMenu();
});

// 内容脚本消息处理
chrome.runtime.onMessage.addListener(async (message, sender) => {
  const options = await getOptions();
  const searchEngines = _.get(options, 'search.searchEngines');
  const { type, text } = message;
  const { tab } = sender;

  switch (type) {
    case 'searchPrimary':
      // 使用主搜索引擎进行搜索
      search([searchEngines[0]], text, tab);
      break;

    case 'searchSecondary':
      // 使用次搜索引擎进行搜索
      search([searchEngines[1]], text, tab);
      break;
    
    case 'searchMultiple':
      // 执行多重搜索
      search(searchEngines.filter(item => item.enableMultipleSeach), text, tab);
      break;

    default:
      break;
  }
});

// 设置右键菜单
async function setupContextMenu (options) {
  options = options || (await getOptions());
  const searchEngines = _.get(options, 'search.searchEngines');
  const { enableMultipleSeach = true } = _.get(options, 'search');

  if (_.isEmpty(options) || _.isEmpty(searchEngines)) {
    return;
  }

  // 删除之前设置的菜单
  chrome.contextMenus.removeAll();

  // 创建快捷搜索父菜单
  chrome.contextMenus.create({
    id: 'searchMenu',
    title: '快捷搜索：“%s”',
    contexts: ['selection'],
  });

  // 创建多重搜索菜单项
  chrome.contextMenus.create({
    id: 'multipleSearch',
    parentId: 'searchMenu',
    title: '多重搜索',
    contexts: ['selection'],
    enabled: enableMultipleSeach,
  });

  // 创建在新窗口中多重搜索菜单项
  chrome.contextMenus.create({
    id: 'multipleSearchInNewWindow',
    parentId: 'searchMenu',
    title: '在新窗口中多重搜索',
    contexts: ['selection'],
    enabled: enableMultipleSeach,
  });

  // 分隔线
  chrome.contextMenus.create({
    id: 's1',
    type: 'separator',
    parentId: 'searchMenu',
    contexts: ['selection'],
  });

  // 根据选项数据中的搜索引擎列表配置来生成相应的子菜单项
  searchEngines.forEach((item, index) => {
    if (!item.showInContextMenu) {
      return;
    }

    chrome.contextMenus.create({
      id: index.toString(),
      parentId: 'searchMenu',
      title: item.name,
      contexts: ['selection'],
    });
  });
}

// 创建新窗口
async function createNewWindow (urls = []) {
  return new Promise(resolve =>
    chrome.windows.create(
      {
        url: urls,
        state: 'maximized',
      },
      resolve
    )
  );
}

// 使用提供的搜索引擎列表搜索指定语句
async function search (searchEngines = [], query = '', currentTab, newWindow) {
  const options = await getOptions();
  let {
    searchInNewTab = true,
    searchInNewWindow = false,
    searchInBackgroundTab = false,
    searchTabInLastPosition = false,
  } = _.get(options, 'search');

  newWindow && (searchInNewWindow = true);

  // 获取搜索引擎搜索页面链接地址列表
  const urls = searchEngines.map(item => item.url.replace(/\[s\]/i, query));

  if (searchInNewWindow) {
    // 在新窗口中打开所有链接
    createNewWindow(urls);
  } else {
    if (!searchInNewTab && urls.length === 1) {
      // 在当前标签页中搜索
      chrome.tabs.update({ url: urls[0] });
    } else {
      urls.forEach((url, index) => {
        const params = {
          url,
          active: !searchInBackgroundTab && index === 0,
        };
        !searchTabInLastPosition && (params.index = index + currentTab.index + 1);

        // 创建搜索标签页
        chrome.tabs.create(params);
      });
    }
  }
}

// 右键菜单项点击处理
async function handleContextMenuClick (info, tab) {
  const options = await getOptions();
  const { menuItemId, selectionText } = info;
  const searchEngines = _.get(options, 'search.searchEngines');

  if (_.isEmpty(options) || _.isEmpty(searchEngines)) {
    return;
  }

  if (menuItemId === 'multipleSearch') {
    // 执行多重搜索
    search(searchEngines.filter(item => item.enableMultipleSeach), selectionText, tab);
  } else if (menuItemId === 'multipleSearchInNewWindow') {
    // 在新窗口中执行多重搜索
    search(searchEngines.filter(item => item.enableMultipleSeach), selectionText, tab, true);
  } else {
    // 获取对应的搜索引擎
    const searchEngine = _.get(searchEngines, menuItemId, {});

    // 执行搜索
    search([searchEngine], selectionText, tab);
  }
}
