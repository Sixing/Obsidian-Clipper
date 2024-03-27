import { CaretRightOutlined } from "@ant-design/icons"
import {
  Button,
  Collapse,
  ConfigProvider,
  Divider,
  Flex,
  Form,
  Input,
  Switch,
  theme,
} from "antd"
import dayjs from "dayjs"
import { useEffect, useState } from "react"
import './utils/locale/index';
import { useTranslation } from "react-i18next";


function IndexPopup() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(false)
  const [form] = Form.useForm();
  const [lang, setLang] = useState(i18n.language);
  const isWindows = navigator.userAgent.includes("Windows")

  const langSwitch = () => {
    let lang = ''
    if (i18n.language === 'cn') {
      lang = 'en'
    } else {
      lang = 'cn'
    }
    setLang(lang);
    chrome.storage.sync.set({ lang })
    i18n.changeLanguage(lang);
    chrome.runtime.sendMessage({
      lang
    })
  }

  const onChange = async (enabled: boolean) => {
    setData(enabled)
    chrome.storage.sync.set({ obsidianClipperSwitch: enabled })
    sendMessage(enabled)
  }

  const sendMessage = (enabled) => {
    chrome.runtime.sendMessage({
      enabled,
      isWindows
    })
  }

  const handleSave = () => {
    const data = form.getFieldsValue()
    data.date = dayjs().format("YYYY-MM-DD HH:mm")
    chrome.storage.sync.set({ obsidianClipper: data })
  }

  const handleCut = async () => {
    let queryOptions = { active: true, currentWindow: true }
    let [tab] = await chrome.tabs.query(queryOptions);
    chrome.tabs.sendMessage(tab.id, { type: "aciton" })
  }

  const checkStatus = async () => {
    const { obsidianClipperSwitch, obsidianClipper, lang } =
      await chrome.storage.sync.get([
        "obsidianClipperSwitch",
        "obsidianClipper",
        "lang"
      ])
    setData(obsidianClipperSwitch)
    sendMessage(obsidianClipperSwitch)
    setLang(lang);
    i18n.changeLanguage(lang);
    form.setFieldsValue({
      ...obsidianClipper
    })
  }

  useEffect(() => {
    checkStatus() // 检查功能是否开启
  }, [])

  const { token } = theme.useToken()

  const getItems = (style) => [
    {
      key: "1",
      label: t('其他配置'),
      style,
      children: (
        <>
          <Form.Item
            label={t('作者')}
            name={"authorBrackets"}
            style={{ marginBottom: 12, color: "#666", fontWeight: 500 }}>
            <Input placeholder={t('输入作者')} />
          </Form.Item>
          <Form.Item
            label={t('文章标题')}
            name={"title"}
            style={{ marginBottom: 12, color: "#666", fontWeight: 500 }}>
            <Input placeholder={t('输入文章标题')} />
          </Form.Item>
          <Form.Item
            label={t('源地址')}
            name={"url"}
            style={{ marginBottom: 12, color: "#666", fontWeight: 500 }}>
            <Input placeholder={t('输入源地址')} />
          </Form.Item>
        </>
      )
    }
  ]

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none"
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#A78BFA",
          borderRadius: 4,
          screenXSMax: 480
        },
        components: {
          Form: {
            labelColor: "#666"
          }
        }
      }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "8px 4px",
          width: 300
        }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <div>{`Obsidian ${t("网页助手")}`}</div>
          <Button
            onClick={langSwitch}
            style={{
              width: 32,
              height: 32,
              padding: 8,
              border: "none",
              display: "inline-flex"
            }}>
            <div style={{ transition: "all 0.2s"}}>
              <div
                style={{
                  position: "relative",
                  width: "1.2em",
                  height: "1.2em"
                }}>
                <span
                  style={ lang === 'cn' ? {
                    left: "-5%",
                    top: 0,
                    zIndex: 1,
                    backgroundColor: "rgba(0, 0, 0, 0.88)",
                    color: "#ffffff",
                    transform: "scale(0.7)",
                    transformOrigin: "0 0",
                    position: 'absolute',
                    fontSize: '1.2em',
                    lineHeight: 1,
                    border: '1px solid rgba(0, 0, 0, 0.88)',
                  }: {
                    right: "-5%",
                    bottom: 0,
                    zIndex: 0,
                    transform: "scale(0.5)",
                    transformOrigin: "100% 100%",
                    position: 'absolute',
                    fontSize: '1.2em',
                    lineHeight: 1,
                    border: '1px solid rgba(0, 0, 0, 0.88)',
                    color: 'rgba(0, 0, 0, 0.88)',
                  }}>
                  中
                </span>
                <span
                  style={ lang === 'cn' ? {
                    right: "-5%",
                    bottom: 0,
                    zIndex: 0,
                    transform: "scale(0.5)",
                    transformOrigin: "100% 100%",
                    position: 'absolute',
                    fontSize: '1.2em',
                    lineHeight: 1,
                    border: '1px solid rgba(0, 0, 0, 0.88)',
                    color: 'rgba(0, 0, 0, 0.88)',
                  }: {
                    right: "-5%",
                    bottom: 0,
                    zIndex: 1,
                    transform: "scale(0.7)",
                    transformOrigin: "0 0",
                    position: 'absolute',
                    fontSize: '1.2em',
                    lineHeight: 1,
                    border: '1px solid rgba(0, 0, 0, 0.88)',
                    backgroundColor: 'rgba(0, 0, 0, 0.88)',
                    color: '#FFF',
                  }}>
                  En
                </span>
              </div>
            </div>
          </Button>
        </div>
        <Divider style={{ margin: "8px 0" }} />
        <Flex gap="middle" vertical>
          <Flex align="center" gap="middle" style={{ marginBottom: 8 }}>
            <Switch value={data} size="small" onChange={onChange} />
            {t('开启网页剪切')}
          </Flex>
        </Flex>
        <Divider orientation="left" plain>
          {t('导入配置')}
        </Divider>
        <Form
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 4 }}
          form={form}
          layout="horizontal"
          style={{ maxWidth: 300 }}
          size="small">
          <Form.Item
            label={t('仓库/文件夹')}
            name={"category"}
            tooltip={t('仓库说明')}
            style={{ marginBottom: 12, color: "#666", fontWeight: 500 }}>
            <Input placeholder={t('输入分类')} />
          </Form.Item>
          <Form.Item
            label={t('主题')}
            name={"theme"}
            style={{ marginBottom: 12, color: "#666", fontWeight: 500 }}>
            <Input placeholder={t('输入主题')} />
          </Form.Item>
          <Form.Item
            label={t('标签')}
            name={"tag"}
            style={{ marginBottom: 12, color: "#666", fontWeight: 500 }}>
            <Input placeholder={t('输入标签')} />
          </Form.Item>
          <Collapse
            items={getItems(panelStyle)}
            bordered={false}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
            style={{ background: token.colorBgContainer }}></Collapse>
          <Form.Item>
            <Button type="primary" onClick={handleSave}>
              {t('保存')}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              type="primary"
              onClick={handleCut}>
              {t('剪裁网页内容')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </ConfigProvider>
  )
}

export default IndexPopup
