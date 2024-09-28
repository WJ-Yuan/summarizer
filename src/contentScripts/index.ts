import { isProbablyReaderable, Readability } from "@mozilla/readability"
import DOMPurify from "dompurify"
import TurndownService from "turndown"
import { gfm } from "turndown-plugin-gfm"

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

const html2md = (html: string) => {
  const turndownService = new TurndownService({
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    preformattedCode: true
  })

  turndownService.use(gfm)
  turndownService.remove(["meta", "link", "style", "script"])

  const markdown = turndownService.turndown(html) || ""

  return markdown.trim()
}

const getWebPageMarkdown = () => {
  const html = getHTML()
  const md = html2md(html)
  return md
}

window.__summarizer_markdown =
  DOMPurify().sanitize(window.getSelection()?.toString() || "") ||
  getWebPageMarkdown()
