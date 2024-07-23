import type { MdIconButton } from "@material/web/iconbutton/icon-button"
import ClipboardJS from "clipboard"
import { useEffect, useRef, useState } from "react"
import { tabs } from "webextension-polyfill"
import { Icon, IconButton, Menu, MenuItem } from "~/components/Proxy"
import { MESSAGE_EVENT, MESSAGE_SOURCE } from "~/shared/constants"
import {
  $t,
  download,
  generateCanvasImage,
  generateText,
  sendMessage
} from "~/shared/utils"

interface ActionProps {
  onRegenerate: (...args: unknown[]) => any
  content: string
  index: number
}

enum CopyStatus {
  UnCopy,
  Success,
  Error
}

enum DownloadType {
  PNG = "png",
  TXT = "txt",
  MARKDOWN = "md"
}

const DOWNLOAD_MENU: DownloadType[] = [
  DownloadType.PNG,
  DownloadType.TXT,
  DownloadType.MARKDOWN
]

const ImageMap: Record<DownloadType, string> = {
  [DownloadType.PNG]: "image",
  [DownloadType.TXT]: "description",
  [DownloadType.MARKDOWN]: "markdown"
}

const MessageAction = ({ onRegenerate, content, index }: ActionProps) => {
  const copyButtonRef = useRef<MdIconButton>(null)
  const [copyStatus, setCopyState] = useState<CopyStatus>(CopyStatus.UnCopy)
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    const clipboard = new ClipboardJS(copyButtonRef.current!, {
      text: (trigger) => trigger.getAttribute("data-clipboard-text") || ""
    })

    clipboard.on("success", function (e) {
      setCopyState(CopyStatus.Success)
      setTimeout(() => {
        setCopyState(CopyStatus.UnCopy)
      }, 500)
    })

    clipboard.on("error", function (e) {
      setCopyState(CopyStatus.Error)
      setTimeout(() => {
        setCopyState(CopyStatus.UnCopy)
      }, 500)
    })

    return () => {
      clipboard.destroy()
      chrome.tabs.query(
        {
          lastFocusedWindow: true,
          active: true
        },
        ([tab]) => {
          const tabId = tab.id
          sendMessage({
            source: MESSAGE_SOURCE.SIDEPANEL,
            type: MESSAGE_EVENT.STOP_TTS,
            tabId,
            value: true
          })
        }
      )
    }
  }, [])

  const onStartSpeak = async () => {
    const [tab] = await tabs.query({ lastFocusedWindow: true, active: true })
    const tabId = tab.id

    if (isSpeaking) {
      setIsSpeaking(false)
      chrome.tts.stop()
      sendMessage({
        source: MESSAGE_SOURCE.SIDEPANEL,
        type: MESSAGE_EVENT.STOP_TTS,
        tabId,
        value: false
      })
      return
    }

    const chats = document.querySelector(".chat")!
    const answerEl = chats.children[index].children[0] as HTMLElement // only in Chrome
    chrome.tts.speak(answerEl.innerText, {
      onEvent: (event) => {
        switch (event.type) {
          case "start": {
            setIsSpeaking(true)
            sendMessage({
              source: MESSAGE_SOURCE.SIDEPANEL,
              type: MESSAGE_EVENT.START_TTS,
              tabId,
              value: ""
            })
            break
          }
          case "end":
          case "cancelled":
          case "error":
          case "interrupted": {
            sendMessage({
              source: MESSAGE_SOURCE.SIDEPANEL,
              type: MESSAGE_EVENT.STOP_TTS,
              tabId,
              value: false
            })
            setIsSpeaking(false)
            break
          }
        }
      }
    })
  }

  const onToggleDownloadMenu = () => {
    setDownloadMenuOpen((prev) => !prev)
  }

  const drawFooter = async (bg: string, maxWidth: number) => {
    const [tab] = await tabs.query({
      active: true,
      lastFocusedWindow: true
    })

    if (!tab || !tab.url) {
      return
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    const url = new URL(tab.url).host.trim()
    const icoUrl = tab.favIconUrl || ""

    const ICON_SIZE = 28
    const BORDER = 4
    const BORDER_RADIUS = 4
    const FONT_SIZE = 16
    const GAP = 8

    const icoBgSize = ICON_SIZE + BORDER * 2
    const height = icoBgSize * 2
    const width = Math.max(maxWidth, icoBgSize)

    canvas.height = height
    canvas.width = width

    // draw bg
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)

    // draw icon
    // 2.1 load img
    const iconImg = new Image()
    iconImg.crossOrigin = "Anonymous"
    iconImg.src = icoUrl
    iconImg.onerror = () => {
      iconImg.src = "/assets/icon-128.png"
    }
    await new Promise((resolve) => {
      iconImg.onload = resolve
    })
    // 2.2 draw icon_bg
    ctx.beginPath()
    ctx.fillStyle = "#fff"
    ctx.roundRect(
      width > icoBgSize ? width - icoBgSize : 0,
      0,
      icoBgSize,
      icoBgSize,
      BORDER_RADIUS
    )
    ctx.fill()
    // 2.3 draw icon
    ctx.drawImage(
      iconImg,
      width > icoBgSize ? width - ICON_SIZE - BORDER : BORDER,
      BORDER,
      ICON_SIZE,
      ICON_SIZE
    )

    // draw host
    ctx.fillStyle = "#fff"
    ctx.font = `${FONT_SIZE}px sans-serif`
    let displayUrl = url
    const textWidth = ctx.measureText(url).width
    if (textWidth > maxWidth) {
      let truncated = false
      while (ctx.measureText(displayUrl + "...").width > maxWidth) {
        displayUrl = displayUrl.slice(0, -1)
        truncated = true
      }
      if (truncated) {
        displayUrl += "..."
      }
    }
    const displayWidth = ctx.measureText(displayUrl).width
    ctx.fillText(
      displayUrl,
      width > icoBgSize ? maxWidth - displayWidth : icoBgSize - displayWidth,
      icoBgSize + FONT_SIZE + GAP,
      displayWidth
    )

    return canvas
  }

  const onSelectDownloadType = async (type: DownloadType) => {
    const chats = document.querySelector(".chat")!
    const questionEl = chats.children[index - 1] as HTMLElement
    const answerEl = chats.children[index] as HTMLElement
    let url: string = ""
    switch (type) {
      case DownloadType.TXT: {
        url = generateText(
          "txt",
          (answerEl.children[0] as HTMLElement).innerText
        )
        break
      }
      case DownloadType.MARKDOWN: {
        url = generateText("markdown", content)
        break
      }
      case DownloadType.PNG: {
        const bgColor = document.body.style.getPropertyValue(
          "--md-sys-color-background"
        )
        const footerBg = document.body.style.getPropertyValue(
          "--md-sys-color-primary"
        )

        const questionCanvas = await generateCanvasImage(questionEl, bgColor, {
          foreignObjectRendering: false
        })
        const answerCanvas = await generateCanvasImage(answerEl, bgColor, {
          foreignObjectRendering: false
        })

        if (questionCanvas && answerCanvas) {
          const qW = questionCanvas.width
          const aW = answerCanvas.width
          const footerCanvas = await drawFooter(footerBg, Math.max(qW, aW))

          if (!footerCanvas) {
            return
          }

          const H_GAP = 24
          const V_GAP = 32
          const CANVAS_V_GAP = 30
          const MORE_BOTTOM = 10

          const fW = footerCanvas.width
          const qH = questionCanvas.height
          const aH = answerCanvas.height
          const fH = footerCanvas.height

          const width = Math.max(qW, aW, fW) + H_GAP * 2
          const height = qH + aH + fH + V_GAP * 2 + CANVAS_V_GAP * 2

          const combinedCanvas = document.createElement("canvas")
          const ctx = combinedCanvas.getContext("2d")!
          combinedCanvas.width = width
          combinedCanvas.height = height

          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, width, qH + aH + V_GAP * 2 + CANVAS_V_GAP)
          ctx.drawImage(questionCanvas, H_GAP, V_GAP)
          ctx.drawImage(answerCanvas, H_GAP, qH + V_GAP + CANVAS_V_GAP)

          ctx.fillStyle = footerBg
          ctx.fillRect(
            0,
            qH + aH + V_GAP * 2 + CANVAS_V_GAP,
            width,
            fH + CANVAS_V_GAP
          )
          ctx.drawImage(
            footerCanvas,
            width - fW - H_GAP,
            qH + aH + V_GAP * 2 + CANVAS_V_GAP * 2 - MORE_BOTTOM
          )

          url = combinedCanvas.toDataURL() || ""
        }
        break
      }
    }

    const timeStamp = new Date().getTime()
    url && download(url, `summary_${timeStamp}.${type}`)
  }

  return (
    <footer
      className="action"
      aria-label={$t("sidepanel_chat_action_description")}
      data-html2canvas-ignore="true">
      <IconButton
        role="button"
        title={$t("sidepanel_chat_action_regenerate_title")}
        aria-label={$t("sidepanel_chat_action_regenerate_title")}
        onClick={onRegenerate}>
        <Icon>refresh</Icon>
      </IconButton>

      <IconButton
        ref={copyButtonRef}
        role="button"
        title={$t("sidepanel_chat_action_copy_title")}
        aria-label={$t("sidepanel_chat_action_copy_title")}
        data-clipboard-text={content}>
        {copyStatus === CopyStatus.UnCopy ? (
          <Icon>content_copy</Icon>
        ) : copyStatus === CopyStatus.Success ? (
          <Icon style={{ color: "darkgreen" }}>check</Icon>
        ) : (
          <Icon style={{ color: "var(--md-sys-color-error)" }}>close</Icon>
        )}
      </IconButton>

      <IconButton
        role="button"
        title={
          isSpeaking
            ? $t("sidepanel_chat_action_stop_speaking_title")
            : $t("sidepanel_chat_action_speaking_title")
        }
        aria-label={
          isSpeaking
            ? $t("sidepanel_chat_action_stop_speaking_title")
            : $t("sidepanel_chat_action_speaking_title")
        }
        onClick={onStartSpeak}>
        {isSpeaking ? <Icon>stop_circle</Icon> : <Icon>volume_up</Icon>}
      </IconButton>

      <span style={{ position: "relative" }}>
        <IconButton
          id="download-anchor"
          role="button"
          title={$t("sidepanel_chat_action_download_title")}
          aria-label={$t("sidepanel_chat_action_download_title")}
          onClick={onToggleDownloadMenu}>
          <Icon>download</Icon>
        </IconButton>

        <Menu
          id="download-menu"
          anchor="download-anchor"
          aria-label={$t("sidepanel_chat_action_download_menu_title")}
          open={downloadMenuOpen}
          onClosed={() => setDownloadMenuOpen(false)}>
          {DOWNLOAD_MENU.map((type) => {
            return (
              <MenuItem
                key={type}
                aria-label={$t(
                  "sidepanel_chat_action_download_menu_type_title",
                  [type]
                )}
                onClick={() => onSelectDownloadType(type)}>
                <Icon slot="start">{ImageMap[type]}</Icon>
                <span slot="headline">{type}</span>
              </MenuItem>
            )
          })}
        </Menu>
      </span>
    </footer>
  )
}

export default MessageAction
