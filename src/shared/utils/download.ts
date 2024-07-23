import html2canvas, { Options } from "@html2canvas/html2canvas"

const TYPE_MAP = {
  txt: "text/plain",
  markdown: "text/markdown",
  json: "application/json"
}

export const generateText = (
  type: "txt" | "markdown" | "json",
  content: string
) => {
  const blob = new Blob([content], { type: TYPE_MAP[type] })
  const url = URL.createObjectURL(blob)
  return url
}

export const generateCanvasImage = async (
  el: HTMLElement,
  bgColor: string,
  extraOptions: Omit<
    Partial<Options>,
    "allowTaint" | "useCORS" | "backgroundColor"
  >
) => {
  try {
    const canvas = await html2canvas(el, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: bgColor,
      ...extraOptions
    })

    return canvas
  } catch (e) {
    console.error(e)
    return null
  }
}

export const download = (url: string, filename: string) => {
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const readFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target!.result
      resolve(text as string)
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsText(file, "utf-8")
  })
}
export const exportJson = (table: Record<string, any>[], filename: string) => {
  const json = JSON.stringify(
    {
      data: table
    },
    null,
    2
  )

  const url = generateText("json", json)
  download(url, `${filename}-${new Date().getTime()}.json`)
}
