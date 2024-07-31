import type { Advanced, Filter, Tab } from "Common"
import browser, { storage } from "webextension-polyfill"
import { StorageKey } from "../constants"
import { isUrlFitRule } from "./validate"

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return function (this: any, ...args: Parameters<T>): void {
    const context = this

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  } as T
}

export const filterSensitiveInfo = async (prompt: string) => {
  try {
    let filterPrompt = prompt
    const _storage = await storage.local.get({
      [StorageKey.SensitiveFilter]: []
    })
    const filters = _storage[StorageKey.SensitiveFilter] || []

    if (filters && filters.length) {
      filters.forEach((filter: Filter) => {
        filterPrompt = filterPrompt.replaceAll(
          filter.sensitive,
          filter.replacement || "*****"
        )
      })
    }

    return filterPrompt
  } catch {
    return ""
  }
}

export const getContentScript = async (
  tabUrl: string
): Promise<[boolean, string, Function]> => {
  const _storage = await storage.local.get({
    [StorageKey.AdvancedRule]: []
  })
  const rules = _storage[StorageKey.AdvancedRule] as Array<Advanced>

  if (rules && rules.length) {
    const rule = rules.find((item) => isUrlFitRule(item.url, tabUrl))
    if (rule) {
      return [
        true,
        rule.javascript, // @ts-ignore
        async (code) => {
          const selection = window.getSelection()?.toString()
          if (selection?.trim().length) {
            return selection
          } // @ts-ignore
          const interpreter = new Sval({
            ecmaVer: "latest",
            sourceType: "script"
          })
          interpreter.run(`exports.userScript = ${code}`)
          const result = interpreter.exports.userScript()
          return result
        }
      ]
    }
  }

  return [
    false,
    "",
    () => {
      const md = window.__summary_markdown
      window.__summary_markdown = ""
      return md
    }
  ]
}

export const getMarkdown = async (tab: Tab) => {
  const tabId = tab.id
  const tabUrl = tab.url!
  const [isUserScript, code, scriptFunc] = await getContentScript(tabUrl)

  if (!isUserScript) {
    await browser.scripting.executeScript({
      files: ["dist/contentScripts/index.global.js"],
      target: {
        tabId
      }
    })
  } else {
    await browser.scripting.executeScript({
      target: {
        tabId
      },
      files: ["assets/third_party/sval.min.js"]
    })
  }

  const [{ result }] = await browser.scripting.executeScript({
    target: {
      tabId
    },
    func: scriptFunc as (...args: any[]) => any,
    args: [code]
  })

  return result
}
