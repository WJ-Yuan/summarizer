import { isProbablyReaderable, Readability } from "@mozilla/readability"
import DOMPurify from "dompurify"
import html2md from "html-to-md"

declare global {
  interface Window {
    __summary_markdown: string
  }
}

const getHTML = (): string => {
  let html: string
  const cloneNode = document.cloneNode(true) as Document
  const isReadable = isProbablyReaderable(cloneNode)

  if (isReadable) {
    const { content } = new Readability(cloneNode).parse()!
    html = content
  } else {
    html = DOMPurify().sanitize(cloneNode.body)
  }

  return html
}

const getWebPageMarkdown = () => {
  const html = getHTML()
  const md = html2md(html)
  return md
}

window.__summary_markdown =
  DOMPurify().sanitize(window.getSelection()?.toString() || "") ||
  getWebPageMarkdown()
