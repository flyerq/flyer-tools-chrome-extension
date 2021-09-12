import $ from 'jquery';
import _ from 'lodash';
import { getOptions } from './common';

/**
 * 功能清单
 */
const featureList = [
  // 快捷搜索快捷按键绑定
  {
    key: 'search',
    enable: () => true,
    installed: false,
    install: (feature, options) => {
      // 鼠标中键单击进行多重搜索
      $(document).on('mousedown', mde => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        const mdTarget = mde.target;
        
        if (mde.button === 1 && selectedText && selection.containsNode(mde.target, true)) {
          mde.preventDefault();
          $(document).one('mouseup', mue => {
            if (mdTarget === mue.target) {
              chrome.runtime.sendMessage({
                type: 'searchMultiple',
                text: selectedText,
              });
            }
          });
        }
      })

      // 键盘快捷键搜索
      .on('keydown', e => {
        const { key, originalEvent: { repeat } } = e;
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        // 忽略自动按键和未选中文本时的按键
        if (repeat || _.isEmpty(selectedText)) {
          return;
        }

        ['Home', 'End'].includes(key) && e.preventDefault();

        if (key === 'Home') {
          chrome.runtime.sendMessage({
            type: 'searchPrimary',
            text: selectedText,
          });
        } else if (key === 'End') {
          chrome.runtime.sendMessage({
            type: 'searchSecondary',
            text: selectedText,
          });
        }
      });
    },
    uninstall: (feature, options) => {
    },
  },

  // 使用谷歌翻页页面时不翻译代码展示元素
  {
    key: 'translate.noTranslateCode',
    enable: (feature, options) => _.get(options, feature.key, false),
    installed: false,
    install: (feature, options) => {
      const selector = options.translate.codeContainerSelector;
      $(selector).addClass('notranslate');

      // 监听到页面新增DOM元素后为其添加禁止翻译的类名
      document.body[feature.key] = document.body[feature.key] || {};
      document.body[feature.key].observer = new MutationObserver(mutations => {
        $(selector).addClass('notranslate');
      });
      
      // 开始监听DOM变化
      document.body[feature.key].observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: false,
      });
    },
    uninstall: (feature, options) => {
      $(options.translate.codeContainerSelector).removeClass('notranslate');

      // 停止监听
      document.body[feature.key].observer.disconnect();
    },
  },

  // 添加YouTube视频播放器网页全屏功能
  {
    key: 'youtube.enablePlayerPageFullscreen',
    matches: [/^https:\/\/www.youtube.com\//i],
    enable: (feature, options) => _.get(options, feature.key, false),
    installed: false,
    install: (feature, options) => {
      const $player = $('#movie_player');
      const $btnSize = $player.find('.ytp-right-controls > .ytp-size-button');
      const $btnPageFullscreen = $(`
        <button class="page-fullscreen-button ytp-button" title="网页全屏">
          <svg viewBox="0 0 1024 1024" version="1.1" width="100%" height="100%" fill="#fff">
            <g transform="scale(0.5)" transform-origin="center">
              <path d="M941.248 850.752 730.496 640 640 730.496 850.752 941.248 768 1024 1024 1024 1024 768zM82.752 173.248 293.504 384 384 293.504 173.248 82.752 256 0 0 0 0 256zM850.752 82.752 640 293.504 730.496 384 941.248 173.248 1024 256 1024 0 768 0zM384 730.496 293.504 640 82.752 850.752 0 768 0 1024 256 1024 173.248 941.248z"></path>
            </g>
          </svg>
        </button>
      `.trim());

      $('head').append(`
        <style>
          .page-fullscreen {
            position: fixed !important;
            width: 100% !important;
            height: 100% !important;
            left: 0 !important;
            top: 0 !important;
            z-index: 9999 !important;
            background: #000 !important;
          }

          .page-fullscreen .page-fullscreen-button svg path {
            d: path("M896 640 640 640 640 896 722.752 813.248 933.504 1024 1024 933.504 813.248 722.752zM813.248 301.248 1024 90.496 933.504 0 722.752 210.752 640 128 640 384 896 384zM90.496 0 0 90.496 210.752 301.248 128 384 384 384 384 128 301.248 210.752zM210.752 722.752 0 933.504 90.496 1024 301.248 813.248 384 896 384 640 128 640z");
          }

          :fullscreen .page-fullscreen-button, [fullscreen] .page-fullscreen-button {
            display: none;
          }
        </style>
      `);

      // 网页全屏按钮点击处理
      $btnPageFullscreen.on('click', () => {
        const $playerContainer = $player.parent();
        const $theaterContainer = $('#player-theater-container');
        const isTheaterMode = $theaterContainer[0].contains($player[0]);

        if ($playerContainer.hasClass('page-fullscreen')) {
          if ($player.data('theaterModeChanged') && isTheaterMode) {
            $btnSize[0].click();
            $player.data('theaterModeChanged', false);
          }
          
          $('body').removeClass('no-scroll');
          $player.addClass('ytp-hide-info-bar');
          $playerContainer.removeClass('page-fullscreen');
          window.dispatchEvent(new Event("resize"));
        } else {
          if (!isTheaterMode) {
            $btnSize[0].click();
            $player.data('theaterModeChanged', true);
          }

          $('body').addClass('no-scroll');
          $player.removeClass('ytp-hide-info-bar')
          $playerContainer.addClass('page-fullscreen');
          window.dispatchEvent(new Event("resize"));
        }
      });

      // 按Esc键退出网页全屏模式
      $(document).on('keydown', (e) => {
        if (e.key === 'Escape' && $player.parent().hasClass('page-fullscreen')) {
          $btnPageFullscreen.trigger('click');
        }
      });

      $btnSize.after($btnPageFullscreen);
    },
    uninstall: (feature, options) => {
      const $player = $('#movie_player');
      const $playerContainer = $player.parent();
      const $btnPageFullscreen = $player.find('.page-fullscreen-button');

      if ($playerContainer.hasClass('page-fullscreen')) {
        $btnPageFullscreen.trigger('click');
      }
      
      $btnPageFullscreen.remove();
    },
  },
];

// 切换功能清单项
async function toggleFeatures () {
  const options = await getOptions();

  // 切换功能清单
  featureList.forEach(feature => {
    if (feature.matches && !feature.matches.some(reg => reg.test(document.location.href))) {
      return;
    }

    const enable = feature.enable(feature, options);
    
    if (enable && !feature.installed) {
      feature.install(feature, options);
      feature.installed = true;
    } else if (!enable && feature.installed) {
      feature.uninstall(feature, options);
      feature.installed = false;
    }
  });
}

toggleFeatures();

// 选项数据改变时重启
chrome.storage.onChanged.addListener((list, sync) => {
  toggleFeatures();
});

// /**
//  * 监听右键菜单触发元素
//  */
// let contextElement = null;
// document.addEventListener("contextmenu", (e) => contextElement = e.target, true);

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request === "getContextElement") {
//       console.log(contextElement);
//       sendResponse({
//         outerHTML: contextElement.outerHTML
//       });
//     }

//     if (request === 'fullscreen') {
//       console.log(contextElement.requestFullscreen);
//       contextElement.requestFullscreen();
//     }
// });
