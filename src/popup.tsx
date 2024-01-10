import { useEffect, useState } from "react"
import { ConfigProvider, Flex, Switch, Divider, Form, Input, Button, DatePicker, Collapse, theme} from "antd";
import { CaretRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

function IndexPopup() {
  const [data, setData] = useState(false);
  const [form] = Form.useForm();

  const onChange = async (enabled: boolean) => {
    setData(enabled);
    chrome.storage.sync.set({'obsidianClipperSwitch': enabled});
    sendMessage(enabled);
  }

  const sendMessage = (enabled) => {
    chrome.runtime.sendMessage({
      enabled
    })
  }

  const handleSave = () => {
    const data =form.getFieldsValue();
    data.date = dayjs().format('YYYY-MM-DD HH:mm')
    chrome.storage.sync.set({'obsidianClipper': data});
  }

  const handleCut = async () => {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    chrome.tabs.sendMessage(tab.id, {type: 'aciton'});
  }

  const checkStatus = async () => {
    const { obsidianClipperSwitch, obsidianClipper } = await chrome.storage.sync.get(['obsidianClipperSwitch', 'obsidianClipper']);
    setData(obsidianClipperSwitch);
    sendMessage(obsidianClipperSwitch);
    form.setFieldsValue({
      ...obsidianClipper
    });
  }

  useEffect(() => {
    checkStatus() // 检查功能是否开启
  }, [])

  const { token } = theme.useToken();

  const getItems = (style) => [{
    key: '1',
    label: '其他配置',
    style,
    children: <>
      <Form.Item label="作者" name={'authorBrackets'} style={{marginBottom: 12, color: '#666', fontWeight: 500}}>
        <Input placeholder="输入作者" />
      </Form.Item>
      <Form.Item label="文章标题" name={'title'} style={{marginBottom: 12, color: '#666', fontWeight: 500}}>
        <Input placeholder="输入文章标题" />
      </Form.Item>
      <Form.Item label="源地址" name={'url'} style={{marginBottom: 12, color: '#666', fontWeight: 500}}>
        <Input placeholder="输入源地址" />
      </Form.Item>
      {/* <Form.Item label="创建日" name={'date'} style={{marginBottom: 12, color: '#666', fontWeight: 500}}>
        <DatePicker defaultValue={dayjs(undefined, dateFormat)} format={dateFormat} />
      </Form.Item> */}
    </>
  }];

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  return (
    <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#A78BFA',
        borderRadius: 4,
        screenXSMax: 480,
      },
      components: {
        Form: {
          labelColor: '#666',
        }
      }
    }}
  >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: '8px 4px',
          width: 300,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{`Obsidian 网页助手`}</div>
          <Divider style={{margin: "8px 0"}} />
          <Flex gap="middle" vertical>
            <Flex align="center" gap='middle' style={{marginBottom: 8}}>
              <Switch
                value={data}
                size="small"
                onChange={onChange}
              />
              { `开启网页剪切` }
            </Flex>
          </Flex>
          <Divider orientation="left" plain>{'导入配置'}</Divider>
          <Form
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 4 }}
            form={form}
            layout='horizontal'
            style={{ maxWidth: 300}}
            size="small"
          >
              <Form.Item label="分类" name={'category'} style={{marginBottom: 12, color: '#666', fontWeight: 500}}>
                <Input placeholder="输入分类" />
              </Form.Item>
              <Form.Item label="主题" name={'theme'} style={{marginBottom: 12, color: '#666', fontWeight: 500}}>
                <Input placeholder="输入主题" />
              </Form.Item>
              <Form.Item label="标签" name={'tag'} style={{marginBottom: 12, color: '#666', fontWeight: 500}}>
                <Input placeholder="输入标签" />
              </Form.Item>
              <Collapse items={getItems(panelStyle)} bordered={false} expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />} style={{ background: token.colorBgContainer }}>
              </Collapse>
              <Form.Item>
                <Button type="primary" onClick={handleSave}>保存</Button>
                <Button style={{ marginLeft: 8}} type="primary" onClick={handleCut}>剪裁网页内容</Button>
              </Form.Item>
          </Form>
      </div>
    </ConfigProvider>
  )
}

export default IndexPopup
