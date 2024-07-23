import browser, { type Runtime, type Tabs } from "webextension-polyfill"
import { isFirefox } from "~/env"
import { MESSAGE_EVENT, MESSAGE_SOURCE } from "~/shared/constants"
import { $t } from "~/shared/utils"

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import("/@vite/client") // load latest content script
  // import("./contentScriptHMR")
}

let isSpeakingTabSet: Set<number> = new Set()
let openedPanelTabSet: Set<number> = new Set()

const openSidePanel = async (tab: Tabs.Tab) => {
  const id = tab.id!

  if (openedPanelTabSet.has(id)) {
    browser.runtime.sendMessage({
      source: MESSAGE_SOURCE.BACKGROUND,
      type: MESSAGE_EVENT.CREATE_SUMMARY,
      value: "",
      tabId: id
    })
    return
  }

  chrome.sidePanel.open({
    tabId: tab.id!
  })
}

const closePanelEffect = (tabId: number) => {
  openedPanelTabSet.delete(tabId)
  if (isSpeakingTabSet.has(tabId)) {
    chrome.tts.stop()
    isSpeakingTabSet.delete(tabId)
  }
}

const registerActionClickListener = () => {
  browser.action.onClicked.addListener(async () => {
    const [tab] = await browser.tabs.query({
      active: true,
      lastFocusedWindow: true
    })

    chrome.sidePanel.open({
      tabId: tab.id!
    })
  })
}

const registerContextMenuListener = () => {
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    switch (info.menuItemId) {
      case MESSAGE_EVENT.SUMMARIZE_CONTEXT: {
        openSidePanel(tab!)
        break
      }
      default: {
        break
      }
    }
  })
}

const registerTabListener = () => {
  browser.tabs.onCreated.addListener(async (tab) => {
    if (isFirefox) {
      return
    }

    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: "/dist/sidepanel/index.html",
      enabled: true
    })
  })

  browser.tabs.onUpdated.addListener(async (tabId) => {
    if (isFirefox) {
      return
    }

    if (!openedPanelTabSet.has(tabId)) {
      await chrome.sidePanel.setOptions({
        tabId,
        path: "/dist/sidepanel/index.html",
        enabled: true
      })
    }
  })

  browser.tabs.onRemoved.addListener((tabId) => {
    closePanelEffect(tabId)
  })
}

function forceReconnect(port: Runtime.Port & { _timer?: NodeJS.Timeout }) {
  if (port._timer) {
    clearTimeout(port._timer)
    delete port._timer
  }
  port.disconnect()
}

const registerMessageListener = () => {
  browser.runtime.onConnect.addListener(
    (port: Runtime.Port & { _timer?: NodeJS.Timeout }) => {
      if (port.name.includes(MESSAGE_SOURCE.SIDEPANEL)) {
        port.onMessage.addListener((message, port) => {
          const tabId = message.tabId
          switch (message.type) {
            case MESSAGE_EVENT.PANEL_MOUNT: {
              openedPanelTabSet.add(tabId)
              return true
            }

            default: {
              return true
            }
          }
        })

        // FIXME: seems won't trigger it when disconnect by sw
        port.onDisconnect.addListener(async (p) => {
          if (p.name.includes(MESSAGE_SOURCE.SIDEPANEL)) {
            const tabId = Number(
              p.name.replace(MESSAGE_SOURCE.SIDEPANEL + "-", "")
            )
            closePanelEffect(tabId)
          }
          port._timer && clearTimeout(port._timer)
        })
        port._timer = setTimeout(forceReconnect, 250e3, port)
      }
    }
  )

  browser.runtime.onMessage.addListener((message) => {
    const source = message.source

    if (source !== MESSAGE_SOURCE.SIDEPANEL) {
      return true
    }

    const type = message.type
    const tabId = message.tabId

    switch (type) {
      case MESSAGE_EVENT.START_TTS: {
        isSpeakingTabSet.add(tabId)
        return true
      }
      case MESSAGE_EVENT.STOP_TTS: {
        if (isSpeakingTabSet.has(tabId)) {
          isSpeakingTabSet.delete(tabId)
          message.value && chrome.tts.stop()
        }
        return true
      }
      default: {
        return true
      }
    }
  })
}

const main = async () => {
  registerMessageListener()
  registerContextMenuListener()
  registerActionClickListener()
  registerTabListener()
}

const registerOnInstallListener = () => {
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: MESSAGE_EVENT.SUMMARIZE_CONTEXT,
      title: $t("extension_action_title"),
      contexts: ["page", "selection"]
    })

    if (isFirefox) {
      return
    } // only in chrome
    chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: true
    })
  })
}

registerOnInstallListener()
main()
