import browser from "webextension-polyfill"

export const $t = browser.i18n.getMessage

export const $notification = (message: string) =>
  browser.notifications.create({
    title: "Summarizer",
    iconUrl: "/assets/icon-128.png",
    type: "basic",
    message
  })

export const checkOptionsExist = async (key: string) => {
  const storage = await browser.storage.local.get({
    [key]: ""
  })

  return storage[key]
}

export const sendMessage = browser.runtime.sendMessage

export const sendTabMessage = browser.tabs.sendMessage
