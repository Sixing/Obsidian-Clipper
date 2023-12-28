import { useEffect, useState } from "react"
import { ConfigProvider, Flex, Switch, Divider, Form, Input, Button} from "antd";

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
          <Divider orientation="left" plain>{'自定义配置'}</Divider>
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
                <Input placeholder="输入主体" />
              </Form.Item>
              <Form.Item label="标签" name={'tag'} style={{marginBottom: 12, color: '#666', fontWeight: 500}}>
                <Input placeholder="输入标签" />
              </Form.Item>
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
