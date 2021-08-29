import React from 'react';
import _ from 'lodash';
import {
  Form,
  Button,
  Switch,
  Divider,
} from 'antd';
import {
  SettingOutlined,
} from '@ant-design/icons';
import { useOptions, saveOptions } from '../common';
import './Popup.scss';

export default function Popup () {
  const options = useOptions();
  
  // 保存设置
  const handleSaveOptions = async (changedValues, allValues) => {
    await saveOptions(allValues);
  }

  if (_.isEmpty(options)) {
    return null;
  }

  return (
    <div className="popup">
      <div className="popup-header">
        <h1>🛠 Flyer Tools</h1>
      </div>

      <div className="popup-content">
        <Form
          name="popupForm"
          initialValues={options}
          onValuesChange={handleSaveOptions}
          autoComplete="off"
        >
          <Form.Item
            name={['search', 'enableMultipleSeach']}
            label="开启多重搜索"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            name={['search', 'searchInNewTab']}
            label="在新标签页中打开搜索"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            name={['search', 'searchInNewWindow']}
            label="在新窗口中打开搜索标签页"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            name={['search', 'searchInBackgroundTab']}
            label="在后台标签中打开搜索"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            name={['search', 'searchTabInLastPosition']}
            label="在最后一个标签页后打开搜索标签页"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Divider />

          <Form.Item
            name={['translate', 'noTranslateCode']}
            label="谷歌翻译网页时禁止翻译代码展示元素"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Divider />

          <Form.Item
            name={['youtube', 'enablePlayerPageFullscreen']}
            label="添加YouTube视频播放器网页全屏功能"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </div>

      <div className="popup-footer">
        <Button
          icon={<SettingOutlined />}
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          更多选项
        </Button>
      </div>
    </div>
  );
}
