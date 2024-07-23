<h1 align="center">🤖 Summarizer</h1>

<p align="center">An AI Web Page Summarization Extension</p>

EN / [简体中文](README_ZH_CN.md)

## Introduction

It's a webpage text content AI summary extension based on [Material Design 3](https://m3.material.io/) UI style. Currently only supports Chrome browser (version >= 116) and Google Gemini Flash model. For the available regions of Gemini API Key, please see https://ai.google.dev/gemini-api/docs/available-regions.

## Install

1. Download the extension zip package from the [Release page](https://github.com/WJ-Yuan/summarizer/releases) and unzip it
2. Open your Chrome [browser extension page](chrome://extensions/)
3. Enable developer mode
4. Click **Load unpacked**
5. Select the `extension` folder, and then you can see it on the extension page

## Usage

1. First fill in your `Gemini API Key` on the plugin settings page (for how to apply for a Gemini API Key, please see https://ai.google.dev/gemini-api/docs/api-key)
2. Then you can trigger the summary of the full text of the web page or the selected web page content in the following three ways:
   - Click the extension icon in the upper right corner of the browser
   - `Ctrl+Shift+S` (Mac users are `Cmd+Shift+S`)
   - Click the right-click menu `Generate content summary`

## Customization

This extension allows customization

1. Theme color
2. Global AI summary prompt
3. Sensitive information that needs to be replaced
4. Extension forbidden URL (Regular expression supported)
5. Webpage Content acquisition function (see [Advanced Settings](https://github.com/WJ-Yuan/summarizer/wiki/Advanced-Settings-%E9%AB%98%E7%BA%A7%E8%AE%BE%E7%BD%AE#en) for details)

## Feedback

If you have any questions, you can report them [here](https://github.com/WJ-Yuan/summarizer/issues/new?assignees=WJ-Yuan&labels=bug&projects=&template=bug_report.md&title=%5BBUG%5D)

## Special Thanks

- This project is based on the [louisremi/vite-react-extension](https://github.com/louisremi/vite-react-extension) template, which is a React fork of [antfu-collective/vitesse-webext](https://github.com/antfu-collective/vitesse-webext)

- Some CSS files in this project refer to [zdhxiong/mdui](https://github.com/zdhxiong/mdui)

## License

[MIT](https://github.com/WJ-Yuan/summarizer?tab=MIT-1-ov-file#readme)
