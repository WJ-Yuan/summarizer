<h1 align="center">🤖 Summarizer</h1>

<p align="center">一个浏览器 AI 网页总结扩展</p>

[EN](./README.md) / 简体中文

## 简介

一个基于 [Material Design 3](https://m3.material.io/) UI 风格的网页文本内容 AI 总结插件。目前仅支持 Chrome 浏览器（版本 >= 116）和 Google Gemini Flash 模型。关于 Gemini API Key 的可用地区请见 https://ai.google.dev/gemini-api/docs/available-regions。

## 安装

1. 在 [Release 页面](https://github.com/WJ-Yuan/summarizer/releases)下载插件压缩包并解压
2. 打开您的Chrome [浏览器扩展页面](chrome://extensions/)
3. 开启开发者模式
4. 点击**加载已解压的扩展程序**
5. 选择 `extension` 文件夹，然后您就可以在扩展页面看到它了

## 用法

1. 首先在插件设置页面填写您的 `Gemini API Key`（关于如何申请 Gemini API Key 请见 https://ai.google.dev/gemini-api/docs/api-key）
2. 然后您就可以通过以下三种方式触发对网页全文或者选中的网页内容的总结：
   - 点击浏览器右上角插件图标
   - `Ctrl+Shift+S`(Mac 用户是 `Cmd+Shift+S`)
   - 点击右键菜单`生成内容总结`

## 自定义

本插件允许自定义

1. 主题颜色
2. 全局 AI 总结提示词
3. 需要被替换的敏感信息
4. 插件禁用网址（支持正则）
5. 网页内容获取函数（详见[高级设置](https://github.com/WJ-Yuan/summarizer/wiki/Advanced-Settings-%E9%AB%98%E7%BA%A7%E8%AE%BE%E7%BD%AE#zh-cn)）

## 反馈

如果您有任何问题可以在[这里](https://github.com/WJ-Yuan/summarizer/issues/new?assignees=WJ-Yuan&labels=bug&projects=&template=%E9%97%AE%E9%A2%98%E5%8F%8D%E9%A6%88.md&title=%5BBUG%5D)反馈

## 特别感谢

- 这个项目基于 [louisremi/vite-react-extension](https://github.com/louisremi/vite-react-extension) 模板，它是 [antfu-collective/vitesse-webext](https://github.com/antfu-collective/vitesse-webext) 的 React 修改版本

- 这个项目中的部分 CSS 文件参考了 [zdhxiong/mdui](https://github.com/zdhxiong/mdui)

## 开源协议

[MIT](https://github.com/WJ-Yuan/summarizer?tab=MIT-1-ov-file#readme)
