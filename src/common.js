import _ from 'lodash';
import { useState, useEffect } from 'react';

// 默认选项数据
export const defaultOptions = {
  // 搜索设置
  search: {
    // 是否启用多重搜索
    enableMultipleSeach: true,

    // 在新标签页中打开搜索，否则在当前页面打开
    searchInNewTab: true,

    // 在新窗口中打开搜索标签页，否则在当前窗口打开
    searchInNewWindow: false,

    // 在后台标签中打开搜索（仅在searchInNewTab为true时有效），否则在前台标签打开
    searchInBackgroundTab: false,

    // 在最后一个标签页后打开搜索标签页（仅在searchInNewTab为true时有效），否则在当前标签页后打开
    searchTabInLastPosition: false,

    // 搜索引擎列表
    searchEngines: [
      {
        // 名称
        name: 'Google',

        // 搜索引擎搜索页面链接地址
        // 占位符[s]为搜索语句
        url: 'https://www.google.com/search?q=[s]',

        // 搜索引擎图标地址
        icon: 'https://www.google.com/favicon.ico',

        // 是否启用多重搜索
        enableMultipleSeach: true,

        // 是否在右键搜索菜单中显示
        showInContextMenu: true,
      },
      {
        name: 'Baidu',
        url: 'https://www.baidu.com/s?wd=[s]',
        icon: 'https://www.baidu.com/favicon.ico',
        enableMultipleSeach: true,
        showInContextMenu: true,
      },
      {
        name: 'Bing',
        url: 'https://www.bing.com/search?q=[s]',
        icon: 'https://www.bing.com/favicon.ico',
        enableMultipleSeach: true,
        showInContextMenu: true,
      },
      {
        name: 'YouTube',
        url: 'https://www.youtube.com/results?search_query=[s]',
        icon: 'https://www.youtube.com/favicon.ico',
        enableMultipleSeach: false,
        showInContextMenu: true,
      },
      {
        name: 'StackOverflow',
        url: 'https://stackoverflow.com/search?q=[s]',
        icon: 'https://stackoverflow.com/favicon.ico',
        enableMultipleSeach: false,
        showInContextMenu: true,
      },
    ],
  },

  // 翻译设置
  translate: {
    // 谷歌翻译网页时禁止翻译代码展示元素
    noTranslateCode: true,

    // 代码容器元素CSS选择器
    codeContainerSelector: 'pre, .prism-code, code, var, kbd',
  },

  // YouTube设置
  youtube: {
    // 添加网页全屏功能
    enablePlayerPageFullscreen: true,
  },
};

// 获取选项数据
export async function getOptions () {
  return new Promise(resolve => chrome.storage.sync.get(defaultOptions, (items) => {
    if (_.isEmpty(_.trim(items.translate.codeContainerSelector))) {
      items.translate.codeContainerSelector = defaultOptions.translate.codeContainerSelector;
    }

    resolve(items);
  }));
};

// 保存选项数据
export async function saveOptions (options) {
  return new Promise(resolve => chrome.storage.sync.set(options, () => {
    resolve(options);
  }));
};

// 恢复默认设置
export async function restoreOptions () {
  const options = await saveOptions(defaultOptions);
  return options;
};

// Hook - 获取选项数据
export function useOptions () {
  const [options, setOptions] = useState(null);

  useEffect(() => {
    async function fetchOptions() {
      const options = await getOptions();
      setOptions(options);
    }
    
    fetchOptions();
  }, []);

  return options;
}
