import React from 'react';
import _ from 'lodash';
import {
  Form,
  Input,
  Switch,
  Layout,
  Typography,
  Button,
  Space,
  Collapse,
  message,
} from 'antd';
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import Icon, {
  SaveOutlined,
  SyncOutlined,
  SettingOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { useOptions, saveOptions, restoreOptions } from '../common';
import { ReactComponent as DragSvg } from '../assets/icons/drag.svg';
import './Options.scss';

// 拖拽排序图标组件
const DragHandle = sortableHandle(() => (
  <Icon
    className="btn-sort-handle"
    title="排序"
    component={DragSvg}
  />
));

// 拖动排序列表项组件
const SortableItem = sortableElement(({field, remove, ...restProps}) => (
  <tr key={field.key} {...restProps}>
    <td>
      <Form.Item
        noStyle
        name={[field.name, 'name']}
        fieldKey={[field.fieldKey, 'name']}
      >
        <Input placeholder="请输入搜索引擎名称" />
      </Form.Item>
    </td>
    <td>
      <Form.Item
        noStyle
        name={[field.name, 'url']}
        fieldKey={[field.fieldKey, 'url']}
      >
        <Input type="url" placeholder="请输入搜索引擎地址" />
      </Form.Item>
    </td>
    <td>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => _.get(prevValues, `search.searchEngines[${field.key}].icon`) !== _.get(currentValues, `search.searchEngines[${field.key}].icon`)}
      >
        {({getFieldValue}) => (
          <Form.Item
            noStyle
            name={[field.name, 'icon']}
            fieldKey={[field.fieldKey, 'icon']}
          >
            <Input
              type="url"
              placeholder="请输入搜索引擎图标地址"
              style={{backgroundImage: `url(${getFieldValue(['search', 'searchEngines', field.key, 'icon'])})`}}
            />
          </Form.Item>
        )}
      </Form.Item>
    </td>
    <td>
      <Form.Item
        noStyle
        name={[field.name, 'enableMultipleSeach']}
        fieldKey={[field.fieldKey, 'enableMultipleSeach']}
        valuePropName="checked"
        initialValue={true}
      >
        <Switch checkedChildren="启用" unCheckedChildren="禁用" />
      </Form.Item>
    </td>
    <td>
      <Form.Item
        noStyle
        name={[field.name, 'showInContextMenu']}
        fieldKey={[field.fieldKey, 'showInContextMenu']}
        valuePropName="checked"
        initialValue={true}
      >
        <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
      </Form.Item>
    </td>
    <td>
      <MinusCircleOutlined
        className="btn-delete-field"
        title="删除"
        onClick={() => remove(field.name)}
      />

      <DragHandle />
    </td>
  </tr>
));

// 拖动排序容器组件
const SortableContainer = sortableContainer(({children, ...restProps}) => (
  <tbody {...restProps}>
    {children}
  </tbody>
));

export default function Options () {
  const [form] = Form.useForm();
  const options = useOptions();
  
  // 保存设置
  const handleSaveOptions = async (values) => {
    await saveOptions(values);
    message.success('保存成功');
  }

  // 恢复默认设置
  const handleRestoreOptions = async () => {
    const options = await restoreOptions();
    form.setFieldsValue(_.cloneDeep(options));
    message.success('已恢复默认设置');
  }

  // 对搜索引擎列表进行排序
  const handleSortEnd = ({oldIndex, newIndex}) => {
    const options = _.cloneDeep(form.getFieldsValue());
    options.search.searchEngines = arrayMove(options.search.searchEngines, oldIndex, newIndex);
    form.setFieldsValue(options);
  }

  if (_.isEmpty(options)) {
    return null;
  }

  return (
    <Form
      className="options"
      name="optionsForm"
      form={form}
      initialValues={options}
      onFinish={handleSaveOptions}
      autoComplete="off"
      labelCol={{ span: 5 }}
      labelAlign="left"
      wrapperCol={{ span: 4 }}
    >
      <Layout className="options-layout">
        <Layout.Header className="options-header">
          <Typography.Title className="options-title">
            🛠 Flyer Tools Options
          </Typography.Title>
          <Space size="middle">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
            >
              保存设置
            </Button>
            <Button
              type="primary"
              danger
              icon={<SyncOutlined />}
              onClick={handleRestoreOptions}
            >
              恢复默认设置
            </Button>
          </Space>
        </Layout.Header>
  
        <Layout.Content className="options-content">
          <Collapse defaultActiveKey={['search', 'translate', 'youtube']}>
            <Collapse.Panel header="搜索设置" key="search" extra={<SettingOutlined />}>
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

              <Typography.Title level={4}>
                搜索引擎列表
              </Typography.Title>

              <Form.List name={['search', 'searchEngines']}>
                {(fields, { add, remove }) => {
                  return (
                    <React.Fragment>
                      <table id="search-engines-table" className="dynamic-fields-table">
                        <thead>
                          <tr>
                            <th>名称</th>
                            <th>地址</th>
                            <th>图标</th>
                            <th>多重搜索</th>
                            <th>右键菜单</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <SortableContainer
                          useDragHandle
                          lockAxis="y"
                          onSortEnd={handleSortEnd}
                          helperClass="row-dragging"
                          helperContainer={() => document.querySelector('#search-engines-table')}
                        >
                          {fields.map((field, index) => {
                            return (
                              <SortableItem
                                key={field.key}
                                field={field}
                                index={index}
                                remove={remove}
                              />
                            );
                          })}
                        </SortableContainer>
                      </table>

                      <div className="btn-add-field-row">
                        <Button icon={<PlusCircleOutlined />} onClick={() => add()}>
                          新增搜索引擎
                        </Button>
                      </div>
                    </React.Fragment>
                  );
                }}
              </Form.List>
            </Collapse.Panel>

            <Collapse.Panel header="翻译设置" key="translate" extra={<SettingOutlined />}>
              <Form.Item
                name={['translate', 'noTranslateCode']}
                label="谷歌翻译网页时禁止翻译代码展示元素"
                valuePropName="checked"
              >
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Collapse.Panel>

            <Collapse.Panel header="YouTube 设置" key="youtube" extra={<SettingOutlined />}>
              <Form.Item
                name={['youtube', 'enablePlayerPageFullscreen']}
                label="添加视频播放器网页全屏功能"
                valuePropName="checked"
              >
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Collapse.Panel>
          </Collapse>
        </Layout.Content>
      </Layout>
    </Form>
  );
};