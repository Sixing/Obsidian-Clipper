// i18n.js
import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import cn from "./cn.json"
import en from "./en.json"

const resources = {
  en: {
    translation: en
  },
  cn: {
    translation: cn
  }
}

i18n
  .use(initReactI18next) // 注册
  .init({
    resources,
    lng: "cn", // 默认语言
    interpolation: {
      escapeValue: false // xss安全开关
    }
  })

export default i18n
