import type { Chat, Tab } from "Common"
import { useEffect, useRef, useState } from "react"
import browser from "webextension-polyfill"
import "highlight.js/scss/a11y-light.scss"
import { $snackbar } from "~/components/Proxy"
import { useMemoizedFn } from "~/hooks"
import {
  ChatRole,
  ChatStatus,
  EXTENSION_ERROR,
  MESSAGE_EVENT,
  MESSAGE_SOURCE,
  StorageKey,
  TabStatus
} from "~/shared/constants"
import {
  $notification,
  $t,
  checkOptionsExist,
  filterSensitiveInfo,
  getMarkdown,
  isForbiddenUrl
} from "~/shared/utils"
import Message from "./components/Message"
import Nav from "./components/Nav"
import { useGemini } from "./hooks"
import Welcome from "./Welcome"

enum PageType {
  Welcome = "welcome",
  Answer = "answer"
}

const SidePanel = () => {
  const tab = useRef<Tab>()
  const [history, setHistory] = useState<Chat[]>([])
  const [pageType, setPageType] = useState<PageType>(PageType.Welcome)
  const [isSuspendVisible, setIsSuspendVisible] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController>()
  const [generateGeminiResponse] = useGemini(setIsSuspendVisible, setHistory)

  const checkCanCreateChat = async () => {
    if (tab.current?.status !== TabStatus.Complete) {
      return false
    } else if (!checkOptionsExist(StorageKey.GeminiAPIKey)) {
      $notification($t("notification_error_api_key_missing"))
      return false
    } else if (await isForbiddenUrl(tab.current.url || "")) {
      $snackbar($t("error_summary_in_forbidden_url"))
      return false
    } else if (
      history.length &&
      history.some(
        (chat) =>
          chat.status !== ChatStatus.Done && chat.status !== ChatStatus.Suspend
      )
    ) {
      $snackbar($t("error_summary_unfinished_chatting"))
      return false
    } else if (!tab.current.url) {
      return false
    } else {
      return true
    }
  }

  const getSummary = async () => {
    if (!(await checkCanCreateChat())) {
      return
    }
    const markdown = await getMarkdown(tab.current!)
    if (!markdown || !markdown.trim().length) {
      $snackbar($t("error_empty_webpage_content"))
      return
    }
    const content = await filterSensitiveInfo(markdown.trim())
    await fetchAIText(ChatRole.Summary, content)
  }

  const fetchAIText = async (role: ChatRole, content: string) => {
    try {
      setPageType(PageType.Answer)
      setHistory((prev) => [
        ...prev,
        {
          role,
          content: content,
          status: ChatStatus.Done
        },
        {
          role: ChatRole.AI,
          content: "",
          status: ChatStatus.Loading
        }
      ])

      abortControllerRef.current = new AbortController()
      setIsSuspendVisible(true)
      await generateGeminiResponse(
        role,
        content,
        abortControllerRef.current.signal
      )
    } catch (e) {
      switch ((e as any).message) {
        case EXTENSION_ERROR.API_KEY_MISSING: {
          setPageType(PageType.Welcome)
          setHistory([])
          $notification($t("notification_error_api_key_missing"))
          break
        }
        case EXTENSION_ERROR.UNKNOWN_ERROR: {
          $snackbar($t("error_unknown_error"))
          break
        }
        default: {
          break
        }
      }

      abortControllerRef.current && abortControllerRef.current.abort()
      setIsSuspendVisible(false)
      setHistory((prev) => {
        if (!prev || !prev.length) {
          return []
        }
        const last = prev[prev.length - 1]
        const before = prev
          .slice(0, prev.length - 1)
          .map((item) => ({ ...item, status: ChatStatus.Done }))
        return [
          ...before,
          {
            role: ChatRole.AI,
            content: last.content,
            status: ChatStatus.Suspend
          }
        ]
      })
    } finally {
      abortControllerRef.current = undefined
    }
  }

  const messageListener = useMemoizedFn(async (message, _, sendResponse) => {
    if (message.tabId !== tab.current?.id) {
      return
    }
    switch (message.source) {
      case MESSAGE_SOURCE.BACKGROUND: {
        switch (message.type) {
          case MESSAGE_EVENT.CREATE_SUMMARY: {
            await getSummary()
            sendResponse()
            break
          }
          default: {
            sendResponse()
            break
          }
        }
        break
      }

      default: {
        sendResponse()
        break
      }
    }
  })

  const tabUpdateListener = useMemoizedFn(async (id, _, _tab) => {
    if (id === tab.current?.id) {
      tab.current = {
        id,
        status: _tab.status,
        url: _tab.url,
        title: _tab.url,
        favIconUrl: _tab.favIconUrl
      }
      if (_tab.status != TabStatus.Complete) {
        abortControllerRef.current && abortControllerRef.current.abort()
        setHistory([])
        setPageType(PageType.Welcome)
      }
    }
  })

  useEffect(() => {
    const queryTabId = async () => {
      const [_tab] = await browser.tabs.query({
        active: true,
        currentWindow: true
      })
      const tabId = _tab.id

      if (!tabId) {
        return
      }
      const newTab = {
        url: _tab.url,
        title: _tab.title,
        favIconUrl: _tab.favIconUrl,
        id: tabId,
        status: _tab.status as TabStatus
      }
      tab.current = newTab

      browser.tabs.onUpdated.addListener(tabUpdateListener)
      browser.runtime.onMessage.addListener(messageListener)

      // FIXME:
      // NOTE: https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
      let port
      const keepAlive = () => {
        port = browser.runtime.connect({
          name: `${MESSAGE_SOURCE.SIDEPANEL}-${tabId}`
        })
        port.postMessage({
          source: MESSAGE_SOURCE.SIDEPANEL,
          type: MESSAGE_EVENT.PANEL_MOUNT,
          tabId,
          value: ""
        })
        port.onDisconnect.addListener(keepAlive)
      }
      keepAlive()

      if (_tab.status === TabStatus.Complete) {
        await getSummary()
      }
    }

    queryTabId()

    return () => {
      abortControllerRef.current && abortControllerRef.current.abort()
      browser.tabs.onUpdated.removeListener(tabUpdateListener)
      browser.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  const onRegenerate = async (index: number) => {
    const chat = history[index - 1]
    if (!(await checkCanCreateChat())) {
      return
    }
    await fetchAIText(chat.role, chat.content)
  }

  const onSuspend = () => {
    abortControllerRef.current && abortControllerRef.current.abort()
  }

  return (
    <>
      {pageType === PageType.Welcome ? (
        <Welcome onClick={getSummary} />
      ) : (
        <main className="body chat">
          {history.map((chat, index) => {
            return (
              <section className="message" key={index}>
                <Message
                  index={index}
                  chat={chat}
                  onRegenerate={onRegenerate}
                />
              </section>
            )
          })}
        </main>
      )}

      <Nav isSuspendVisible={isSuspendVisible} onSuspend={onSuspend} />
    </>
  )
}

export default SidePanel
